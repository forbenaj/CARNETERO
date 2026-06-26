#!/usr/bin/env python3
"""Extract patient data from appointment CSV exports.

Reads every CSV in ``turnos/`` and writes static-site friendly outputs in
``data/``. The identity key is DNI; rows with invalid or missing DNI are kept
in review files instead of being merged into the patient list.
"""

from __future__ import annotations

import csv
import json
import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
TURNOS_DIR = ROOT / "turnos"
OUTPUT_DIR = ROOT / "data"

OFFICIAL_DOC_TYPES = {
    "DNI",
    "LC",
    "LE",
    "CI",
    "PAS",
    "PASAPORTE",
}

NON_PATIENT_MARKERS = {
    "HOY",
    "LIBRE",
    "PACIENTE",
    "PROXIMO TURNO",
    "PRÓXIMO TURNO",
    "NOMBRE Y APELLIDO",
    "NOMBRE Y APELLIDO PTE",
    "NOMBRE Y APELLIDO PTE.",
}


@dataclass(frozen=True)
class ExtractedRow:
    dni: str
    tipo_documento: str
    nombre_completo: str
    telefono: str
    obra_social: str
    numero_beneficio: str
    grado_parental: str
    source_file: str
    source_line: int


def clean(value: str | None) -> str:
    text = (value or "").replace("\ufeff", "")
    text = text.replace("\r", " ").replace("\n", " ").replace("\t", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip().strip('"').strip()


def strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def normalize_text(value: str | None) -> str:
    text = strip_accents(clean(value)).upper()
    text = re.sub(r"\s+", " ", text)
    return text.strip(" ,;")


def normalize_doc_type(value: str | None) -> str:
    text = normalize_text(value).replace(".", "")
    compact = re.sub(r"\s+", "", text)
    if compact in OFFICIAL_DOC_TYPES:
        return compact
    if compact.startswith("DN"):
        return "DNI"
    return text


def only_digits(value: str | None) -> str:
    text = clean(value)
    if re.fullmatch(r"\d+\.0+", text):
        text = text.split(".", 1)[0]
    return re.sub(r"\D", "", text)


def normalize_grade(value: str | None) -> str:
    digits = only_digits(value)
    if digits == "0":
        return "00"
    if len(digits) == 1:
        return f"0{digits}"
    return digits


def valid_dni(dni: str) -> bool:
    if not 5 <= len(dni) <= 9:
        return False
    return dni not in {"00000", "000000", "0000000", "00000000", "99999999"}


def is_probable_header_or_empty(row: list[str]) -> bool:
    first_cells = [normalize_text(cell) for cell in row[:7] if clean(cell)]
    if not first_cells:
        return True
    first = first_cells[0]
    if any(first.startswith(marker) for marker in NON_PATIENT_MARKERS):
        return True
    return all(cell in NON_PATIENT_MARKERS for cell in first_cells)


def row_review_reason(row: list[str], dni: str, doc_type: str, name: str) -> str | None:
    if is_probable_header_or_empty(row):
        return "no_paciente"
    if not name:
        return "nombre_vacio"
    if not dni:
        return "dni_vacio"
    if not valid_dni(dni):
        return "dni_invalido"
    if doc_type and doc_type not in OFFICIAL_DOC_TYPES:
        return "tipo_documento_raro"
    return None


def iter_csv_rows() -> Iterable[tuple[Path, int, list[str]]]:
    for path in sorted(TURNOS_DIR.glob("*.csv")):
        with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
            reader = csv.reader(handle)
            for line_number, row in enumerate(reader, start=1):
                yield path, line_number, [clean(cell) for cell in row]


def is_patient_row(row: list[str], dni: str, doc_type: str, name: str) -> bool:
    if is_probable_header_or_empty(row):
        return False
    if not name or not valid_dni(dni):
        return False
    if doc_type in OFFICIAL_DOC_TYPES:
        return True
    # Keep rows where the document is strong even if the type cell is dirty.
    return bool(doc_type) and len(dni) >= 7


def split_full_name(full_name: str) -> dict[str, str]:
    if "," in full_name:
        last, first = full_name.split(",", 1)
        return {"apellido": clean(last), "nombre": clean(first)}

    parts = full_name.split()
    if not parts:
        return {"apellido": "", "nombre": ""}
    return {"apellido": parts[0], "nombre": " ".join(parts[1:])}


def quality_score(value: str) -> tuple[int, int, int, str]:
    text = normalize_text(value)
    bad_chars = sum(text.count(char) for char in ("�", "/", "(", ")", "?"))
    word_count = len(text.split())
    return (-bad_chars, word_count, len(text), text)


def choose_best(values: Iterable[str]) -> str:
    counts = Counter(value for value in values if value)
    if not counts:
        return ""
    return max(counts, key=lambda value: (counts[value], quality_score(value)))


def choose_obra_social(values: Iterable[str]) -> str:
    counts = Counter(value for value in values if value)
    if not counts:
        return ""
    return max(
        counts,
        key=lambda value: (
            "/" in value,
            counts[value],
            quality_score(value),
        ),
    )


def choose_beneficio(values: Iterable[str]) -> str:
    counts = Counter(value for value in values if value and len(value) <= 14)
    if not counts:
        return ""
    return max(
        counts,
        key=lambda value: (
            counts[value],
            6 <= len(value) <= 14,
            -abs(len(value) - 12),
            -len(value),
        ),
    )


def choose_grado_parental(values: Iterable[str]) -> str:
    counts = Counter(value for value in values if value and len(value) <= 2)
    if not counts:
        return ""
    return max(counts, key=lambda value: (counts[value], value == "00", value))


def unique_sorted(values: Iterable[str]) -> list[str]:
    return sorted({value for value in values if value})


def unique_by_key(items: Iterable[dict], key_fields: tuple[str, ...]) -> list[dict]:
    seen: set[tuple] = set()
    result: list[dict] = []
    for item in items:
        key = tuple(item.get(field, "") for field in key_fields)
        if key in seen or not any(key):
            continue
        seen.add(key)
        result.append(item)
    return result


def extract_rows() -> tuple[list[ExtractedRow], list[dict], Counter, dict[str, Counter]]:
    accepted: list[ExtractedRow] = []
    review: list[dict] = []
    stats: Counter = Counter()
    stats_by_file: dict[str, Counter] = defaultdict(Counter)

    for path, line_number, raw_row in iter_csv_rows():
        stats["rows_read"] += 1
        stats_by_file[path.name]["rows_read"] += 1

        row = raw_row + [""] * max(0, 7 - len(raw_row))
        name = normalize_text(row[0])
        phone = clean(row[1])
        doc_type = normalize_doc_type(row[2])
        dni = only_digits(row[3])
        obra_social = normalize_text(row[4])
        benefit = only_digits(row[5])
        grade = normalize_grade(row[6])

        if is_patient_row(row, dni, doc_type, name):
            accepted.append(
                ExtractedRow(
                    dni=dni,
                    tipo_documento=doc_type,
                    nombre_completo=name,
                    telefono=phone,
                    obra_social=obra_social,
                    numero_beneficio=benefit,
                    grado_parental=grade,
                    source_file=path.name,
                    source_line=line_number,
                )
            )
            stats["rows_accepted"] += 1
            stats_by_file[path.name]["rows_accepted"] += 1
            continue

        reason = row_review_reason(row, dni, doc_type, name)
        if reason and reason != "no_paciente":
            review.append(
                {
                    "reason": reason,
                    "file": path.name,
                    "line": line_number,
                    "nombreCompleto": name,
                    "telefono": phone,
                    "tipoDocumento": doc_type,
                    "dni": dni,
                    "obraSocial": obra_social,
                    "numeroBeneficio": benefit,
                    "gradoParental": grade,
                    "rawFirstColumns": raw_row[:7],
                }
            )
            stats[f"review_{reason}"] += 1
            stats_by_file[path.name][f"review_{reason}"] += 1
        elif reason == "no_paciente":
            stats["rows_ignored_non_patient"] += 1
            stats_by_file[path.name]["rows_ignored_non_patient"] += 1

    return accepted, review, stats, stats_by_file


def build_patient(dni: str, rows: list[ExtractedRow]) -> dict:
    canonical_name = choose_best(row.nombre_completo for row in rows)
    name_parts = split_full_name(canonical_name)
    aliases = [name for name in unique_sorted(row.nombre_completo for row in rows) if name != canonical_name]
    doc_types = unique_sorted(row.tipo_documento for row in rows)
    official_doc_types = [doc_type for doc_type in doc_types if doc_type in OFFICIAL_DOC_TYPES]
    obra_sociales = unique_sorted(row.obra_social for row in rows)
    beneficio_variants = unique_sorted(row.numero_beneficio for row in rows)
    grados_parentales = unique_sorted(row.grado_parental for row in rows)

    sources = unique_by_key(
        (
            {
                "file": row.source_file,
                "line": row.source_line,
            }
            for row in rows
        ),
        ("file", "line"),
    )

    warnings: list[str] = []
    if aliases:
        warnings.append("nombre_con_variantes")
    if len(doc_types) > 1:
        warnings.append("tipo_documento_con_variantes")
    if any(doc_type not in OFFICIAL_DOC_TYPES for doc_type in doc_types):
        warnings.append("tipo_documento_raro")
    if any("�" in row.nombre_completo for row in rows):
        warnings.append("caracteres_invalidos_en_nombre")
    if len(obra_sociales) > 1:
        warnings.append("obra_social_con_variantes")
    if len(beneficio_variants) > 1:
        warnings.append("beneficio_con_variantes")
    if beneficio_variants and not choose_beneficio(row.numero_beneficio for row in rows):
        warnings.append("beneficio_invalido")
    if len(grados_parentales) > 1:
        warnings.append("grado_parental_con_variantes")

    return {
        "dni": dni,
        "tipoDocumento": choose_best(official_doc_types) or "DNI",
        "tipoDocumentoOriginales": doc_types,
        "nombreCompleto": canonical_name,
        "apellido": name_parts["apellido"],
        "nombre": name_parts["nombre"],
        "aliases": aliases,
        "telefonos": unique_sorted(row.telefono for row in rows),
        "obraSocial": choose_obra_social(row.obra_social for row in rows),
        "beneficio": choose_beneficio(row.numero_beneficio for row in rows),
        "gradoParental": choose_grado_parental(row.grado_parental for row in rows),
        "sources": sources,
        "recordsCount": len(rows),
        "warnings": warnings,
    }


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_js(path: Path, variable_name: str, data) -> None:
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    path.write_text(f"window.{variable_name} = {payload};\n", encoding="utf-8")


def write_review_csv(path: Path, rows: list[dict]) -> None:
    fieldnames = [
        "reason",
        "file",
        "line",
        "nombreCompleto",
        "telefono",
        "tipoDocumento",
        "dni",
        "obraSocial",
        "numeroBeneficio",
        "gradoParental",
        "rawFirstColumns",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            out = dict(row)
            out["rawFirstColumns"] = json.dumps(out["rawFirstColumns"], ensure_ascii=False)
            writer.writerow(out)


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    extracted_rows, review_rows, stats, stats_by_file = extract_rows()
    grouped: dict[str, list[ExtractedRow]] = defaultdict(list)
    for row in extracted_rows:
        grouped[row.dni].append(row)

    patients = [build_patient(dni, rows) for dni, rows in grouped.items()]
    patients.sort(key=lambda patient: (patient["nombreCompleto"], patient["dni"]))
    patients_by_dni = {patient["dni"]: patient for patient in sorted(patients, key=lambda item: item["dni"])}

    stats.update(
        {
            "unique_patients": len(patients),
            "patients_with_duplicates": sum(1 for rows in grouped.values() if len(rows) > 1),
            "patients_with_name_aliases": sum(1 for patient in patients if patient["aliases"]),
            "review_rows": len(review_rows),
        }
    )

    report = {
        "generatedFrom": str(TURNOS_DIR.relative_to(ROOT)),
        "outputs": {
            "patients": "data/pacientes.json",
            "patientsByDni": "data/pacientes_por_dni.json",
            "patientsJs": "data/pacientes.js",
            "reviewCsv": "data/pacientes_revisar.csv",
            "reviewJson": "data/pacientes_revisar.json",
        },
        "stats": dict(stats),
        "byFile": {name: dict(counter) for name, counter in sorted(stats_by_file.items())},
    }

    write_json(OUTPUT_DIR / "pacientes.json", patients)
    write_json(OUTPUT_DIR / "pacientes_por_dni.json", patients_by_dni)
    write_js(OUTPUT_DIR / "pacientes.js", "CARNETERO_PACIENTES", patients)
    write_json(OUTPUT_DIR / "pacientes_revisar.json", review_rows)
    write_review_csv(OUTPUT_DIR / "pacientes_revisar.csv", review_rows)
    write_json(OUTPUT_DIR / "pacientes_report.json", report)

    print(json.dumps(report["stats"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

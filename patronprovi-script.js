
    const patients = Array.isArray(window.CARNETERO_PACIENTES)
      ? window.CARNETERO_PACIENTES
      : [];

    const state = {
      query: "",
      page: 1,
      pageSize: 5,
      filtered: [],
      activeIndex: null,
      pinnedIndex: null,
      manualQrActive: false,
      manualQrValue: "",
      theme: localStorage.getItem("carnetero-theme") || "light"
    };

    const els = {
      searchInput: document.getElementById("searchInput"),
      pageSize: document.getElementById("pageSize"),
      body: document.getElementById("patientsBody"),
      tableWrap: document.getElementById("tableWrap"),
      empty: document.getElementById("emptyState"),
      detailPanel: document.getElementById("detailPanel"),
      pageLabel: document.getElementById("pageLabel"),
      prevPage: document.getElementById("prevPage"),
      nextPage: document.getElementById("nextPage"),
      helpButton: document.getElementById("helpButton"),
      helpDialog: document.getElementById("helpDialog"),
      helpClose: document.getElementById("helpClose"),
      themeToggle: document.getElementById("themeToggle")
    };

    const searchablePatients = patients.map((patient, index) => ({
      index,
      patient,
      searchText: normalize([
        patient.dni,
        patient.tipoDocumento,
        patient.nombreCompleto,
        patient.apellido,
        patient.nombre,
        ...(patient.telefonos || []),
        patient.obraSocial,
        patient.beneficio,
        patient.gradoParental
      ].filter(Boolean).join(" "))
    }));

    function normalize(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
    }

    function normalizeBeneficio(value) {
      const cleanValue = String(value || "").trim().replace(/[.\s]/g, "");

      if (/^\d{11,12}-\d{2}$/.test(cleanValue)) {
        return cleanValue;
      }

      if (/^\d{11,12}$/.test(cleanValue)) {
        return cleanValue + "-00";
      }

      if (/^\d{13}$/.test(cleanValue)) {
        return cleanValue.slice(0, 11) + "-" + cleanValue.slice(11);
      }

      if (/^\d{14}$/.test(cleanValue)) {
        return cleanValue.slice(0, 12) + "-" + cleanValue.slice(12);
      }

      return null;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function uniqueValues(values) {
      return [...new Set((values || []).filter(Boolean))];
    }

    function compactList(values, limit = 3) {
      const valuesList = uniqueValues(values);
      const visible = valuesList.slice(0, limit);
      const hiddenCount = Math.max(0, valuesList.length - visible.length);
      const html = visible.map((value) => `<span class="chip">${escapeHtml(value)}</span>`).join("");
      return hiddenCount ? `${html}<span class="chip">+${hiddenCount}</span>` : html || '<span class="muted"></span>';
    }

    function fullList(values, emptyText = "Sin datos") {
      const valuesList = uniqueValues(values);
      return valuesList.length
        ? valuesList.map((value) => `<span class="chip">${escapeHtml(value)}</span>`).join("")
        : `<span class="muted">${emptyText}</span>`;
    }

    function valueOrEmpty(value, emptyText = "") {
      return value ? escapeHtml(value) : `<span class="muted">${emptyText}</span>`;
    }

    function buildQrBenefit(patient) {
      const beneficio = String(patient.beneficio || "").trim();
      const grado = String(patient.gradoParental || "").trim();
      let normalizedBenefit = null;

      if (/^\d{11,12}$/.test(beneficio) && /^\d{1,2}$/.test(grado)) {
        normalizedBenefit = normalizeBeneficio(`${beneficio}-${grado.padStart(2, "0")}`);
      } else {
        normalizedBenefit = normalizeBeneficio(beneficio);
      }

      return normalizedBenefit ? normalizedBenefit.replace("-", "") : null;
    }

    function normalizeQrBenefitInput(value) {
      const normalizedBenefit = normalizeBeneficio(value);
      return normalizedBenefit ? normalizedBenefit.replace("-", "") : null;
    }

    function getQrBenefitForPreview(value) {
      const cleanValue = String(value || "").trim().replace(/[.\s-]/g, "");
      return normalizeQrBenefitInput(value) || cleanValue;
    }

    function buildQrUrl(value) {
      const qrValue = String(value || "").trim();
      return qrValue
        ? `https://image-charts.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(qrValue)}`
        : "";
    }

    function renderQrBox(value) {
      const qrValue = String(value || "");
      const qrUrl = buildQrUrl(qrValue);

      return `
        <section class="qr-box" aria-label="QR de beneficio">
          <div class="qr-frame" data-qr-frame>
            ${qrUrl ? `<img class="qr-image" src="${qrUrl}" alt="QR del beneficio ${escapeHtml(qrValue)}">` : ""}
          </div>
          <div>
            <label class="qr-title" for="qrBenefitInput">QR de beneficio</label>
            <input
              class="qr-input mono"
              id="qrBenefitInput"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              spellcheck="false"
              value="${escapeHtml(qrValue)}"
            >
          </div>
        </section>
      `;
    }

    function applyTheme() {
      const isDark = state.theme === "dark";
      document.documentElement.dataset.theme = state.theme;
      els.themeToggle.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
      els.themeToggle.setAttribute("aria-pressed", String(isDark));
      localStorage.setItem("carnetero-theme", state.theme);
    }

    function applySearch() {
      const terms = normalize(state.query).split(" ").filter(Boolean);
      if (!terms.length) {
        state.filtered = searchablePatients;
      } else {
        state.filtered = searchablePatients.filter((item) =>
          terms.every((term) => item.searchText.includes(term))
        );
      }
      state.page = 1;
      clearSelection();
      render();
    }

    function clearSelection() {
      state.activeIndex = null;
      state.pinnedIndex = null;
      updateRowStates();
      renderDetail();
    }

    function clearPreview() {
      if (Number.isInteger(state.pinnedIndex)) {
        return;
      }
      state.activeIndex = null;
      updateRowStates();
      renderDetail();
    }

    function render() {
      const total = state.filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
      state.page = Math.min(Math.max(1, state.page), totalPages);

      const start = (state.page - 1) * state.pageSize;
      const pageItems = state.filtered.slice(start, start + state.pageSize);

      els.body.innerHTML = pageItems.map(renderPatientRow).join("");
      els.pageLabel.textContent = `Pagina ${state.page.toLocaleString("es-AR")} de ${totalPages.toLocaleString("es-AR")}`;
      els.prevPage.disabled = state.page <= 1;
      els.nextPage.disabled = state.page >= totalPages;
      els.tableWrap.style.display = total ? "block" : "none";
      els.empty.style.display = total ? "none" : "block";
      updateRowStates();
      renderDetail();
    }

    function renderPatientRow(item) {
      const patient = item.patient;
      const warnings = (patient.warnings || []).length
        ? `<div class="warnings">${escapeHtml(patient.warnings.join(", "))}</div>`
        : "";
      const isActive = item.index === state.activeIndex;
      const isPinned = item.index === state.pinnedIndex;

      return `
        <tr class="${isActive ? "is-active" : ""} ${isPinned ? "is-pinned" : ""}" data-index="${item.index}" tabindex="0">
          <td class="name" data-label="Nombre">
            ${escapeHtml(patient.nombreCompleto)}
            ${warnings}
          </td>
          <td data-label="Telefono"><div class="chips">${compactList(patient.telefonos, 3)}</div></td>
          <td class="mono" data-label="Tipo DNI">${valueOrEmpty(patient.tipoDocumento)}</td>
          <td class="mono dni-cell" data-label="Num DNI">${escapeHtml(patient.dni)}</td>
          <td data-label="Obra social">${valueOrEmpty(patient.obraSocial)}</td>
          <td class="mono" data-label="Beneficio">${valueOrEmpty(patient.beneficio)}</td>
          <td class="mono" data-label="Grado parental">${valueOrEmpty(patient.gradoParental)}</td>
        </tr>
      `;
    }

    function renderDetail() {
      const patient = Number.isInteger(state.activeIndex) ? patients[state.activeIndex] : null;
      const isPinned = Number.isInteger(state.pinnedIndex) && state.pinnedIndex === state.activeIndex;
      const isManualQr = !patient && state.manualQrActive;
      els.detailPanel.classList.toggle("is-pinned", isPinned);
      els.detailPanel.classList.toggle("has-manual-qr", isManualQr);

      if (!patient) {
        els.detailPanel.innerHTML = `
          <section>
            <div class="detail-header is-empty" aria-hidden="true"></div>

            <div class="detail-content">
              ${renderQrBox(isManualQr ? state.manualQrValue : "")}

              <section class="detail-grid" aria-label="Detalle sin paciente seleccionado">
                ${emptyDetailItem()}
                ${emptyDetailItem()}
                ${emptyDetailItem()}
                ${emptyDetailItem()}
                ${emptyDetailItem()}
                ${emptyDetailItem()}
                ${emptyDetailItem(true)}
                ${emptyDetailItem(true)}
                ${emptyDetailItem(true)}
                ${emptyDetailItem(true)}
                ${emptyDetailItem(true, true)}
              </section>
            </div>
          </section>
        `;
        return;
      }

      const qrBenefit = buildQrBenefit(patient);
      const sources = (patient.sources || []).length
        ? patient.sources.map((source) => `
            <li>
              <strong>${escapeHtml(source.file || "Archivo")}</strong>
              <span>Linea ${escapeHtml(source.line || "")}</span>
            </li>
          `).join("")
        : '<li><strong>Sin fuentes</strong><span></span></li>';
      const warnings = (patient.warnings || []).length
        ? patient.warnings.map((warning) => `<span class="chip">${escapeHtml(warning)}</span>`).join("")
        : '<span class="muted">Sin avisos</span>';

      els.detailPanel.innerHTML = `
        <section>
          <div class="detail-header">
            <button class="detail-close" type="button" id="detailClose" aria-label="Cerrar detalle">×</button>
            <h2 class="detail-title">${escapeHtml(patient.nombreCompleto)}</h2>
            <p class="detail-subtitle">${escapeHtml(patient.apellido || "Sin apellido")} / ${escapeHtml(patient.nombre || "Sin nombre")}</p>
          </div>

          <div class="detail-content">
            ${renderQrBox(qrBenefit || "")}

            <section class="detail-grid">
              ${detailItem("Obra social", patient.obraSocial, false, "mobile-detail")}
              ${detailItem("Beneficio + Grad parental", [patient.beneficio, patient.gradoParental].filter(Boolean).join(" / "), true, "mobile-detail")}
              <div class="detail-wide mobile-detail">
                <p class="detail-label">Telefonos</p>
                <div class="chips">${fullList(patient.telefonos)}</div>
              </div>
              ${detailItem("Tipo DNI", patient.tipoDocumento, true, "desktop-detail")}
              ${detailItem("DNI", patient.dni, true, "desktop-detail")}
              ${detailItem("Obra social", patient.obraSocial, false, "desktop-detail")}
              ${detailItem("Beneficio", patient.beneficio, true, "desktop-detail")}
              ${detailItem("Grado parental", patient.gradoParental, true, "desktop-detail")}
              ${detailItem("Registros", patient.recordsCount || 0, true, "desktop-detail")}
              <div class="detail-wide desktop-detail">
                <p class="detail-label">Telefonos</p>
                <div class="chips">${fullList(patient.telefonos)}</div>
              </div>
              <div class="detail-wide desktop-detail">
                <p class="detail-label">Alias</p>
                <div class="chips">${fullList(patient.aliases)}</div>
              </div>
              <div class="detail-wide desktop-detail">
                <p class="detail-label">Tipos DNI originales</p>
                <div class="chips">${fullList(patient.tipoDocumentoOriginales)}</div>
              </div>
              <div class="detail-wide desktop-detail">
                <p class="detail-label">Avisos</p>
                <div class="chips">${warnings}</div>
              </div>
              <div class="detail-wide desktop-detail">
                <p class="detail-label">Fuentes</p>
                <ul class="source-list">${sources}</ul>
              </div>
            </section>
          </div>
        </section>
      `;
    }

    function detailItem(label, value, mono = false, className = "") {
      return `
        <div class="detail-item ${escapeHtml(className)}">
          <p class="detail-label">${escapeHtml(label)}</p>
          <p class="detail-value ${mono ? "mono" : ""}">${valueOrEmpty(value, "Sin datos")}</p>
        </div>
      `;
    }

    function emptyDetailItem(wide = false, tall = false) {
      return `<div class="${wide ? "detail-wide" : "detail-item"} is-empty ${tall ? "is-tall" : ""}" aria-hidden="true"></div>`;
    }

    function updateQrPreview(input) {
      const frame = input.closest(".qr-box").querySelector("[data-qr-frame]");
      const qrValue = getQrBenefitForPreview(input.value);
      const qrUrl = buildQrUrl(qrValue);
      frame.innerHTML = qrUrl
        ? `<img class="qr-image" src="${qrUrl}" alt="QR del beneficio ${escapeHtml(qrValue)}">`
        : "";
    }

    function deselectPatientForQrEdit(input) {
      state.manualQrActive = true;
      state.manualQrValue = input.value;

      if (!Number.isInteger(state.activeIndex) && !Number.isInteger(state.pinnedIndex)) {
        els.detailPanel.classList.add("has-manual-qr");
        return;
      }

      state.activeIndex = null;
      state.pinnedIndex = null;
      updateRowStates();
      els.detailPanel.classList.remove("is-pinned");
      els.detailPanel.classList.add("has-manual-qr");

      const header = els.detailPanel.querySelector(".detail-header");
      if (header) {
        header.classList.add("is-empty");
        header.setAttribute("aria-hidden", "true");
        header.innerHTML = "";
      }
    }

    function normalizeQrInputDisplay(input) {
      const normalizedValue = normalizeQrBenefitInput(input.value);
      if (normalizedValue) {
        input.value = normalizedValue;
      }
      state.manualQrValue = input.value;
      updateQrPreview(input);
    }

    function updateRowStates() {
      els.body.querySelectorAll("tr[data-index]").forEach((row) => {
        const index = Number(row.dataset.index);
        row.classList.toggle("is-active", index === state.activeIndex);
        row.classList.toggle("is-pinned", index === state.pinnedIndex);
      });
    }

    function setActivePatient(index, shouldPin) {
      state.manualQrActive = false;
      state.manualQrValue = "";
      state.activeIndex = index;
      if (shouldPin) {
        state.pinnedIndex = index;
      }
      updateRowStates();
      renderDetail();
    }

    function closeHelpDialog() {
      if (typeof els.helpDialog.close === "function") {
        els.helpDialog.close();
      } else {
        els.helpDialog.removeAttribute("open");
      }
    }

    els.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      applySearch();
    });

    els.pageSize.addEventListener("change", (event) => {
      state.pageSize = Math.min(50, Math.max(5, Number(event.target.value) || 5));
      state.page = 1;
      clearSelection();
      render();
    });

    els.prevPage.addEventListener("click", () => {
      state.page -= 1;
      clearSelection();
      render();
    });

    els.nextPage.addEventListener("click", () => {
      state.page += 1;
      clearSelection();
      render();
    });

    els.body.addEventListener("mouseover", (event) => {
      const row = event.target.closest("tr[data-index]");
      if (!row || Number.isInteger(state.pinnedIndex)) {
        return;
      }
      setActivePatient(Number(row.dataset.index), false);
    });

    els.body.addEventListener("focusin", (event) => {
      const row = event.target.closest("tr[data-index]");
      if (!row || Number.isInteger(state.pinnedIndex)) {
        return;
      }
      setActivePatient(Number(row.dataset.index), false);
    });

    els.body.addEventListener("mouseleave", () => {
      clearPreview();
    });

    els.body.addEventListener("click", (event) => {
      const row = event.target.closest("tr[data-index]");
      if (!row) {
        return;
      }
      setActivePatient(Number(row.dataset.index), true);
    });

    els.body.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      const row = event.target.closest("tr[data-index]");
      if (!row) {
        return;
      }
      event.preventDefault();
      setActivePatient(Number(row.dataset.index), true);
    });

    document.addEventListener("click", (event) => {
      const clickedBackground = event.target === document.body || event.target.classList.contains("app");
      if (clickedBackground && Number.isInteger(state.pinnedIndex)) {
        clearSelection();
      }
    });

    els.detailPanel.addEventListener("click", (event) => {
      if (event.target.closest("#detailClose")) {
        clearSelection();
      }
    });

    els.detailPanel.addEventListener("input", (event) => {
      if (event.target.matches("#qrBenefitInput")) {
        deselectPatientForQrEdit(event.target);
        updateQrPreview(event.target);
      }
    });

    els.detailPanel.addEventListener("blur", (event) => {
      if (event.target.matches("#qrBenefitInput")) {
        normalizeQrInputDisplay(event.target);
      }
    }, true);

    els.themeToggle.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
    });

    els.helpButton.addEventListener("click", () => {
      if (typeof els.helpDialog.showModal === "function") {
        els.helpDialog.showModal();
      } else {
        els.helpDialog.setAttribute("open", "");
      }
    });

    els.helpClose.addEventListener("click", () => {
      closeHelpDialog();
    });

    els.helpDialog.addEventListener("click", (event) => {
      if (event.target === els.helpDialog) {
        closeHelpDialog();
      }
    });

    applyTheme();
    applySearch();

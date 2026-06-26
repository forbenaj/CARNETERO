from __future__ import annotations

import argparse
from html.parser import HTMLParser
import http.cookiejar
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request


BASE_URL = "https://www.pami.org.ar/"
LOGIN_PATH = "mi-cartilla/login"
VALIDATE_PATH = "mi-cartilla/validar-datos-afiliado"
INICIO_PATH = "mi-cartilla/inicio"

TEST_AFILIADO = "00000000"
TEST_DNI = "123456"


class AffiliateNameParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._capture_h5 = False
        self._parts: list[str] = []
        self.name: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.name is not None or tag.lower() != "h5":
            return

        attr_map = {key.lower(): value or "" for key, value in attrs}
        classes = set(attr_map.get("class", "").lower().split())
        if {"cyan", "h5_responsive"}.issubset(classes):
            self._capture_h5 = True
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._capture_h5:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self._capture_h5 and tag.lower() == "h5":
            candidate = " ".join("".join(self._parts).split())
            self.name = candidate or None
            self._capture_h5 = False


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def build_opener(allow_redirects: bool = True) -> urllib.request.OpenerDirector:
    cookie_jar = http.cookiejar.CookieJar()
    handlers = [urllib.request.HTTPCookieProcessor(cookie_jar)]
    if not allow_redirects:
        handlers.append(NoRedirectHandler())
    opener = urllib.request.build_opener(*handlers)
    opener.addheaders = [
        ("User-Agent", "pami-cartilla-test-harness/1.0"),
        ("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
    ]
    return opener


def read_response(opener: urllib.request.OpenerDirector, request: urllib.request.Request):
    try:
        with opener.open(request, timeout=15) as response:
            return {
                "status": response.getcode(),
                "url": response.geturl(),
                "headers": dict(response.headers.items()),
                "body": response.read().decode("utf-8", errors="replace"),
            }
    except urllib.error.HTTPError as exc:
        return {
            "status": exc.code,
            "url": exc.geturl(),
            "headers": dict(exc.headers.items()),
            "body": exc.read().decode("utf-8", errors="replace"),
        }


def hidden_value(html: str, field_id: str) -> str | None:
    pattern = (
        r'<input\b(?=[^>]*\bid=["\']'
        + re.escape(field_id)
        + r'["\'])(?=[^>]*\bvalue=["\']([^"\']*)["\'])[^>]*>'
    )
    match = re.search(pattern, html, flags=re.IGNORECASE)
    return match.group(1) if match else None


def extract_affiliate_name(html: str) -> str | None:
    parser = AffiliateNameParser()
    parser.feed(html)
    return parser.name


def run_login_flow(afiliado: str, dni: str) -> dict:
    opener = build_opener()

    login_url = urllib.parse.urljoin(BASE_URL, LOGIN_PATH)
    login_response = read_response(opener, urllib.request.Request(login_url))

    url_abs = hidden_value(login_response["body"], "hidden_url_path") or BASE_URL
    validate_url = urllib.parse.urljoin(url_abs, VALIDATE_PATH)

    post_data = urllib.parse.urlencode(
        {
            "n_beneficio": afiliado,
            "n_documento": dni,
        }
    ).encode("ascii")
    validate_request = urllib.request.Request(
        validate_url,
        data=post_data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": login_url,
        },
        method="POST",
    )
    validate_response = read_response(opener, validate_request)
    validation_body = validate_response["body"].strip().strip('"')

    result = {
        "login_page": {
            "status": login_response["status"],
            "final_url": login_response["url"],
        },
        "validation": {
            "status": validate_response["status"],
            "result": validation_body,
            "authenticated": validation_body == "OK",
        },
        "inicio": None,
    }

    if validation_body == "OK":
        inicio_url = urllib.parse.urljoin(url_abs, INICIO_PATH)
        inicio_response = read_response(opener, urllib.request.Request(inicio_url))
        result["inicio"] = {
            "status": inicio_response["status"],
            "final_url": inicio_response["url"],
            "page_loaded": "mi-cartilla/inicio" in inicio_response["url"],
            "affiliate_name": extract_affiliate_name(inicio_response["body"]),
        }

    return result


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run the PAMI mi-cartilla login flow."
    )
    parser.add_argument("--afiliado", required=True)
    parser.add_argument("--dni", required=True)
    args = parser.parse_args()

    result = run_login_flow(args.afiliado, args.dni)

    print(json.dumps(result, indent=2, ensure_ascii=False))

    return 0


if __name__ == "__main__":
    sys.exit(main())

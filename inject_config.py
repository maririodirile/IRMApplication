#!/usr/bin/env python3
"""Inject deployment settings into the application form at build time.

Reads SUBMIT_URL and PLACES_KEY from environment variables and writes them
into the placeholders near the top of the form's script. Values are never
printed. Keeping them in CI secrets keeps them out of the git history.

Note: both values end up in the published page's source, which is public.
Restrict the Google key to your domain, and treat the Power Automate URL as
something anyone who views the page source can submit to.

Usage: python3 scripts/inject_config.py public/index.html
"""
import os
import sys

SETTINGS = {
    "SUBMIT_URL": "const SUBMIT_URL='';",
    "PLACES_KEY": "const PLACES_KEY='';",
}


def js_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "").replace("\r", "")


def main(path: str) -> int:
    with open(path, encoding="utf-8") as f:
        html = f.read()

    for name, placeholder in SETTINGS.items():
        value = os.environ.get(name, "").strip()
        if not value:
            print(f"{name}: not set, leaving placeholder")
            continue
        if html.count(placeholder) != 1:
            print(f"{name}: placeholder not found exactly once in {path}", file=sys.stderr)
            return 1
        html = html.replace(placeholder, f"const {name}='{js_string(value)}';")
        print(f"{name}: injected")

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))

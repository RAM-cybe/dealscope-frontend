"""Post-deploy canary: does the live page show the dates we just published?

    python3 scripts/canary_check.py <dataset-meta.json> <page.html>

Exit 0 = the page carries the expected "Prices as of ..." and "Fundamentals
as of ..." text, 1 = it does not. Standard library only.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _fmt(iso):
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})", str(iso or ""))
    if not m:
        return None
    return f"{int(m.group(3))} {MONTHS[int(m.group(2)) - 1]} {m.group(1)}"


def expected_strings(meta):
    prices, funda = _fmt(meta.get("prices_as_of")), _fmt(meta.get("fundamentals_as_of"))
    return (f"Prices as of {prices}" if prices else None,
            f"Fundamentals as of {funda}" if funda else None)


def page_matches(html, meta):
    prices, funda = expected_strings(meta)
    if not prices or not funda or not html:
        return False
    return prices in html and funda in html


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 2:
        print("Usage: canary_check.py <dataset-meta.json> <page.html>")
        return 2
    meta = json.loads(Path(argv[0]).read_text())
    html = Path(argv[1]).read_text(errors="replace")
    ok = page_matches(html, meta)
    print("Canary OK: live page shows the published dates." if ok
          else f"Canary MISMATCH: expected {expected_strings(meta)} on the live page.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

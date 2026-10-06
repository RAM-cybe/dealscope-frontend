"""Independent gate for data branches pushed by the backend data bot.

Deliberately shares no code with the backend's own sanitizer / publish gate:
if one side has a bug, the other still catches the bad data.

    python3 scripts/validate_data.py --candidate data --base /tmp/main-data

--base is a directory holding the data currently on main (omit for a first
release). Exit 0 = safe to merge, 1 = problems printed as `code: message`.
Standard library only.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

MAX_SHRINK = 0.01
MAX_COVERAGE_DROP = 0.05
COVERAGE_FIELDS = ["revenue", "ebitda_margin_pct", "market_cap"]
# field -> (low, high); None = unbounded. Inclusive. Impossible, not merely unusual.
RANGES = {
    "promoter_holding_pct": (0, 100),
    "promoter_pledge_pct": (0, 100),
    "beta": (-10, 10),
    "revenue": (0, None),
    "market_cap": (0, None),
    "total_debt": (0, None),
    "ebitda_margin_pct": (-300, 300),
    "current_ratio": (0, 100),
}


def load_bundle(directory):
    d = Path(directory)

    def read(name, default=None):
        p = d / name
        return json.loads(p.read_text()) if p.exists() else default

    return {
        "companies": read("companies.json"),
        "deals": read("deals.json"),
        "narratives": read("narratives.json"),
        "meta": read("dataset-meta.json"),
    }


def _violations(companies):
    count = 0
    for c in companies:
        for field, (low, high) in RANGES.items():
            v = c.get(field)
            if v is None:
                continue
            if isinstance(v, bool) or not isinstance(v, (int, float)):
                count += 1
            elif (low is not None and v < low) or (high is not None and v > high):
                count += 1
    return count


def _coverage(companies, field):
    return sum(1 for c in companies if c.get(field) is not None) / max(len(companies), 1)


def validate(candidate, base):
    problems = []
    comps = candidate.get("companies")
    if not isinstance(comps, list) or not all(isinstance(c, dict) for c in comps):
        return ["shape: companies.json is not a list of objects"]
    if not isinstance(candidate.get("deals"), list):
        problems.append("shape: deals.json is not a list")
    if not isinstance(candidate.get("narratives"), dict):
        problems.append("shape: narratives.json is not an object")
    meta = candidate.get("meta")
    if not isinstance(meta, dict):
        return problems + ["shape: dataset-meta.json missing or not an object"]

    tickers = [c.get("ticker") for c in comps]
    if any(not t for t in tickers):
        problems.append("duplicate_ticker: blank ticker present")
    seen, dups = set(), set()
    for t in tickers:
        (dups if t in seen else seen).add(t)
    if dups:
        problems.append(f"duplicate_ticker: {sorted(map(str, dups))[:5]}")

    if meta.get("universe_size") != len(comps):
        problems.append(f"meta_mismatch: universe_size={meta.get('universe_size')} but {len(comps)} companies")
    if isinstance(candidate.get("deals"), list) and meta.get("deal_count") != len(candidate["deals"]):
        problems.append(f"meta_mismatch: deal_count={meta.get('deal_count')} but {len(candidate['deals'])} deals")

    base_comps = (base or {}).get("companies")
    base_meta = (base or {}).get("meta")
    if isinstance(base_comps, list) and base_comps:
        if len(comps) < len(base_comps) * (1 - MAX_SHRINK):
            problems.append(f"universe_shrink: {len(base_comps)} -> {len(comps)} companies")
        for field in COVERAGE_FIELDS:
            before, after = _coverage(base_comps, field), _coverage(comps, field)
            if before - after > MAX_COVERAGE_DROP:
                problems.append(f"coverage: {field} populated {before:.0%} -> {after:.0%}")
    if isinstance(base_meta, dict):
        for key, code in (("prices_as_of", "prices_regress"), ("fundamentals_as_of", "fundamentals_regress")):
            old, new = str(base_meta.get(key) or ""), str(meta.get(key) or "")
            if old and new < old:
                problems.append(f"{code}: {key} {old} -> {new or 'missing'}")

    now_bad = _violations(comps)
    was_bad = _violations(base_comps) if isinstance(base_comps, list) else 0
    # Zero is the goal; "no worse than what is already live" avoids a deadlock
    # while legacy bad values are still being cleaned out.
    if now_bad and now_bad > was_bad:
        problems.append(f"impossible_value: {now_bad} impossible value(s) (live has {was_bad})")
    return problems


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidate", required=True)
    ap.add_argument("--base")
    args = ap.parse_args(argv)
    try:
        cand = load_bundle(args.candidate)
        base = load_bundle(args.base) if args.base and Path(args.base).exists() else None
        problems = validate(cand, base)
    except Exception as exc:  # noqa: BLE001 - fail closed
        problems = [f"internal: validator crashed: {exc!r}"]
    for p in problems:
        print(f"::error::{p}")
    if not problems:
        print("Data validation passed.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

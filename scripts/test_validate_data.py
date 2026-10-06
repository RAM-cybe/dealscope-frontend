"""Tests for scripts/validate_data.py and scripts/canary_check.py.

Run: python3 scripts/test_validate_data.py
"""

import copy
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from canary_check import expected_strings, page_matches  # noqa: E402
from validate_data import validate  # noqa: E402

failures = 0
checks = 0


def check(name, cond, detail=""):
    global failures, checks
    checks += 1
    if not cond:
        failures += 1
        print(f"  FAIL  {name}{('  -- ' + detail) if detail else ''}")
    else:
        print(f"  ok    {name}")


def company(i, **kw):
    base = {"ticker": f"T{i:04d}", "name": f"Co {i}", "revenue": 1e9, "ebitda_margin_pct": 12.0,
            "market_cap": 5e9, "promoter_holding_pct": 50.0, "promoter_pledge_pct": 0.0,
            "beta": 0.9, "current_ratio": 1.5}
    base.update(kw)
    return base


def bundle(n=300, prices="2026-10-05", funda="2026-07-11"):
    comps = [company(i) for i in range(n)]
    return {
        "companies": comps,
        "deals": [{"target": "x"}] * 10,
        "narratives": {"T0001": {"about": "a"}},
        "meta": {"prices_as_of": prices, "fundamentals_as_of": funda, "universe_size": n, "deal_count": 10},
    }


def codes(problems):
    return {p.split(":")[0] for p in problems}


base = bundle()

print("=== Healthy ===")
check("identical bundle passes", validate(copy.deepcopy(base), base) == [])
cand = bundle(prices="2026-10-06", funda="2026-10-01")
check("newer dates pass", validate(cand, base) == [])
check("first ever release (no base) passes", validate(bundle(), None) == [])

print("=== Structure ===")
cand = bundle(); cand["companies"] = cand["companies"][:100]; cand["meta"]["universe_size"] = 100
check("lost >1% of companies blocks", "universe_shrink" in codes(validate(cand, base)))
cand = bundle(); cand["companies"][5]["ticker"] = cand["companies"][6]["ticker"]
check("duplicate ticker blocks", "duplicate_ticker" in codes(validate(cand, base)))
cand = bundle(); cand["meta"]["universe_size"] = 7
check("meta disagreeing with payload blocks", "meta_mismatch" in codes(validate(cand, base)))
cand = bundle(); cand["companies"] = {"not": "a list"}
check("wrong shape blocks, no crash", "shape" in codes(validate(cand, base)))
cand = bundle(); del cand["meta"]
check("missing file blocks, no crash", "shape" in codes(validate(cand, base)))

print("=== Never roll back ===")
check("older prices block", "prices_regress" in codes(validate(bundle(prices="2026-10-02"), base)))
check("older fundamentals block", "fundamentals_regress" in codes(validate(bundle(funda="2026-04-01"), base)))

print("=== Impossible values ===")
for field, bad in [("promoter_holding_pct", 133.3), ("promoter_pledge_pct", 104), ("beta", -20000),
                   ("revenue", -5), ("ebitda_margin_pct", -92980), ("current_ratio", 2990), ("market_cap", -1)]:
    cand = bundle(); cand["companies"][3][field] = bad
    check(f"{field}={bad} blocks", "impossible_value" in codes(validate(cand, base)))
cand = bundle(); cand["companies"][3]["beta"] = None
check("null is fine", validate(cand, base) == [])
legacy = bundle(); legacy["companies"][1]["beta"] = -20000
cand = copy.deepcopy(legacy)
check("pre-existing violations are tolerated (no deadlock during rollout)", validate(cand, legacy) == [])
cand = copy.deepcopy(legacy); cand["companies"][2]["beta"] = 999
check("but getting worse is blocked", "impossible_value" in codes(validate(cand, legacy)))

print("=== Coverage ===")
cand = bundle()
for c in cand["companies"][:90]:
    c["revenue"] = None
check("30% of revenue wiped blocks", "coverage" in codes(validate(cand, base)))

print("=== Canary page check ===")
meta = {"prices_as_of": "2026-10-05", "fundamentals_as_of": "2026-07-11"}
exp = expected_strings(meta)
check("expected strings", exp == ("Prices as of 5 Oct 2026", "Fundamentals as of 11 Jul 2026"), str(exp))
html = "<span>Prices as of 5 Oct 2026. Fundamentals as of 11 Jul 2026.</span>"
check("matching page passes", page_matches(html, meta))
check("stale page fails", not page_matches(html.replace("5 Oct", "2 Oct"), meta))
check("empty page fails", not page_matches("", meta))
check("missing meta date fails, no crash", not page_matches(html, {}))

print("=== CLI ===")
with tempfile.TemporaryDirectory() as d:
    def dump(sub, b):
        p = Path(d, sub); p.mkdir()
        (p / "companies.json").write_text(json.dumps(b["companies"]))
        (p / "deals.json").write_text(json.dumps(b["deals"]))
        (p / "narratives.json").write_text(json.dumps(b["narratives"]))
        (p / "dataset-meta.json").write_text(json.dumps(b["meta"]))
        return str(p)
    good, old = dump("good", bundle(prices="2026-10-06")), dump("old", base)
    r = subprocess.run([sys.executable, str(HERE / "validate_data.py"), "--candidate", good, "--base", old],
                       capture_output=True, text=True)
    check("CLI exit 0 on valid data", r.returncode == 0, r.stdout + r.stderr)
    bad = bundle(); bad["companies"][0]["beta"] = 5000
    r = subprocess.run([sys.executable, str(HERE / "validate_data.py"), "--candidate", dump("bad", bad), "--base", old],
                       capture_output=True, text=True)
    check("CLI exit 1 on bad data", r.returncode == 1 and "impossible_value" in r.stdout + r.stderr, r.stdout + r.stderr)

print(f"\n{checks - failures}/{checks} checks passed")
sys.exit(1 if failures else 0)

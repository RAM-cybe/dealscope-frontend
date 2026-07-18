# Running and hosting DealScope's new frontend — no database, no accounts

The app reads two local files (`data/companies.json`, `data/deals.json`) —
2,046 real companies and 727 real comparable deals, generated straight from
your actual scoring/valuation engine (`src/logic/scoring.py`,
`src/logic/valuation.py` at the repo root). No Supabase, no API keys, no
network calls. Free at every stage.

## 1. Refresh the data (only needed when your underlying data changes)

From the repo root (one level up from this folder):
```
python3 export_for_frontend.py
```
This overwrites `deal-scope-interface/data/companies.json` and
`deal-scope-interface/data/deals.json` with fresh numbers, using your real
scoring engine. You've already run this once — the current files are up to
date as of today.

## 2. Run it on localhost

In this folder (`deal-scope-interface`):
```
pnpm install
pnpm dev
```
Open http://localhost:3000. You should see all 2,046 real companies, real
sector chips (7 real sectors, not the old placeholder 13), live-re-ranking
weight sliders, and real tear sheets. Click into a handful of obscure
companies (not just TCS/Infosys) to confirm missing data shows an honest
"N/A" instead of a broken layout — that's the main thing worth spot-checking.

## 3. Push to GitHub

This code needs to land in the `Dealscope-w3` repo that Vercel is already
watching (the one that got created when you connected GitHub inside v0).
From this folder:
```
git init                          # only if this folder isn't already a git repo
git remote add origin https://github.com/RAM-cybe/Dealscope-w3.git
git add .
git commit -m "Read real company data from bundled local JSON, drop Supabase"
git push origin main
```
If that repo already has commits from v0 and this push conflicts, either
`git pull origin main --rebase` first, or just clone `Dealscope-w3` fresh
and copy these files into it — whichever's easier.

## 4. Go live on Vercel

Vercel auto-builds on the push (no environment variables needed this time —
there's nothing to configure, the data ships inside the app itself). Once
the build succeeds, open the deployment and click **Promote to Production**.
You'll get a public `*.vercel.app` link anyone can open — free, no login,
nothing for you to keep running.

## Notes

- `lib/supabase.ts` and `.env.local.example` are leftover, unused files from
  the earlier Supabase attempt — harmless, safe to ignore or delete.
- Your Streamlit app on Render keeps running untouched throughout all of
  this — it's not affected by any of the above.

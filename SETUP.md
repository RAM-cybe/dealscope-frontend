# DealScope frontend

Public site for [dealscope-screener.vercel.app](https://dealscope-screener.vercel.app).
Data is bundled JSON produced by `RAM-cybe/dealscope`.

```
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Data files

| File | Loaded when |
|---|---|
| `data/companies.json` | First paint (screening / ranking) |
| `data/deals.json` | First paint (comps) |
| `data/narratives.json` | After paint, for tear-sheet copy |
| `data/news.json` | After paint, for tear-sheet news |
| `data/dataset-meta.json` | Header dates |
| `data/filter-bands.json` / `data/sector-bands.json` | Filters and NL screener |

Do not edit these by hand. The backend `export_for_frontend.py` + daily/promote
jobs write them.

## Refresh from the backend

From `dealscope` (sibling repo):

```
python3 export_for_frontend.py
```

Then copy `data/frontend/*.json` into this repo's `data/` folder, except
`news.json` which is produced by `scripts/export_news_and_filings.py`.

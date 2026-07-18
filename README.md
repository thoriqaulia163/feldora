# FELDORA

A cinematic digital platform built with TanStack Start, React, TypeScript, and TailwindCSS. Features an AI playground with offline machine learning modules running entirely in-browser.

## Tech Stack

- **Framework:** TanStack Start (SSR + file-based routing)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Data:** React Query + GraphQL (Hygraph CMS)
- **ML:** Random Forest (pure TypeScript, offline inference)
- **Build:** Vite 7
- **PWA:** Offline support + installable

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### AI Model Setup (optional, for Playground)

**Weather Models** (pre-train dari script):
```bash
# 1. Fetch weather dataset from Open-Meteo (~5-10 min)
npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025

# 2. Train model (~10 min)
npx tsx scripts/local-weather-forecast/model-generation.ts
```

Output: `public/ai-models/local-weather-forecast/model.json` — served to browser at runtime.

> If some cities fail during extraction (rate limiting), re-run the same command — it resumes automatically.

## Project Structure

```
src/
├── components/     # UI components
│   ├── home/       # Homepage sections
│   ├── layout/     # Navbar, Footer
│   ├── playground/ # Module system + AI modules
│   ├── story/      # Story/blog components
│   └── ui/         # Shared UI (Skeleton, Toast, ErrorState)
├── constants/      # Static data, copy, config
├── lib/            # API layer + ML engine
│   ├── crypto/     # Reusable AES-GCM encryption (DEK + KEK)
│   └── ml/         # Random Forest, GBT, cities data, types
├── routes/         # File-based routes (TanStack Router)
├── styles/         # Global CSS
└── utils/          # Utility functions

scripts/
└── local-weather-forecast/   # Dataset extraction & model training

public/
├── ai-models/      # Pre-trained models (deployed)
└── dataset/        # Training data (git-ignored)
```

## Routes

- `/` — Home
- `/about` — About Feldora
- `/playground` — AI & experiment modules
- `/playground/split-bill` — Split Bill tool (encrypted, offline)
- `/story` — Stories (blog)
- `/story/:slug` — Individual story

## Environment

Create a `.env` file:

```
VITE_GRAPH_CMS_ENDPOINT="your-hygraph-endpoint"
VITE_SPLIT_BILL_KEK="your-encryption-passphrase"
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GRAPH_CMS_ENDPOINT` | Yes | Hygraph GraphQL endpoint for Story/blog content |
| `VITE_SPLIT_BILL_KEK` | For Split Bill | Passphrase for local data encryption. Module disabled if not set. |

## Build & Deploy

```bash
npm run build
```

Deploys to Vercel via Nitro. `public/ai-models/` is included in the build. `public/dataset/` is git-ignored and not deployed.

## Docs

- `DESIGN_SYSTEM.md` — Architecture, design tokens, component patterns
- `PLAYGROUND_MODULES.md` — Detailed documentation for each playground module
- `scripts/local-weather-forecast/HOW-TO-USE.md` — Dataset & model generation guide

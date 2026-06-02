# FELDORA

A cinematic digital platform built with TanStack Start, React, TypeScript, and TailwindCSS.

## Tech Stack

- **Framework:** TanStack Start (SSR + file-based routing)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Data:** React Query + GraphQL (Hygraph CMS)
- **Build:** Vite 7

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── home/       # Homepage sections
│   ├── layout/     # Navbar, Footer
│   └── story/      # Story/blog components
├── constants/      # Static data & config
├── lib/            # API layer (GraphQL, React Query)
├── routes/         # File-based routes (TanStack Router)
├── styles/         # Global CSS
└── utils/          # Utility functions
```

## Routes

- `/` — Home (landing page)
- `/about` — About Feldora
- `/log` — Update changelog
- `/story` — Stories (blog)
- `/story/:slug` — Individual story

## Environment

Create a `.env` file:

```
VITE_GRAPH_CMS_ENDPOINT="your-hygraph-endpoint"
```

## Build

```bash
npm run build
```

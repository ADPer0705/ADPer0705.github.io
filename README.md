# ADPer Portfolio (Migrated Vite + React)

This repository now runs the new portfolio implementation from `ref/personal-portfolio` as the primary site.

## Stack

- Vite
- React + TypeScript
- Tailwind CSS v4
- Motion + custom cyber UI components

## Run locally

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

## Migration notes

- Legacy static site files were replaced by the Vite app at repository root.
- Core portfolio content was mapped into `src/data/*.json`.
- Domain metadata and crawl files were updated for `https://adper.me`.

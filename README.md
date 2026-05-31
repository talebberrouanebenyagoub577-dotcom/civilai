# CivilAI — AI Civil Engineering Assistant

A standalone web application for civil engineers to enter building parameters and receive AI-generated preliminary structural engineering studies. All data is stored locally in your browser — no database, no login, no configuration required.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard loads immediately.

## Features

- **Dashboard** — Total projects, saved reports, recent activity
- **New Project** — Full building parameter form
- **Engineering Study Generator** — Column grid, beams, slabs, foundations, risk warnings
- **PDF Export** — Download professional engineering reports
- **Project History** — Search, duplicate, edit, delete
- **Local Storage** — All projects persist in your browser

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- jsPDF (PDF export)
- Browser localStorage (data persistence)

## Data Storage

Projects are saved under the `civilai_projects` key in browser localStorage. Data stays on your device and is not sent to any server. Clearing browser data will remove your projects.

## Disclaimer

These results are preliminary engineering recommendations and must be reviewed and approved by a licensed structural engineer.

## License

Private — All rights reserved.

# re-ecommerce

Lightweight example e‑commerce app using PocketBase for the backend and Next.js for the frontend.

This repository contains:

- `backend/` — PocketBase binary, migrations and the sqlite data directory (`pb_data/`).
- `frontend/` — Next.js (App Router) frontend built with React, TypeScript and Tailwind.

## Quick overview

- The PocketBase backend serves the REST API and files (images) and includes the admin console.
- The Next.js frontend consumes the PocketBase REST API. The frontend reads the PocketBase URL from `NEXT_PUBLIC_POCKETBASE_URL` (defaults to `http://127.0.0.1:8090`).

## Prerequisites

- Node.js (recommended 18+)
- npm or yarn
- A macOS / Linux / Windows terminal to run the included PocketBase binary (or Docker)

## Run the backend (PocketBase)

There is a prebuilt PocketBase binary in `backend/`. The app data files live under `backend/pb_data/` (includes `data.db`, `auxiliary.db` and `storage/`).

Run PocketBase from the `backend` folder:

```bash
cd backend
# make sure the binary is executable
chmod +x ./pocketbase

# start the server (serves on port 8090 by default)
./pocketbase serve --dir pb_data --http 127.0.0.1:8090
```

After the server starts you can open the admin console at:

http://127.0.0.1:8090/_/

Notes:

- If you already have a PocketBase instance running on a different port, either stop it or change the `--http` address above.
- The `pb_migrations/` folder contains JS migration files used to create/update collections. If you modify migrations, run them via the PocketBase console or include them in your deployment pipeline.

Optional: Run PocketBase in Docker (example):

```bash
docker run --rm -p 8090:8090 -v $(pwd)/pb_data:/pb_data ghcr.io/pocketbase/pocketbase:latest serve --dir /pb_data --http 0.0.0.0:8090
```

## Run the frontend (Next.js)

The frontend expects the PocketBase REST endpoint to be available. By default the app uses `http://127.0.0.1:8090`.

1. Open a terminal and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

2. Open the app at:

http://localhost:3000

Build for production:

```bash
cd frontend
npm run build
npm run start
```

Environment variables

Create a `.env.local` in `frontend/` (Next.js will pick this up automatically). Example:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

The frontend code uses this variable in `src/lib/pocketbase.ts` as `PB_URL`.

## Data and storage

- Database files: `backend/pb_data/data.db` and `backend/pb_data/auxiliary.db`.
- Uploaded files and thumbnails are stored under `backend/pb_data/storage/`.

If you want to seed or reset the database, replace `pb_data` with your own directory or modify the files directly (make backups first).

## Developer notes

- API helpers for the frontend: `frontend/src/lib/pocketbase.ts` contains convenience functions for categories, products and auth.
- The backend includes migration scripts under `backend/pb_migrations/`.
- The frontend uses Next.js 15 and React 19. The dev script uses Turbopack (`next dev --turbopack`).

## Troubleshooting

- PocketBase won't start: ensure the binary is executable (`chmod +x backend/pocketbase`) and that no other process uses port 8090.
- Images/avatars not visible: confirm files exist under `backend/pb_data/storage` and that PocketBase is running (files are served from `/api/files/...`).
- Frontend can't reach PocketBase: verify `NEXT_PUBLIC_POCKETBASE_URL` in `.env.local` and open that URL in the browser to confirm the admin UI loads.

## Contributing

If you'd like to contribute, please open issues or PRs on this repository. Keep migrations idempotent and include tests for new backend behavior when applicable.

## License

See `backend/LICENSE.md` for the PocketBase license. Repository-level license information can be added here if desired.

---

If you'd like, I can also add a small script in the root to start both backend and frontend concurrently (e.g. using npm-run-all) or a dev Makefile — tell me which you prefer and I'll add it.

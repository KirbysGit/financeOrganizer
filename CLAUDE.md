# CLAUDE.md

Guidance for Claude / AI agents working in this repository. Read this before making changes.

## What Centi Is

**Centi** is a personal finance tracking web app ("your friendly finance companion"), built as a spiritual successor to Mint with a UX-first philosophy: progressive disclosure (high-level overview first, detail as you scroll), friendly visuals, and a personalized **Centi Score** financial-health metric.

- **Frontend:** React 19 + Vite + Styled Components (deployed on **Vercel**)
- **Backend:** FastAPI + SQLAlchemy (deployed on **Railway**, Dockerized)
- **Database:** Driven entirely by `DATABASE_URL`. **SQLite for local dev** (e.g. `DATABASE_URL=sqlite:///./transactions.db`), **PostgreSQL in production** (Railway; ships `psycopg2`/`asyncpg`). `DATABASE_URL` is required either way — there is no hard-coded default.
- **Auth:** JWT (in HTTP-only cookies) + Google OAuth
- **Financial data:** Plaid API (sandbox by default)

## Repository Layout

```
financeOrganizer/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point, CORS, router registration, startup
│   │   ├── config.py          # Settings, Plaid + Google OAuth config (reads .env)
│   │   ├── database.py        # SQLAlchemy models (ACTUAL DB tables) + engine/session
│   │   ├── models.py          # Pydantic request/response schemas (NOT DB tables)
│   │   ├── routes/            # API endpoint groups (see routing quirks below)
│   │   └── utils/             # Business logic helpers
│   ├── requirements.txt
│   └── .env                   # Secrets (gitignored) — Plaid, Google, JWT, DB
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Root component; manual page routing via state
│   │   ├── services/api.js    # ALL backend API calls (axios instance)
│   │   ├── components/        # Numbered by user flow (1Welcome → 4Dashboard)
│   │   └── styles/            # colors.css, fonts.css, theme.js, GlobalStyles.js
│   ├── package.json
│   └── vite.config.js
├── Dockerfile                 # Backend container (Railway), runs uvicorn on :8080
├── vercel.json                # Frontend build config (Vite SPA rewrites)
├── README.md                  # Project vision + future to-dos
├── notes.txt                  # Developer's personal library/learning notes
└── HANDOFF.md                 # Running status / progress tracker
```

## ⚠️ Important Routing Quirks (read before editing backend routes)

The route files are **NOT** named after what they contain. This is the single most confusing thing in the codebase:

- **`routes/accounts.py`** → actually contains the **Authentication** router (`prefix="/auth"`): register, login, refresh, logout, google-code, verify-email, resend-verification, forgot-password, reset-password, `/me`, contact form. It does **not** contain account endpoints.
- **`routes/transactions.py`** → a large (~1800-line) catch-all containing **transactions, accounts, stats, tags, and the `/clear` (empty DB) endpoint**. The real `GET /accounts`, `/accounts/enhanced`, `/accounts/analysis`, `/stats`, and all `/tags` routes live here.
- **`routes/centi_score.py`** → Centi Score endpoints (`/centi-score/*`).
- **`routes/plaid.py`** → Plaid endpoints (`/plaid/*`).
- **`routes/files.py`** → file management (`/files/*`).
- **`routes/upload.py`** → CSV upload (`/upload`).

When looking for an endpoint, **search by the URL string** (e.g. grep `"/accounts"`) rather than guessing the file from its name.

Routers are registered in `main.py` via `app.include_router(...)`. The auth router is pulled in as `accounts.router`.

## Backend Notes

- **Two model layers:** `database.py` = SQLAlchemy ORM tables (`User`, `Account`, `Transaction`, `Institution`, `FileUpload`, `MonthlySnapshot`, `WeeklyCentiScore`, `AccountBalanceHistory`, `Tag`, `TransactionTag`). `models.py` = Pydantic schemas for request validation / response shaping. Keep them in sync when adding fields.
- **DB connection is lazy and failure-tolerant:** `get_engine()` returns `None` on failure and the app still boots (operations then fail). `DATABASE_URL` is required and selects the backend (SQLite locally, Postgres in prod); there is no hard-coded default URL. Local dev uses a SQLite file (`del transactions.db` to reset — see `notes.txt`).
- **Duplicate prevention:** `Transaction` auto-generates a SHA-256 `transaction_hash` from key fields in `__init__`; `FileUpload` uses a `content_hash`.
- **Scheduler:** `utils/scheduler.py` starts on app startup (`@app.on_event("startup")`) to compute weekly Centi Scores. Centi Score logic lives in `utils/centi_score_utils.py` (components: net worth, assets, liabilities, cash flow → total, currently 1–100).
- **utils/** breakdown: `auth_utils` (JWT/password hashing via passlib+bcrypt), `email_utils` (verification/reset/contact emails), `parser` (CSV parsing — currently strict), `account_utils`, `vendor_utils`, `tag_utils`, `type_label_map`, `snapshot_utils`, `db_utils`.
- **Lots of debug/test endpoints** in `main.py` (`/test-*`, `/ping`, `/debug-auth`, `/cors-test`, etc.) — left over from deployment debugging on Railway. Safe to clean up eventually (see README to-dos).
- **CORS** is configured with an explicit origins list in `main.py` plus extra `OPTIONS` handlers added to work around Railway proxy preflight issues.

## Frontend Notes

- **No React Router for main flow:** `App.jsx` does manual page switching via `currentPage` state (`welcome` → `account-setup` → `finance-connect` → `dashboard`), plus URL-path checks for `/verify-email` and `/reset-password`. `react-router-dom` is installed but the top-level navigation is state-driven.
- **All API calls go through `src/services/api.js`** — a single axios instance with `withCredentials: true` and a response interceptor that auto-refreshes JWT on 401 (with a refresh-lock + queued retries) and redirects to `/` on refresh failure. Add new endpoints here.
- **Base URL:** `VITE_API_URL` env var, falling back to the hard-coded Railway production URL.
- **Auth/data state is tracked in `localStorage`** (`user`, `hasData`, `userSkipped`) — the app cross-checks these flags against live API data on init/login to decide where to route the user.
- **Components are organized by user-flow order** (`1WelcomePage`, `2AccountSetUp`, `3FinanceConnect`, `4Dashboard/...`). The dashboard is further sub-numbered (NavBar, Header/Stats, RecentData, CentiScore, Accounts, Transactions, Footer, MiniSidebar).
- **Three ways to add data:** Plaid (`PlaidConnect`), manual entry (`ManualConnect`), CSV upload (`UploadConnect`).
- Styling: CSS variables in `styles/colors.css`; charts via Chart.js / `react-chartjs-2` / `react-gauge-component`; effects via `tsparticles`, `lottie-react`, `canvas-confetti`.

## Running Locally

**Backend** (from `backend/`):
```bash
venv\Scripts\activate            # Windows
uvicorn app.main:app --reload    # http://localhost:8000
```
Requires `backend/.env` with `DATABASE_URL` (use `sqlite:///./transactions.db` for local dev), `SECRET_KEY`, `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

**Frontend** (from `frontend/`):
```bash
npm install
npm run dev                      # http://localhost:5173
```

## Conventions

- Code uses heavy **inline comments** and a banner/section-divider comment style (`# ---- Section.` / `// ----`). Match the surrounding density and capitalization style when editing.
- Comments and section headers are frequently Title-Cased (the author's style). Mirror it in the file you're touching.
- Each module typically opens with a header comment listing its functions/models — keep that list updated when you add/remove definitions.

## Deployment

- **Backend → Railway** via `Dockerfile` (Python 3.11-slim, `uvicorn app.main:app` on port 8080). `ENVIRONMENT=production` enables `TrustedHostMiddleware`.
- **Frontend → Vercel** via `vercel.json` (`vite build` → `frontend/dist`, SPA rewrites to `index.html`).
- Production frontend: `finance-organizer-wine.vercel.app`; backend: `financeorganizer-production.up.railway.app` (per CORS list).

## Known Rough Edges / To-Dos

See `README.md` "Future To-Dos" and `HANDOFF.md`. Highlights:
- Account handling is "messy" — user-created and Plaid-imported accounts aren't cleanly merged.
- CSV/file handling is very strict.
- Centi Score uses a 1–100 scale the author wants to rework into something more representative.
- Many leftover debug endpoints to remove.
- `.env`-based dev/prod swapping not fully set up.

# Centi — Handoff / Status Tracker

A living document tracking the current state of the project, what's done, what's in flight, and what's next. Update this as work progresses.

_Last updated: 2026-06-30_

---

## 1. Snapshot

**Centi** is a personal finance tracker (Mint-style, UX-first) with a custom **Centi Score** financial-health metric.

| Layer | Stack | Hosting |
|-------|-------|---------|
| Frontend | React 19, Vite, Styled Components | Vercel (`finance-organizer-wine.vercel.app`) |
| Backend | FastAPI, SQLAlchemy | Railway (`financeorganizer-production.up.railway.app`), Dockerized |
| Database | SQLite (local dev) / PostgreSQL (prod), via `DATABASE_URL` | Railway |
| Auth | JWT (HTTP-only cookies) + Google OAuth | — |
| Bank data | Plaid API (sandbox default) | — |

Repo: `https://github.com/KirbysGit/financeOrganizer` (branch `master`).

---

## 2. What's Built (working)

### Authentication & Onboarding
- [x] Email/password registration with hashing (passlib + bcrypt)
- [x] JWT auth via HTTP-only cookies, with refresh-token flow + auto-refresh on 401 (frontend interceptor)
- [x] Google OAuth (auth-code flow)
- [x] Email verification (verify-email, resend) and password reset (forgot/reset) flows
- [x] Onboarding routing logic (welcome → account setup → finance connect → dashboard) driven by `localStorage` flags cross-checked against live data

### Data Ingestion (3 methods)
- [x] **Plaid** — link token creation, public-token exchange, fetch accounts + transactions
- [x] **Manual entry** — create individual transactions
- [x] **CSV upload** — file parsing with duplicate detection (content hash + per-transaction SHA-256 hash)

### Dashboard
- [x] Stats / overview header
- [x] Spending grid (recent data)
- [x] Centi Score section (gauge, chart, personalized insight, progress/strength panels)
- [x] Accounts list with cards (+ enhanced accounts with growth data)
- [x] Transactions table with filters (account, amount, date, type, tag) and tagging (create/edit/assign tags)
- [x] Footer + contact-us modal, mini sidebar

### Centi Score
- [x] Weekly score calculation (components: net worth, assets, liabilities, cash flow)
- [x] History, growth, summary, trend endpoints
- [x] Scheduler runs the weekly calculation on app startup

### Infra
- [x] Dockerized backend deployed to Railway
- [x] Vercel deployment for frontend (SPA rewrites)
- [x] CORS configured (with Railway proxy preflight workarounds)

---

## 3. Architecture Quick Reference

**Backend route files are misleadingly named** — find endpoints by URL string, not filename:
- `routes/accounts.py` → **Authentication** router (`/auth/*`)
- `routes/transactions.py` → transactions **+ accounts + stats + tags + `/clear`** (large catch-all)
- `routes/centi_score.py` → `/centi-score/*`
- `routes/plaid.py` → `/plaid/*`
- `routes/files.py` → `/files/*`
- `routes/upload.py` → `/upload`

**Two model layers:** `database.py` = SQLAlchemy tables; `models.py` = Pydantic schemas. Keep in sync.

**Frontend:** state-based page switching in `App.jsx` (not React Router for the main flow); all API calls centralized in `services/api.js`.

See `CLAUDE.md` for the full developer guide.

---

## 4. Known Issues / Rough Edges

- **Account handling is messy** — user-created and Plaid-imported accounts are not cleanly merged; backend groups frontend options together awkwardly.
- **CSV/file handling is very strict** — needs a more robust/forgiving parser.
- **Centi Score scale (1–100)** isn't very representative; author wants a better scale + personalized feedback file.
- **Leftover debug/test endpoints** in `main.py` (`/test-*`, `/cors-test`, `/debug-auth`, `/ping`, etc.) should be removed.
- **Production site is live but basically unused** — prod is low-stakes; active development happens locally on SQLite. Database backend is selected by `DATABASE_URL` (SQLite local, Postgres prod).
- Growth/balance-history data per Plaid account is incomplete.
- Error messages in `ForgotPasswordPage.jsx` need to be clearer.
- `.env`-based dev/prod URL swapping not fully wired up.

---

## 5. Next Up / To-Do (from README + journal)

- [ ] After Plaid modal connection, auto-refresh accounts/transactions to show new data
- [ ] Update Plaid Link "success" screen to show pulled data instead of "attempts"
- [ ] Better-styled emails (fonts + graphics)
- [ ] Clean up backend account handling; merge user-created + Plaid accounts
- [ ] Per-account growth data via Plaid
- [ ] Clearer error messages in `ForgotPasswordPage.jsx`
- [ ] Proper footer integration into `WelcomeScreen.jsx`
- [ ] Personalized feedback file for Centi Score; new score scale
- [ ] More robust file-handling system
- [ ] Better loading animation for Centi Score modal
- [ ] Sort by uploaded files in `TransactionTable` (or new component)
- [ ] Export selected transactions to CSV
- [ ] More personalized navbar (user details, settings)
- [ ] Set up `.env` vars for easy dev→prod swap
- [ ] Remove leftover debug endpoints

---

## 6. Session Log

| Date | Who | Summary |
|------|-----|---------|
| 2026-06-30 | Claude | Explored full repo; added `CLAUDE.md` (developer/AI guide) and this `HANDOFF.md` status tracker. Documented the route-file naming quirk and the two-model-layer pattern. |

> Add a new row each working session so the next person (or agent) can pick up cold.

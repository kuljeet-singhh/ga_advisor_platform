# GA Advisor — deployment fixes

| Environment | URL |
|-------------|-----|
| Frontend (Next.js + NextAuth) | `https://ga-advisor-platform-lhju.vercel.app` |
| API (Express) | `https://ga-advisor-platform.vercel.app` |

Sign-in runs on the **frontend** via NextAuth (`/api/auth/callback/google`). It does **not** use the backend route `/auth/google/callback`.

---

## Task 1 — Google login on Vercel (`redirect_uri_mismatch`)

**Status:** Pending (configuration only — no code changes required)

### Problem

Google OAuth returns `redirect_uri_mismatch` on production because the redirect URI sent during sign-in does not match what is registered in Google Cloud Console, or `NEXTAUTH_URL` on Vercel does not match the URL users open in the browser.

### What we know

- OAuth callback path: `{NEXTAUTH_URL}/api/auth/callback/google`
- Do **not** register `https://ga-advisor-platform.vercel.app/auth/google/callback` — that is the API host and the wrong path for NextAuth sign-in.

### What to do

#### 1.1 Google Cloud Console

OAuth 2.0 **Web client** → [Credentials](https://console.cloud.google.com/apis/credentials)

| # | Setting | Value |
|---|---------|--------|
| 1 | Authorized JavaScript origin | `https://ga-advisor-platform-lhju.vercel.app` |
| 2 | Authorized redirect URI | `https://ga-advisor-platform-lhju.vercel.app/api/auth/callback/google` |
| 3 | Keep for local dev | Origin: `http://localhost:3000` · Redirect: `http://localhost:3000/api/auth/callback/google` |

- [ ] 1.1.1 Add production origin and redirect URI (table above)
- [ ] 1.1.2 Keep localhost entries for local development
- [ ] 1.1.3 Save changes in Google Console

#### 1.2 Vercel — frontend project (root: `frontend`)

| # | Variable | Value |
|---|----------|--------|
| 1 | `NEXTAUTH_URL` | `https://ga-advisor-platform-lhju.vercel.app` (no trailing slash) |
| 2 | `NEXTAUTH_SECRET` | Strong random string (set if missing) |
| 3 | `GOOGLE_CLIENT_ID` | Same Web client as Google Console |
| 4 | `GOOGLE_CLIENT_SECRET` | Same Web client as Google Console |
| 5 | `NEXT_PUBLIC_API_URL` | `https://ga-advisor-platform.vercel.app` |

- [ ] 1.2.1 Set all variables above
- [ ] 1.2.2 Redeploy frontend

#### 1.3 Vercel — backend project (root: `backend`)

| # | Variable | Value |
|---|----------|--------|
| 1 | `FRONTEND_ORIGIN` | `https://ga-advisor-platform-lhju.vercel.app` (CORS) |
| 2 | `GOOGLE_CLIENT_ID` | Same as frontend |
| 3 | `GOOGLE_CLIENT_SECRET` | Same as frontend |
| 4 | `GOOGLE_REDIRECT_URI` | Not used for NextAuth sign-in — localhost OK for now |

- [ ] 1.3.1 Set `FRONTEND_ORIGIN` and Google credentials
- [ ] 1.3.2 Redeploy backend

#### 1.4 Verify

- [ ] 1.4.1 Open `https://ga-advisor-platform-lhju.vercel.app` (not the API URL)
- [ ] 1.4.2 Sign in with Google completes without `redirect_uri_mismatch`
- [ ] 1.4.3 If it fails, compare the error’s `redirect_uri` to `https://ga-advisor-platform-lhju.vercel.app/api/auth/callback/google` exactly

### Reference

- Plan: `.cursor/plans/fix_vercel_google_oauth_87c6dc52.plan.md`
- Docs: `frontend/README.md` (Google sign-in / Vercel env)

---

## Task 2 — Select GA4 property error (`ENOTFOUND` / 500 on `/ga/properties`)

**Status:** Done (local dev verified; code merged in repo)

### Problem

The Select property page failed with `ENOTFOUND` or HTTP 500 because:

1. `GET /ga/properties` called the database before Google’s Admin API — unnecessary and fragile on this route.
2. Direct Supabase host `db.*.supabase.co` is often IPv6-only and fails on Windows / IPv4-only networks with `ENOTFOUND`.

### What we fixed (code)

| # | Change | File |
|---|--------|------|
| 1 | Run `ensureDbUser` only when saving a connection, not when listing properties | `backend/routes/ga.routes.js` |
| 2 | Clearer database error messages in development | `backend/middleware/error.middleware.js` |
| 3 | User-facing 503 messaging when the API or DB is unavailable | `frontend/src/app/select-property/page.tsx` |

**Route behavior after fix:**

| Route | Needs DB? | Purpose |
|-------|-----------|---------|
| `GET /ga/properties` | No — Google access token only | List GA4 properties |
| `POST /ga/connections` | Yes — requires `TOKEN_ENCRYPTION_KEY` | Save selected property |

### What we did (local environment)

#### 2.1 Database (`backend/.env`)

- [x] 2.1.1 Use **Session pooler** URI from Supabase **Connect** (not direct `db.<ref>.supabase.co`)
- [x] 2.1.2 Example: host `aws-1-ap-southeast-2.pooler.supabase.com`, user `postgres.<project-ref>`
- [x] 2.1.3 Set `DATABASE_SSL_REJECT_UNAUTHORIZED=0` if TLS fails in dev (`SELF_SIGNED_CERT_IN_CHAIN`)
- [x] 2.1.4 Set `TOKEN_ENCRYPTION_KEY` (required for Save property)

#### 2.2 Migrations and backend

- [x] 2.2.1 Run `cd backend && npm run db:migrate`
- [x] 2.2.2 Restart backend after `.env` changes
- [x] 2.2.3 Confirm `GET http://localhost:4000/health/db` → `{ "ok": true, "db": "up" }`

#### 2.3 Frontend

- [x] 2.3.1 Set `NEXT_PUBLIC_API_URL` to backend origin (e.g. `http://localhost:4000`)
- [x] 2.3.2 Match `GOOGLE_CLIENT_ID` on backend with Next.js app (Bearer token validation)

#### 2.4 Verify (local)

- [x] 2.4.1 Sign in with Google → **Select property** — list loads (no `ENOTFOUND`)
- [x] 2.4.2 Select a property → **Save property** → redirects to dashboard
- [x] 2.4.3 Empty list with HTTP 200: account has no GA4 properties or missing Analytics OAuth scopes

### Production note

On Vercel backend, use the same **Session pooler** `DATABASE_URL` pattern and run migrations against production when the schema changes. See `backend/README.md`.

### Reference

- Plan: `.cursor/plans/fix_ga4_property_error_445ec9b0.plan.md`
- Docs: `backend/README.md` (database / pooler / migrations)

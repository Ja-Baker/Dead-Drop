# DEAD DROP – Developer Preview

This repo contains a lightweight implementation of the **Dead Drop** concept described in `Desc` and scoped via `Prompt`.

- **backend/** – Node/Express API that mirrors the MVP endpoints (auth, vaults, executors, triggers, memorial wall, subscriptions).
- **mobile/** – React Native prototype that applies the brutalist Dead Drop brand system and wires in the Proof-of-Life interaction.

## Backend

### Quick start
```bash
cd backend
npm install
node server.js
```
The API defaults to `http://localhost:4000`.

> **Note:** Installing packages may require configuring npm registry/network access inside your environment. The code assumes `express`, `cors`, `uuid`, and `date-fns` are available.

### Storage model
Data is persisted to `backend/dead-drop-data.json` (ignored via `.gitignore`). The structure matches the product requirements: users, vaults, executors, triggers, memorial interactions, and subscription invoices. Responses use the dark, blunt tone from the `Desc` manifesto (e.g., `"No token. No entry."`).

### Implemented endpoints
All endpoints listed in the prompt exist with JSON responses:
- `POST /api/auth/signup` – create user and session
- `POST /api/auth/login` / `logout` / `refresh` / `verify-2fa`
- Vault CRUD + content upload + preview
- Executor CRUD + vote trigger
- Trigger status, proof-of-life, manual activation, cancel, history
- Memorial wall fetch/react/comment/stats (public)
- Subscription status/checkout/cancel/invoices

Each trigger event enforces a 72-hour cancellation window and writes to the trigger log, while proof-of-life updates timestamps so inactivity calculations can fire warnings.

### Tests + CI

The backend now ships with a tiny `node:test` suite that hits the health endpoint and signup/login flow via Supertest. Run it locally with:

```bash
npm test --prefix backend
```

Set `DATA_FILE_PATH` to a temporary location when testing if you do not want to touch your local datastore (the GitHub Actions workflow uses `./tmp/ci-data.json`). Every push or pull request targeting `main` automatically runs the **Validate Dead Drop** workflow so failing tests block merges before the Railway deployment fires.

## Mobile

The React Native prototype leans on Expo for simplicity (`mobile/package.json`). It translates the brand guidance into UI primitives:
- High-contrast palette (black / white / red, no gradients)
- Helvetica-inspired typography, harsh borders, zero rounded corners
- MSCHF-style copy pulled from `Desc` ("Death is the ultimate referral program")

### Key screens included
1. **Onboarding** – three-screen manifesto plus legal disclaimer with no skip button.
2. **Dashboard** – vault grid, proof-of-life CTA, executor + check-in stats.
3. **Vault Builder** – naming, icon, trigger summary, encrypted content callout.
4. **Executors** – list with access levels and invite CTA.
5. **Memorial Wall preview** – reactions + viral CTA.
6. **Settings** – plan, security, legal callouts.

The bottom nav mimics the `Vaults / Executors / Settings / Profile (Memorial)` requirement. The Proof-of-Life button calls the backend endpoint; if offline, the UI still surfaces a local confirmation.

### Running the prototype
```bash
cd mobile
npm install
npx expo start
```
Update `API_URL` in `App.js` if the backend runs on a different host (e.g., device testing).

## Deploying to Railway

Railway now builds Dead Drop straight from the provided Dockerfile so there is zero ambiguity about working directories or install scripts. The Docker image only contains the backend API plus its `node_modules`, keeping build times fast while ignoring the Expo prototype.

1. [Install the Railway CLI](https://docs.railway.app/develop/cli) and authenticate: `railway login`.
2. From the repo root run `railway up`. The CLI will consume `railway.toml`, hand the repo to Railway's Docker builder, and ship the container produced by `Dockerfile` (Node 20 on Alpine running `backend/server.js`).
3. After the first deployment, attach configuration as needed:
   - `PORT`: optional override. Railway sets this automatically and the container respects it.
   - `DATA_FILE_PATH`: set to `/data/dead-drop-data.json` so the JSON datastore is mounted on a persistent Railway Volume.
4. Mount a 1GB+ [Railway Volume](https://docs.railway.app/reference/volumes) at `/data`. The Dockerfile exposes that path via `VOLUME /data`, so attaching the volume guarantees vault data persists between deploys.
5. Each redeploy rebuilds the Docker image; you can watch progress with `railway logs --build`. Once healthy, the `/` healthcheck baked into `railway.toml` confirms the API is responsive.

The backend `.env.example` lists the same variables you can use for local testing with `npm run dev --prefix backend`. To run the exact image Railway will execute, use `docker build -t dead-drop-api . && docker run --rm -p 4000:4000 dead-drop-api`.

## Next steps
- Swap the in-memory JSON store for PostgreSQL + Redis-based trigger scheduler.
- Wire S3 uploads + client-side encryption per secure vaults.
- Flesh out executor onboarding emails/SMS via Twilio + SES.
- Harden auth (bcrypt passwords, JWT expiration, biometric hooks on mobile).

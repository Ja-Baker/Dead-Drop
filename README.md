# DEAD DROP 🪦

**YOUR FINAL DROP**

A dead man's switch for your digital soul. Create vaults of content that get released to chosen executors after death or extended inactivity.

## What It Is

You're gonna die. Your phone won't.

500GB of screenshots. 10,000 memes. Inside jokes nobody will understand. The real story of what happened that night. Your actual personality, compressed into folders labeled "if u see this im dead lol"

Where does it go? Your next of kin who doesn't know your password? Apple's iCloud cemetery? Nowhere?

**Fuck that.**

DEAD DROP is a dead man's switch for your digital soul.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: AWS S3 (or Railway volumes)
- **Auth**: JWT + 2FA (TOTP)
- **Payments**: Stripe
- **Encryption**: AES-256

## Project Structure

```
dead-drop/
├── backend/          # Node.js/Express API
├── web/             # React web app
├── shared/          # Shared types/utilities
└── railway.json     # Railway deployment config
```

## Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../web && npm install
```

2. Set up environment variables (see `backend/env.example` and `web/.env.example`)

3. Run database migrations:
```bash
cd backend && npm run migrate
```

4. Start development servers:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Web
npm run dev:web
```

Visit `http://localhost:5173` for the web app.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/setup-2fa` - Setup 2FA
- `POST /api/auth/verify-2fa` - Verify 2FA token
- `POST /api/auth/logout` - Logout

### Vaults
- `GET /api/vaults` - List user's vaults
- `POST /api/vaults` - Create vault
- `GET /api/vaults/:id` - Get vault details
- `PUT /api/vaults/:id` - Update vault
- `DELETE /api/vaults/:id` - Delete vault
- `GET /api/vaults/:id/preview` - Preview vault

### Executors
- `GET /api/executors` - List executors
- `POST /api/executors/invite` - Invite executor
- `PUT /api/executors/:id/permissions` - Update permissions
- `DELETE /api/executors/:id` - Remove executor

### Triggers
- `GET /api/triggers/status` - Get trigger status
- `POST /api/triggers/proof-of-life` - Check in
- `POST /api/triggers/cancel` - Cancel trigger
- `GET /api/triggers/history` - Get trigger history

### Memorial
- `GET /api/memorial/:vaultId` - View memorial
- `POST /api/memorial/:vaultId/react` - Add reaction
- `POST /api/memorial/:vaultId/comment` - Add comment
- `GET /api/memorial/:vaultId/stats` - Get stats

### Subscription
- `GET /api/subscription` - Get subscription
- `POST /api/subscription/checkout` - Create checkout
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/invoices` - Get invoices

## Subscription Tiers

- **Free**: 3 vaults, 25 content pieces, 3 executors, 6-month trigger only
- **Premium ($49/year)**: Unlimited everything, custom domains, encryption, video uploads
- **Enterprise ($199/year)**: 5 accounts, shared executor network, legal docs integration

## Development

This is a monorepo using npm workspaces. Run commands from the root:

- `npm run dev:backend` - Start backend dev server (port 3000)
- `npm run dev:web` - Start web dev server (port 5173)
- `npm run build:backend` - Build backend
- `npm run build:web` - Build web app

## Deployment

Deploy to Railway using `railway.json` configuration. Set environment variables in Railway dashboard.

## Features

- ✅ User authentication (signup, login, JWT, 2FA)
- ✅ Vault management (create, edit, delete)
- ✅ Content upload (images, videos, audio, text, URLs)
- ✅ Executor system (invite, manage, access levels)
- ✅ Proof of life check-ins with streak tracking
- ✅ Trigger system (inactivity, scheduled, manual)
- ✅ Memorial wall (reactions, comments)
- ✅ Subscription management (Stripe)
- ✅ Encryption for secure vaults
- ✅ Brutalist dark UI design

## License

Death is inevitable. Cringe is optional. Your memes are forever.

---

**DEAD DROP** 🪦


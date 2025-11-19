# Dead Drop Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or Railway)
- Redis instance (local or Railway)
- Railway account (for deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install mobile dependencies
cd ../mobile && npm install

# Install shared dependencies
cd ../shared && npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Using psql
createdb deaddrop

# Or using Railway CLI
railway add postgresql
```

### 3. Redis Setup

Start Redis locally:

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Or use Railway Redis
railway add redis
```

### 4. Environment Variables

Copy the example environment file:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/deaddrop
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
ENCRYPTION_KEY=your-32-byte-encryption-key
# ... etc
```

**Important**: Generate secure random keys for JWT and encryption:

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate encryption key (32 bytes)
openssl rand -hex 32
```

### 5. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 6. Start Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Web (in a new terminal):**
```bash
cd web
npm run dev
```

## Railway Deployment

### 1. Install Railway CLI

```bash
npm i -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

### 3. Initialize Project

```bash
railway init
```

### 4. Add Services

```bash
# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis
```

### 5. Set Environment Variables

In Railway dashboard, set all environment variables from `backend/env.example`.

### 6. Deploy

```bash
railway up
```

### 7. Run Migrations

After first deployment:

```bash
railway run npm run migrate
```

### 8. Set Up Cron Job (Optional)

For trigger monitoring, set up a daily cron job:

```bash
# In Railway, add a cron service or use Railway Cron
# Runs daily at midnight UTC
railway cron "0 0 * * *" "cd backend && npm run job:monitor-triggers"
```

## Testing the API

### Health Check

```bash
curl http://localhost:3000/health
```

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "ageVerified": true
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Vault (with auth token)

```bash
curl -X POST http://localhost:3000/api/vaults \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My First Vault",
    "triggerType": "inactivity",
    "isEncrypted": false
  }'
```

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l`

### Redis Connection Issues

- Verify `REDIS_URL` is correct
- Check Redis is running: `redis-cli ping`
- Should return `PONG`

### Port Already in Use

Change `PORT` in `.env` or kill the process:

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Migration Errors

If migrations fail, you may need to drop and recreate:

```bash
# WARNING: This deletes all data
dropdb deaddrop
createdb deaddrop
npm run migrate
```

## Next Steps

1. Set up email service (Resend or SendGrid)
2. Configure AWS S3 for file storage (or use Railway volumes)
3. Set up Stripe for payments
4. Configure push notifications for mobile
5. Set up monitoring and logging
6. Add unit and integration tests

## Development Tips

- Use `npm run dev:backend` from root to start backend
- Use `npm run dev:mobile` from root to start mobile app
- Check logs in Railway dashboard for production issues
- Use Railway's built-in PostgreSQL and Redis for easy setup
- Test API endpoints with Postman or curl


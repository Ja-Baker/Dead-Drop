# Railway Auto-Setup Guide

## 🚀 Zero-Config Deployment

This app is now **fully automatic** on Railway! Just deploy and it works.

## What Happens Automatically

### ✅ Database Setup
- **Auto-detects** Railway PostgreSQL (`DATABASE_URL`, `POSTGRES_URL`, or `POSTGRES_PRIVATE_URL`)
- **Auto-runs migrations** on first startup if tables don't exist
- **Retries connections** automatically if database isn't ready

### ✅ Redis Setup (Optional)
- **Auto-detects** Railway Redis (`REDIS_URL` or `REDISCLOUD_URL`)
- Works without Redis (features gracefully degrade)

### ✅ Security Keys
- **Auto-generates** JWT and encryption keys in development
- **Warns** if keys aren't set in production (but still works for testing)

## Quick Deploy Steps

1. **Connect your GitHub repo** to Railway
2. **Add PostgreSQL service** (Railway Dashboard → "+ New" → "Database" → "PostgreSQL")
3. **Deploy** - That's it! 🎉

Railway will:
- ✅ Auto-detect the database
- ✅ Auto-run migrations
- ✅ Start the server
- ✅ Handle all connections

## Optional: Add Redis

If you want Redis features (caching, rate limiting):
1. Add Redis service: "+ New" → "Database" → "Redis"
2. Railway auto-sets `REDIS_URL`
3. App auto-connects on next deploy

## Production Security (Recommended)

For production, set these environment variables in Railway:

```
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
NODE_ENV=production
```

**But the app will work without them** - it just auto-generates keys with warnings.

## That's It!

No manual migrations, no config files, no setup scripts. Just deploy and go! 🪦


# Railway Deployment Setup Guide

## Quick Setup Steps

### 1. Add PostgreSQL Database
1. In Railway dashboard, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Link it to your service

### 2. Add Redis (Optional but Recommended)
1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway will automatically set the `REDIS_URL` environment variable

### 3. Run Database Migrations
After the database is added, you need to run migrations:

**Option A: Using Railway CLI**
```bash
railway run cd backend && npm run migrate
```

**Option B: Using Railway Dashboard**
1. Go to your service
2. Click on "Deployments" → "Latest"
3. Open the shell/terminal
4. Run: `cd backend && npm run migrate`

### 4. Set Required Environment Variables

In Railway dashboard, go to your service → "Variables" and add:

**Required:**
- `NODE_ENV=production`
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 32`
- `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`

**Optional (for full functionality):**
- `FRONTEND_URL` - Your frontend URL (e.g., `https://your-app.railway.app`)
- `STRIPE_SECRET_KEY` - For subscription payments
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `RESEND_API_KEY` or `SENDGRID_API_KEY` - For email notifications
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` - For file storage

**Note:** `DATABASE_URL` and `REDIS_URL` are automatically set by Railway when you add those services.

### 5. Deploy

Railway will automatically deploy when you push to your connected branch. The app will:
- Start even if database/Redis aren't ready
- Retry connections automatically
- Be available at the health check endpoint: `/health`

## Troubleshooting

### App crashes on startup
- Check that PostgreSQL service is added and linked
- Verify `DATABASE_URL` is set (Railway sets this automatically)
- Check logs for connection errors

### Database connection fails
- Ensure PostgreSQL service is running
- Check `DATABASE_URL` format (should be `postgresql://...`)
- Wait a few seconds - the app retries connections automatically

### Migrations fail
- Make sure PostgreSQL service is added
- Run migrations from Railway shell: `cd backend && npm run migrate`
- Check that `DATABASE_URL` is accessible

### Health check fails
- The `/health` endpoint should work even without database
- Check that the app is listening on the correct port (Railway sets `PORT` automatically)

## Environment Variables Reference

See `backend/env.example` for all available environment variables.

## Next Steps

1. ✅ Add PostgreSQL service
2. ✅ Add Redis service (optional)
3. ✅ Set environment variables
4. ✅ Run database migrations
5. ✅ Deploy and test

Your app should now be running on Railway! 🚀


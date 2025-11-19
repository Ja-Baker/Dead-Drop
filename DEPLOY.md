# 💀 DEAD DROP - Railway Deployment Guide

## Quick Deploy

### Option 1: GitHub → Railway (Recommended)

1. **Push your code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Dead Drop MVP"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Dead Drop repository
   - Railway will auto-detect the configuration and deploy

3. **That's it!** Railway will:
   - Install dependencies (`npm ci`)
   - Build the app (`npm run build`)
   - Start the server (`node server.js`)
   - Generate a public URL

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
cd dead-drop-web
railway init
railway up
```

## Environment Variables

No environment variables needed for the MVP demo! 🎉

## Post-Deployment

1. Railway will give you a URL like: `https://your-app.railway.app`
2. Visit the URL on your phone to test mobile experience
3. Share the link to demo!

## Build Configuration

The project includes:
- `railway.json` - Railway platform config
- `nixpacks.toml` - Build instructions
- `server.js` - Production Express server
- `.gitignore` - Excludes node_modules and dist

## Troubleshooting

**Build fails?**
- Check that all dependencies are in `package.json`
- Verify `npm run build` works locally

**Server won't start?**
- Railway uses the `start` script from package.json
- Check that `dist/` folder was created during build

**404 errors on routes?**
- The Express server handles client-side routing
- All routes redirect to index.html

## Mobile-First Testing

Once deployed:
1. Open the Railway URL on your phone
2. Add to home screen for app-like experience
3. Test the full flow:
   - Landing → Auth → Dashboard
   - Create vault → Add content
   - Proof of Life button

## Next Steps

After Railway deployment:
- Set up custom domain (optional)
- Monitor with Railway dashboard
- Plan React Native migration
- Build backend API

---

**DEAD DROP** 🪦
*Your final drop, now live*

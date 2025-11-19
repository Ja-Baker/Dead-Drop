# 💀 DEAD DROP - Project Summary

## What We Built

A **mobile-first web application** with an emo-goth MSCHF aesthetic that serves as the MVP demo for Dead Drop - a digital legacy platform.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Zustand (with localStorage persistence)
- **Styling**: Pure CSS with custom design system
- **Animations**: CSS animations + Framer Motion
- **Server**: Express 5
- **Deployment**: Railway (with Nixpacks)

## Project Structure

```
dead-drop-web/
├── src/
│   ├── components/
│   │   ├── primitives/          # Button, Input, Card
│   │   ├── layout/              # MobileContainer, TopBar, BottomNav
│   │   └── features/            # ProofOfLifeButton, VaultCard
│   ├── pages/                   # All page components
│   │   ├── LandingPage.tsx      # Landing with skull animation
│   │   ├── AuthPage.tsx         # Login/Signup with tabs
│   │   ├── DashboardPage.tsx    # Main dashboard + Proof of Life
│   │   ├── VaultCreatePage.tsx  # Create new vault
│   │   ├── VaultDetailPage.tsx  # View/edit vault
│   │   ├── ExecutorsPage.tsx    # Placeholder
│   │   └── SettingsPage.tsx     # Settings + logout
│   ├── store/
│   │   └── useStore.ts          # Zustand store with persistence
│   ├── styles/
│   │   ├── variables.css        # Design tokens
│   │   ├── global.css           # Global styles
│   │   └── animations.css       # Keyframe animations
│   ├── App.tsx                  # Router + route protection
│   └── main.tsx                 # Entry point
├── server.js                    # Express server for production
├── railway.json                 # Railway deployment config
├── nixpacks.toml               # Build configuration
└── package.json                # Dependencies + scripts
```

## Features Implemented

✅ **Landing Page** - Skull animation, edgy copy
✅ **Authentication** - Mock login/signup with tabs
✅ **Dashboard** - Proof of Life button, vault grid
✅ **Vault Management** - Create, view, delete vaults
✅ **Content Management** - Add content to vaults (demo mode)
✅ **Settings** - Account info, logout
✅ **Executors** - Placeholder page
✅ **Mobile-First** - 375px mobile container, responsive
✅ **State Persistence** - localStorage via Zustand
✅ **Protected Routes** - Auth-based routing
✅ **Production Ready** - Build + serve with Express

## Design System

### Colors
- `--void-black`: #000000
- `--ghost-white`: #FFFFFF
- `--blood-red`: #FF0000
- `--neon-red`: #FF0033
- `--ash-gray`: #1a1a1a
- `--corpse-gray`: #666666

### Typography
- **Display**: Impact, Helvetica Bold (headers, buttons)
- **Body**: Arial (paragraphs, inputs)
- **Mono**: Courier New (timestamps, metadata)

### Design Principles
- Brutalist minimalism
- High contrast
- Thick borders (4px)
- Sharp corners (0px border-radius)
- Aggressive animations (glitch, shake, pulse)
- Blunt, darkly humorous copy

## Key Components

### ProofOfLifeButton
- Large pulsing button in center of dashboard
- Animated click state with rotation
- Updates last check-in timestamp
- Red glow on hover

### VaultCard
- Grid item showing vault emoji, name, stats
- Hover effect with red border glow
- Click navigates to vault detail

### TopBar
- Fixed header with app name + back button
- Red bottom border
- Emoji in title

### BottomNav
- Fixed bottom navigation
- 3 tabs: Vaults, Executors, Settings
- Active state with red underline + glow

## Scripts

```bash
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build (outputs to dist/)
npm run preview  # Preview production build
npm start        # Start Express server (port 3000)
```

## Deployment Instructions

See [DEPLOY.md](./DEPLOY.md) for full Railway deployment guide.

**Quick version:**
1. Push code to GitHub
2. Connect repo to Railway
3. Railway auto-builds and deploys
4. Visit generated URL

## Mobile-to-Native Migration Path

This web app is built to be easily converted to React Native:

1. **Components** - Already mobile-first and component-based
2. **State** - Zustand works in React Native
3. **Styling** - CSS → StyleSheet conversion straightforward
4. **Navigation** - React Router → React Navigation
5. **Storage** - localStorage → AsyncStorage

## What's Next?

### Immediate (Post-Demo)
- [ ] Backend API (Node + PostgreSQL)
- [ ] Real authentication (JWT)
- [ ] File upload (AWS S3)
- [ ] Executor invitations

### Near Future
- [ ] React Native conversion
- [ ] Push notifications
- [ ] Trigger system
- [ ] Memorial wall

### Long Term
- [ ] Death certificate verification
- [ ] Legal integrations
- [ ] Subscription payments (Stripe)
- [ ] Premium features

---

**DEAD DROP** 🪦  
Built: November 2025  
Status: MVP Demo Ready  
Vibe: Emo Goth MSCHF Energy

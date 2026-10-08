# Stackr

> Micro-habit tracker built on habit stacking — define triggers, attach tiny habits, stack your way to better routines.

## What Is It?

Stackr is a mobile-first PWA that uses the science of **habit stacking**: instead of building habits by time ("I'll meditate at 7 AM"), you attach them to triggers you already do ("After I make coffee, I'll meditate for 2 minutes").

### Core Concept

A **Stack** has a trigger ("After I make coffee") and a set of micro-habits attached to it. You check them off throughout the day. The app tracks streaks, awards XP, and shows your progress.

## Features

- **Habit Stacks** — Create stacks with custom triggers, colors, and icons
- **Daily Checklist** — 2-tap logging, organized by stack
- **Streak Tracking** — Per-habit streaks with fire indicators
- **Last 7 Days** — Bar chart showing daily completion activity
- **XP & Levels** — Earn XP for every completion, bonus for full stacks and streaks
- **Achievement Badges** — Unlock milestones as you build consistency
- **Offline-First** — All data stored locally in IndexedDB, works without internet
- **PWA** — Install on iOS/Android homescreen

## Tech Stack

- **Frontend:** SvelteKit 5 (runes mode), Tailwind CSS 4
- **Storage:** IndexedDB (offline-first via `idb`)
- **Testing:** Vitest
- **Deploy:** Vercel (or any SvelteKit adapter)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
git clone https://github.com/youngadults/stackr.git
cd stackr
npm install
```

### Development

```bash
npm run dev        # Start dev server
npm run test       # Run tests
npm run check      # Type checking
npm run build      # Production build
```

### Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Deploy

For other platforms, install the appropriate SvelteKit adapter (e.g., `@sveltejs/adapter-node` for Node.js).

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── DateNav.svelte      # Date navigation
│   │   ├── NewStackModal.svelte # Stack creation bottom sheet
│   │   ├── GardenPlant.svelte  # Deterministic L-system garden plant SVG
│   │   ├── MachineBuild.svelte # Vintage-radio machine theme SVG
│   │   ├── GardenHero.svelte   # Rewards garden scene (per-stack plots)
│   │   └── Toast.svelte         # Toast notifications
│   ├── services/
│   │   ├── db.ts               # IndexedDB offline storage (incl. settings store)
│   │   └── pwa.ts              # Service worker registration
│   ├── stores/
│   │   ├── app.svelte.ts       # Svelte 5 runes-based state (CRUD)
│   │   ├── profile.ts          # Profile, XP, achievement logic
│   │   └── toast.ts            # Toast notification state
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── utils/
│       ├── badges.ts           # Achievement definitions & checks
│       ├── plant-renderer.ts   # Cozy L-system plant → SVG geometry
│       ├── plant-growth.ts     # Stack activity → plant stage/progress map
│       ├── gamification.ts     # XP, levels, streaks
│       └── helpers.ts          # Date, color, ID utilities
├── routes/
│   ├── +layout.svelte          # App shell, bottom nav
│   ├── +page.svelte            # Today view (checklist)
│   ├── stacks/
│   │   ├── +page.svelte        # Stack management
│   │   └── [id]/+page.svelte  # Individual stack detail
│   ├── stats/+page.svelte      # Statistics
│   └── achievements/+page.svelte # Rewards garden + badge gallery
├── app.css                     # Global styles + Tailwind
└── app.html                    # HTML shell
```

## Gamification Math

### XP
- 10 XP per habit completed
- +25 XP bonus for completing a full stack
- +5 XP per streak day (capped at +50)

### Levels
- Level N requires `25 × N × (N+1)` total XP
- Level 1 = 50 XP, Level 5 = 750 XP, Level 10 = 2,750 XP

### Badges
20 achievements across 5 categories:
- **Streaks:** 3, 7, 14, 30, 100 day streaks
- **Completions:** 1, 10, 50, 100, 500, 1000 habits
- **Stacks:** First stack, 5 stacks, full stack completion
- **Levels:** 5, 10, 25, 50
- **Special:** Night owl, early bird

## Offline-First Architecture

Stackr uses IndexedDB as the sole data store. All data lives in your browser — no server, no account, no sync. The app works fully offline from the moment you open it.

A local user ID is generated on first launch and stored in localStorage. All IndexedDB records are keyed to this ID, so data persists across sessions.

## PWA Setup

The app includes a web manifest at `static/manifest.webmanifest` and icons at `static/icon-192.png` and `static/icon-512.png`.

The service worker source is at `src/sw.ts`. It's built separately via:

```bash
npm run build:sw
```

This outputs `static/service-worker.js`. The full build (`npm run build`) runs this automatically.

The service worker uses a network-first strategy for navigation and cache-first for static assets, with IndexedDB as the data layer for offline operation.

## Security

- No secrets in client code
- Input validation on all forms
- `.env.example` documents required variables (none required — app is fully local)

## License

MIT
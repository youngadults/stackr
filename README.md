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
- **Rewards Room** — A cozy lofi-style pixel room that furnishes itself as you earn XP
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
│   ├── assets/room/           # CC0 16px room tiles + CREDITS.md
│   ├── room/
│   │   ├── layout.ts          # Room furniture layout map (stage-gated)
│   │   └── room-stage.ts      # XP → stage, day/night + sleepy mood
│   ├── components/
│   │   ├── DateNav.svelte      # Date navigation
│   │   ├── NewStackModal.svelte # Stack creation bottom sheet
│   │   ├── LofiRoom.svelte    # Rewards lofi-room hero (pixel art)
│   │   └── Toast.svelte        # Toast notifications
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
│       ├── gamification.ts     # XP, levels, streaks
│       └── helpers.ts          # Date, color, ID utilities
├── routes/
│   ├── +layout.svelte          # App shell, bottom nav
│   ├── +page.svelte            # Today view (checklist)
│   ├── stacks/
│   │   ├── +page.svelte        # Stack management
│   │   └── [id]/+page.svelte  # Individual stack detail
│   ├── stats/+page.svelte      # Statistics
│   └── achievements/+page.svelte # Rewards lofi-room hero + stage progress
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

### Badges (data model)
20 achievement keys across 5 categories still unlock silently from the same
XP/streak data and are stored in IndexedDB:
- **Streaks:** 3, 7, 14, 30, 100 day streaks
- **Completions:** 1, 10, 50, 100, 500, 1000 habits
- **Stacks:** First stack, 5 stacks, full stack completion
- **Levels:** 5, 10, 25, 50
- **Special:** Night owl, early bird

## Rewards Room & Progression

The achievements page renders one lofi-style cozy room built from 16px CC0
tiles (attribution in `src/lib/assets/room/CREDITS.md`; 29 sprites total —
26 stage-gated furniture sprites placed via `ROOM_ITEMS` in
`src/lib/room/layout.ts`, plus the wall, baseboard and floor shell tiles
rendered as CSS backgrounds).

Furniture reveals are gated by **cumulative profile XP**, independent of the
level curve above. The stage is derived only from XP
(`stageFromXp` in `src/lib/room/room-stage.ts`), so it never regresses, and
the bar under the room shows the percentage toward the next stage reveal
(`stageProgress`) — it sits at 100% once the final stage is reached.

### Room stages

| Stage | Name | Unlocks at (cumulative profile XP) |
| --- | --- | --- |
| 1 | Floor Days | 0 |
| 2 | First Desk | 150 |
| 3 | Green Corner | 400 |
| 4 | Proper Pad | 800 |
| 5 | Lived In | 1,400 |
| 6 | Sanctuary | 2,200 |

### What appears at each stage

- **Stage 1 — Floor Days:** bare walls and floor with a night window, a folded
  blanket and pillow, a rolled-up sleeping mat, a wooden storage crate and a
  lit candelabra.
- **Stage 2 — First Desk:** a small wooden desk with a tucked-in chair.
- **Stage 3 — Green Corner:** a potted sprout on the desk and a framed poster
  on the wall.
- **Stage 4 — Proper Pad:** a proper bed (replaces the floor blanket and
  bedroll) and a 3×3 tiled rug.
- **Stage 5 — Lived In:** a three-section bookshelf and a pet pig napping on
  the rug.
- **Stage 6 — Sanctuary:** a media shelf with a speaker, plus string lights
  along the wall.

### Moods

The room's mood is `deriveRoomMood(hour, lastCompletionDate, today)` in
`src/lib/room/room-stage.ts`, rendered in `LofiRoom.svelte`:

- **Night (19:00–06:00 local):** warm lamp glow around the candelabra, rain
  streaks in the window and a film-grain overlay. **Day:** bright with a soft
  warm tint.
- **Sleepy:** when no habit was completed in the last 3 days (or ever), the
  lamp glow dims and a sleepy vignette settles over the room. Sleepy is
  cosmetic only — the stage never regresses.

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
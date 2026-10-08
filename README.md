# Smart Worksheet · by childplay

Playful learning sheets for kids, right in the browser — phone, tablet, iPad or
laptop, and installable to the home screen. *Belajar sambil bermain.*

| Sheet | What the child does |
|---|---|
| Cari Bayangan | drags each animal onto its shadow |
| Makanan Hewan | drags each food to the animal that eats it |
| Puzzle Gambar | rebuilds a picture from 4, 9 or 16 pieces |
| Tebak Suara | hears an animal and taps the right one |
| Mewarnai | draws and colours over a faint animal, and can save it |
| Ayo Berhitung | counts fruit and taps the number |
| Kelompokkan | sorts animals, fruit and things into baskets |
| Kartu Ingatan | flips cards to find the pairs |

Stars (fewer mistakes, more stars) are kept per worksheet. Signing in with Google
keeps them across devices; everything works without signing in.

## Stack

Same shape as Ayok Ngaji: no build step.

- `public/` — vanilla ES modules (`app.js` shell, `sheets.js` worksheets, `drag.js`
  pointer-event drag and drop for finger, pen and mouse, `data.js` content), a
  service worker for offline use, and a web app manifest.
- `api/` — Vercel functions: `auth` (Google ID token → session cookie; also the
  iPhone home-screen sign-in through Safari with `handoff`), `me`, `progress`
  (best stars, only ever up), `play` (finished sheets), `config`.
- Turso (libSQL) for users, stars and plays. Tables are created idempotently in
  `api/_lib.js` — the production database is only ever added to, never reset.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3200, with .env.local (see .env.example)
npm test
```

## Deploy

1. A Turso database: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
2. A Google OAuth client (Web): add the site's origin under *Authorized JavaScript
   origins* and `https://<domain>/api/auth` under *Authorized redirect URIs*;
   set `GOOGLE_CLIENT_ID`.
3. `SESSION_SECRET` (`openssl rand -base64 32`).
4. Import the repo in Vercel (no build command; output is `public/`, functions in `api/`).

## Assets

- Brand: childplay logos in `public/brand/` (owner: childplay).
- Pictures are emoji, drawn by the device.
- Animal sounds (`public/sounds/`), trimmed and loudness-normalised:
  - [BigSoundBank](https://bigsoundbank.com) by Joseph Sardin, CC0 — cow (s2384),
    cat (s1472), dog (s0916), rooster (s0474), duck (s0276), sheep (s2343),
    horse (s0863), frog (s0819), goat (s1380), owl (s1763), bee (s1000), bird (s3496).
  - Elephant: [Elephant voice - trumpeting.ogg](https://commons.wikimedia.org/wiki/File:Elephant_voice_-_trumpeting.ogg), Wikimedia Commons, CC0.
- Game sound effects are synthesised in the browser (`sfx.js`).

# Smart Worksheet · by childplay

Playful learning sheets for kids, right in the browser — phone, tablet, iPad or
laptop, and installable to the home screen. *Belajar sambil bermain.*

**Live at [ayokmain.my.id](https://ayokmain.my.id)** · free, no ads ·
open source, and contributions are welcome (see [Contributing](#contributing)).

Nineteen worksheets in five levels. Level 1 is open to everyone; each next
level needs a signed-in (Google) account with enough stars — stars are kept per
account and synced, so every child's progress is their own.

| Level (stars needed) | Sheets |
|---|---|
| 1 · Ayo Mulai (free) | Cari Bayangan (shadows), Makanan Hewan (animal food), Cari di Gambar (find things in a busy picture), Ayo Berhitung (counting) |
| 2 · Pintar Mencocokkan (5★) | Puzzle Gambar (4/9/16 pieces), Kelompokkan (sort into baskets), Kartu Ingatan (memory) |
| 3 · Kreasi & Suara (12★) | Tebak Suara (animal sounds), Mewarnai (colouring), Puzzle Fotoku (puzzle from your own photo — it never leaves the device) |
| 4 · Ayo Bicara (20★) | Tebak Nama Hewan, Tebak Angka, Tebak Nama Buah, Tebak Nama Benda, Tebak Transportasi, Tebak Warna, Tebak Bentuk — say it (speech recognition, Indonesian) |
| 5 · Huruf & Kata (28★) | Tebak Huruf, Tebak Kata — say the letter / read the word aloud |

The **Belajar** tab (free, no stars) has picture cards to tap and hear: letters
A–Z with a word each, numbers 1–20, colours, shapes, animals, plants, fruit, things, vehicles,
and simple sums. It speaks with the device's own Indonesian voice (`say()` in
`voice.js`); without one, the cards still show the words.

Speaking games use the browser's speech recognition (`voice.js`); without it
(e.g. Firefox, or no mic permission) they become tap-the-answer games.
Stars: no mistakes 3, one or two 2, more 1. `/analytics` is the owner's
dashboard (emails in `ADMIN_EMAILS`).

## Stack

Same shape as Ayok Ngaji: no build step.

- `public/` — vanilla ES modules (`app.js` shell, `sheets.js` worksheets, `drag.js`
  pointer-event drag and drop for finger, pen and mouse, `data.js` content), a
  service worker for offline use, and a web app manifest.
- `api/` — Vercel functions: `auth` (Google ID token → session cookie; also the
  iPhone home-screen sign-in through Safari with `handoff`), `me` (account, and
  deleting it), `progress` (best stars, only ever up), `play` (finished sheets),
  `rating` and `event` (reviews and taps from the Dukung tab), `analytics` (the
  owner's dashboard), `config`.
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

## Contributing

Contributions are very welcome: new worksheets, better Indonesian content,
accessibility fixes, bug reports, or ideas from parents and teachers.

- **Ideas and bugs:** open an [issue](https://github.com/singgihsaputro/smart-worksheet/issues).
  Screenshots and the phone/browser you used help a lot.
- **Code:** fork, make a branch, run `npm run dev` and `npm test`, then open a
  pull request that says what changed and how you checked it.
- **A new worksheet** is one function in `public/sheets.js` that builds itself
  into `area` and calls `done({ mistakes })`, plus an entry in `SHEETS`; content
  lists live in `public/data.js`.
- Keep it simple: plain ES modules, no build step, no new dependencies unless
  there is no small alternative.
- Keep it safe for children: no ads, no trackers, nothing that collects more
  than the [Privacy Policy](https://ayokmain.my.id/privacy) says.
- **The database is additive only.** Schema changes go in `ready()` in
  `api/_lib.js` as `CREATE … IF NOT EXISTS` (or a new column with a default);
  never drop or reset anything, because real children's progress is in it.

## License

The code is [MIT](LICENSE). Not covered by it: the childplay name and logos
(`public/brand/`), which belong to childplay; the donation QR code
(`public/qris.jpg`), which is for this site only; and the animal sounds, which
keep their own licences (listed under [Assets](#assets)).


# Slayer Terminal — the pre-launch page

The landing page alone, before the terminal opens. One page, two legal pages, and a sign-up at the foot: a visitor
leaves an email (and a phone number if they like) and is written to the day the terminal opens.

## Run it

```bash
npm install
npm run dev
```

`npm run build` type-checks and writes `dist/`.

## Deploy

Netlify, from this repo: `netlify.toml` names the build (`npm run build` → `dist`) and the one-page redirect. The sign-up is a
**Netlify Form** named `notify` (`index.html` carries the still copy Netlify's build bot reads; `src/pages/landing/NotifyForm.tsx`
is the one on the page). After the first deploy, open the site's **Forms** tab and switch on the notifications you want
(email, Slack, or a webhook to an SMS service) — the entries collect there either way.

## Where things are

- `src/pages/landing/Landing.tsx` — the page; `NotifyForm.tsx` — the sign-up card; `pieces.tsx` — the bar and the shared pieces.
- `public/landing/` — the films and stills of the terminal the page plays.
- `src/pages/landing/legal/` — Terms and Privacy.

The page is the terminal's own landing, taken whole; the terminal lives in its own repo.

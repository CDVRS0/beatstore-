# CDVRS Beat Store

A fully self-owned beat marketplace: browse, preview, license, and instantly download beats — no BeatStars/TrakTrain subscription, no revenue share, no middleman.

Built with Next.js 14, PostgreSQL (via Prisma), Cloudflare R2 for file storage, Stripe for payments, and Resend for email.

---

## 1. What's included (Phase 1)

- **Storefront**: home page with featured/best-seller/recent rails, filterable shop (genre, mood, BPM, key, tags, search), beat detail pages with a waveform preview player, license comparison, license agreement + acceptance flow, cart, Stripe checkout, instant download page.
- **Persistent player**: preview audio keeps playing while you browse to other pages.
- **Customer accounts**: register/login, order history, wishlist.
- **Admin dashboard** (`/admin`): upload/edit/delete beats, upload artwork/tagged previews/full-resolution files (MP3/WAV/stems), manage license types and per-beat pricing, mark beats "Exclusive Sold" (instantly disables purchasing), view revenue/orders/customers/download counts.
- **SEO**: dynamic sitemap, robots.txt, per-page metadata, Open Graph tags.
- **Extras**: newsletter signup, contact form, FAQ page, Google Analytics hook, social links.

## 2. What's stubbed for later (Phase 2)

The schema and code are structured so these can be added without a rewrite: PayPal, discount codes, affiliate links, automated email marketing sequences, saved carts across devices, AI recommendations, subscription memberships, multi-vendor support.

---

## 3. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| File storage | Cloudflare R2 (S3-compatible) |
| Payments | Stripe Checkout + webhooks |
| Email | Resend |
| Auth | NextAuth (credentials, JWT sessions) — separate admin and customer logins |
| Waveform player | wavesurfer.js |

No recurring marketplace fees. You do pay for hosting/DB/storage/email at your usage level, but every one of these has a free or near-free tier that comfortably covers an artist just getting started (see cost notes below).

---

## 4. Local setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local, or a free instance from [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- A Cloudflare account (for R2 storage)
- A Stripe account
- A Resend account (for transactional email)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables and fill them in
cp .env.example .env
# edit .env with your DATABASE_URL, R2, Stripe, Resend, and NEXTAUTH_SECRET values

# 3. Push the schema to your database
npm run db:push

# 4. Seed an admin account + default license types
npm run db:seed

# 5. Run the dev server
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the dashboard (credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` at seed time).

---

## 5. Setting up each service

### PostgreSQL (Neon example — free tier)
1. Create a project at neon.tech.
2. Copy the connection string into `DATABASE_URL` in `.env`.

### Cloudflare R2
1. Create a bucket (e.g. `cdvrs-beat-store`) in the Cloudflare dashboard → R2.
2. Create an API token with **Object Read & Write** permissions for that bucket → note the Account ID, Access Key ID, and Secret Access Key into `.env`.
3. Enable a public bucket URL (Settings → Public Access → allow `r2.dev` subdomain, or attach a custom domain) — this is used only for **public** assets (artwork + tagged previews). Full-resolution deliverable files stay private and are only ever served through signed, expiring links.
4. Put the public URL into `NEXT_PUBLIC_CDN_URL` and its hostname into `NEXT_PUBLIC_CDN_HOSTNAME`.

### Stripe
1. Get your API keys from the Stripe dashboard (Developers → API keys) → `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Add a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`, listening for `checkout.session.completed` and `checkout.session.expired`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. For local testing, use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

### Resend
1. Verify your sending domain (or use their test domain while developing).
2. Create an API key → `RESEND_API_KEY`, and set `EMAIL_FROM` to an address on your verified domain.

### Google Analytics (optional)
Create a GA4 property, copy the Measurement ID (`G-XXXXXXXXXX`) into `NEXT_PUBLIC_GA_ID`. Leave blank to disable — no tracking script loads if unset.

---

## 6. Deploying

### Recommended: Vercel
1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com).
3. Add all the variables from `.env` into the Vercel project's Environment Variables.
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain.
5. Deploy. Run `npm run db:push` and `npm run db:seed` once against your production database (either from your machine with `DATABASE_URL` pointed at prod, or via a one-off Vercel deployment shell).
6. Point your Stripe webhook at the production URL.

### Self-hosting (VPS / your own server)
This is a standard Next.js app — `npm run build && npm start` behind a reverse proxy (e.g. Nginx) works on any VPS (Hetzner, DigitalOcean, etc.) if you want zero platform dependency beyond the box you're paying for. Use `pm2` or a systemd service to keep it running, and Certbot for HTTPS.

### Rough cost at your current scale
With Vercel's free tier, Neon/Supabase free Postgres, R2's free 10GB storage + no egress fees, and Resend's free email tier, this can realistically run at **£0–5/month** until traffic and catalog size grow well past what you have now. You'll always need to budget for Stripe's per-transaction fee (not a subscription — it only takes a cut when you actually sell something).

---

## 7. Running the business day-to-day

- **Upload a beat**: `/admin/beats/new` → fill in metadata, upload artwork + tagged preview, attach full-resolution MP3/WAV/stems, select which license types to offer and set prices, set status to "Published".
- **Edit or take down a beat**: `/admin/beats` → Edit, or toggle Draft/Published inline.
- **Sell exclusive rights**: once an Exclusive Rights license sells, the webhook automatically marks the beat `exclusiveSold` and removes it from sale. You can also toggle this manually from the beats table.
- **Add/change license types**: `/admin/licenses` — edits here don't retroactively change beats that already have that license type instantiated; per-beat pricing is edited on the beat's edit page.
- **View sales and download activity**: `/admin/orders`.
- **View customers and lifetime spend**: `/admin/customers`.

---

## 8. Project structure

```
src/
  app/                    routes (App Router) — pages + API routes
    admin/(protected)/    admin dashboard, gated by src/app/admin/(protected)/layout.tsx
    admin/login/          admin login (outside the auth gate, obviously)
    api/                  all backend endpoints
    beats/[slug]/         public beat detail page
    shop/                 filterable catalog
  components/             shared UI (storefront + admin)
  context/                Zustand stores: cart (persisted) and the cross-page audio player
  lib/                    prisma client, auth config, stripe client, R2 helper, email, utils
prisma/
  schema.prisma           full data model
  seed.ts                 bootstraps an admin account + the five default license types
```

## 9. Security notes

- Full-resolution files are never publicly linked — they're served only via `/api/downloads/[token]`, which checks the order is paid and the link hasn't expired before generating a short-lived signed R2 URL.
- Prices are always re-read from the database at checkout time; the client never dictates what gets charged.
- Admin routes are gated server-side in `admin/(protected)/layout.tsx` via the session, not just hidden in the UI.
# beatstore-

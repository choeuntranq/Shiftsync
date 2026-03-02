# ShiftSync — Deployment Guide
## From zero to live link in ~20 minutes

---

## STEP 1 — Set up Supabase (your database)

1. Go to **https://supabase.com** → Sign up (free)
2. Click **New Project** → give it a name like "shiftsync" → set a database password → Create
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** (left sidebar) → **New Query**
5. Open the file `supabase_schema.sql` from this folder → copy the entire contents → paste into the editor → click **Run**
6. Go to **Settings → API** (left sidebar)
7. Copy two values — you'll need them in Step 3:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## STEP 2 — Create your Owner account in Supabase

This is YOUR login — the one with full access.

1. In Supabase → go to **Authentication → Users** → **Invite User**
2. Enter your email → Send Invite
3. Check your email → click the link → set your password
4. Now in Supabase → go to **Table Editor → profiles**
5. Find your row → click it → change `role_level` from `employee` to `owner` → Save

---

## STEP 3 — Put the code on GitHub

1. Go to **https://github.com** → click **+** → **New repository**
2. Name it `shiftsync` → set to **Private** → Create repository
3. On your computer, open a terminal in this `shiftsync` folder and run:

```bash
git init
git add .
git commit -m "Initial ShiftSync commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shiftsync.git
git push -u origin main
```

---

## STEP 4 — Deploy to Vercel

1. Go to **https://vercel.com** → Sign up with your GitHub account
2. Click **Add New → Project** → Import your `shiftsync` repo
3. Vercel auto-detects React. Before clicking Deploy, click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `REACT_APP_SUPABASE_URL` | Your Supabase Project URL from Step 1 |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 1 |

4. Click **Deploy** → wait ~2 minutes
5. Vercel gives you a live URL like `shiftsync-abc123.vercel.app`

---

## STEP 5 — Invite your manager

1. Log into your live ShiftSync URL with your owner account
2. Go to **Employees → Invite Employee**
3. Enter their name, email, set role to **Manager**
4. They'll get an email with a link to set their password

---

## STEP 6 — (Optional) Custom domain

1. Buy a domain at Namecheap or GoDaddy (~$12/yr)
2. In Vercel → your project → **Settings → Domains** → Add your domain
3. Follow the DNS instructions Vercel shows you

---

## Resetting all data

**Option A — One-click reset (Owner only)**
- Log in → Settings → scroll to **Danger Zone** → Reset All Data
- Wipes everything except your owner account

**Option B — Manual in Supabase**
- Go to Supabase → Table Editor
- Delete rows from: `schedules`, `messages`, `time_off_requests`, `availability`, `shift_templates`
- To remove employees: delete from `profiles` (keep your own row)
- To nuke everything including auth users: Authentication → Users → delete all except yours

---

## Future updates

When you make changes to the code, just run:
```bash
git add .
git commit -m "describe your change"
git push
```
Vercel auto-deploys within ~1 minute.

---

## Costs

| Service | Cost |
|---------|------|
| Supabase | Free (up to 50,000 rows, 500MB) |
| Vercel | Free (unlimited deploys) |
| Domain | ~$12/year (optional) |
| **Total** | **$0/month** |

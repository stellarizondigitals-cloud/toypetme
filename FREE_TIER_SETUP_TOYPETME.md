# Free-Tier Setup for ToyPetMe

This guide explains how to run ToyPetMe on 100% free-tier infrastructure: Replit (dev) → GitHub (code) → Vercel (hosting) + Supabase (database).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Development (Replit Free)                                       │
│ - Frontend: React 18 + Vite (http://localhost:5000)            │
│ - Backend: Express.js on port 5000                             │
│ - Database: MemStorage (in-memory, no persistence)             │
│ - No DATABASE_URL needed                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Production (Vercel Free + Supabase Free)                        │
│ - Frontend: Static build (dist/) → Vercel (vercel.com)         │
│ - Backend: Serverless API (Vercel Functions)                   │
│ - Database: Supabase Postgres (free tier: 500MB)               │
│ - DATABASE_URL: Supabase Session Pooler URI                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Run Locally on Replit (Free - MemStorage)

### Prerequisites
- Replit account (free)
- No DATABASE_URL needed

### Steps

1. **Clone/Open in Replit**
   ```bash
   # (Already in Replit)
   npm install
   npm run dev
   ```

2. **App starts with MemStorage**
   ```
   ℹ️ DATABASE_URL not set. Using in-memory storage (MemStorage).
   ✅ Listening on http://localhost:5000
   ```

3. **Features available in MemStorage mode:**
   - ✅ Sign up, login, email verification
   - ✅ Pet creation, feeding, playing, cleaning, sleeping
   - ✅ Mini-games (Memory Match, Reaction Time, Feed Frenzy)
   - ✅ Daily challenges, breeding, egg hatching
   - ✅ Leaderboard, inventory, shop
   - ❌ **Persistence:** All data lost when server restarts
   - ❌ **Sessions:** Not preserved on restart

**Use this mode for:** Development, testing, demos

---

## 2. Add Supabase (Free Tier - Persistent Storage)

### Supabase Setup (One-Time)

1. **Create Supabase account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up (free tier: 500MB, unlimited API calls, enough for 10k+ users)

2. **Create a new project**
   - Project name: `toypetme`
   - Region: `aws-us-east-1` (or closest to you)
   - Password: Auto-generated (save it securely)

3. **Get the Session Pooler URI**
   - In Supabase dashboard → Project Settings → Database
   - Copy the **Session Pooler** connection string (NOT the Direct connection)
   - Format:
     ```
     postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres
     ```
   - Example:
     ```
     postgresql://postgres.abcdef123456:MySecurePassword@aws-1-us-east-1.pooler.supabase.com:5432/postgres
     ```

### Local Development with Supabase

1. **Set DATABASE_URL**
   ```bash
   # In Replit Secrets (or .env locally):
   export DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres"
   ```

2. **Run migrations (one-time)**
   ```bash
   npm run db:push
   ```
   - This creates all tables in Supabase
   - Output: `✅ Pushed schema successfully`

3. **Start dev server**
   ```bash
   npm run dev
   ```
   - Output should show:
     ```
     ✅ Database storage initialized (PostgreSQL/Supabase)
     ✅ Session store: PostgreSQL (persistent across restarts)
     ```

4. **Test persistence**
   - Sign up, create a pet, feed it
   - Restart server: `npm run dev`
   - Your pet is still there ✅

---

## 3. Deploy to Vercel (Free)

### Build & Deploy

1. **Build locally first**
   ```bash
   npm run build
   ```
   - Frontend output: `dist/public/`
   - Backend output: `dist/index.js`

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import GitHub repo (`toypetme`)
   - Framework: **Other** (not Next.js - this is Express.js)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

### Vercel Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
DATABASE_URL          = postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres
EMAIL_API_KEY         = (your Resend key)
FRONTEND_URL          = https://yourdomain.vercel.app (Vercel auto-fills this)
GOOGLE_CLIENT_ID      = (from Google Console)
GOOGLE_CLIENT_SECRET  = (from Google Console)
SESSION_SECRET        = (random string, e.g., openssl rand -hex 32)
JWT_SECRET            = (random string, e.g., openssl rand -hex 32)
NODE_ENV              = production
```

### Custom Domain (Optional)

In Vercel → Project Settings → Domains:
- Add your custom domain (e.g., `toypetme.com`)
- Follow DNS setup instructions
- Free SSL certificate auto-generated

---

## 4. Environment Variables Reference

### Local Development (Replit with MemStorage)
- `NODE_ENV=development`
- `PORT=5000`
- `EMAIL_API_KEY` (Resend - optional for testing)
- `FRONTEND_URL=http://localhost:5000`
- `GOOGLE_CLIENT_ID` (if testing Google OAuth)
- `GOOGLE_CLIENT_SECRET` (if testing Google OAuth)
- `SESSION_SECRET` (generated - used by app)
- `JWT_SECRET` (generated - used by app)
- `DATABASE_URL` (optional - if not set, uses MemStorage)

### Production (Vercel + Supabase)
- All of the above, plus:
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...` (Supabase Session Pooler)

---

## 5. Storage Behavior Reference

### MemStorage Mode (No DATABASE_URL)
```
┌─────────────────────────────────────────┐
│ When DATABASE_URL is NOT set:           │
│                                         │
│ ✅ App starts with MemStorage           │
│ ✅ All features work (pets, games, etc) │
│ ❌ Data lost on server restart          │
│ ❌ Sessions not persisted               │
│                                         │
│ Console output:                         │
│ "⚠️ DATABASE_URL not set. Using        │
│  in-memory storage (MemStorage)."      │
│ "ℹ️ Session store: Memory"              │
└─────────────────────────────────────────┘
```

### DbStorage Mode (DATABASE_URL set to Supabase)
```
┌──────────────────────────────────────┐
│ When DATABASE_URL is set:            │
│                                      │
│ ✅ App connects to Supabase Postgres │
│ ✅ All data persists                 │
│ ✅ Sessions persist across restarts  │
│ ✅ Scales to thousands of users      │
│ ✅ Automatic backups (Supabase)      │
│                                      │
│ Console output:                      │
│ "✅ Database storage initialized    │
│  (PostgreSQL/Supabase)"              │
│ "✅ Session store: PostgreSQL"       │
└──────────────────────────────────────┘
```

---

## 6. Troubleshooting

### App won't start with DATABASE_URL set
```bash
# Check the error message. If it's "The endpoint has been disabled":
# → Verify Supabase project is running (Settings → Project Status)
# → Check DATABASE_URL format is correct
# → Try re-copying the Session Pooler connection string

# Fall back to MemStorage:
unset DATABASE_URL
npm run dev
```

### Data not persisting after restart
```bash
# Confirm DATABASE_URL is set:
echo $DATABASE_URL

# If empty, set it and restart:
export DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@..."
npm run dev
```

### Migrations fail
```bash
# Ensure DATABASE_URL is set, then:
npm run db:push

# If it still fails, check:
# - DATABASE_URL uses "Session Pooler" (NOT "Direct")
# - No typos in the connection string
# - Supabase project is running
```

### Google OAuth not working locally
```bash
# Google Console requires exact redirect URLs
# Add to Google OAuth:
# Authorized redirect URIs:
#   - http://localhost:5000/auth/google/callback (dev)
#   - https://yourdomain.vercel.app/auth/google/callback (prod)
```

---

## 7. Costs (Always Free)

| Service       | Free Tier      | Cost      |
|---------------|----------------|-----------|
| Replit Dev    | Unlimited      | $0        |
| GitHub        | Public repos   | $0        |
| Vercel        | Hobby plan     | $0        |
| Supabase      | 500MB DB       | $0        |
| Resend Email  | 100/day emails | $0        |
| Google OAuth  | Unlimited      | $0        |
| **Total**     |                | **$0**    |

**Upgrade only if you need:**
- Supabase: >500MB database
- Vercel: >100GB bandwidth/month
- Resend: >100 emails/day

---

## 8. Quick Checklist: From Dev to Production

- [ ] Clone repo, run `npm install` locally
- [ ] Test with MemStorage: `npm run dev` (no DATABASE_URL)
- [ ] Create Supabase account and project
- [ ] Copy Session Pooler connection string
- [ ] Set DATABASE_URL locally: `export DATABASE_URL="..."`
- [ ] Run migrations: `npm run db:push`
- [ ] Test with Supabase: `npm run dev` (with DATABASE_URL set)
- [ ] Build: `npm run build`
- [ ] Push to GitHub: `git push`
- [ ] Create Vercel project, import GitHub repo
- [ ] Set env vars in Vercel (DATABASE_URL, EMAIL_API_KEY, etc.)
- [ ] Deploy and test at `https://yourdomain.vercel.app`

---

## 9. Support & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Drizzle ORM:** https://orm.drizzle.team/docs/overview
- **Express.js:** https://expressjs.com/

---

**Summary:** ToyPetMe can run 100% free. Start with Replit + MemStorage (no costs), then add Supabase ($0 free tier) for persistence, then deploy to Vercel ($0 free tier). No surprises, no paid tiers ever needed unless you outgrow free limits.

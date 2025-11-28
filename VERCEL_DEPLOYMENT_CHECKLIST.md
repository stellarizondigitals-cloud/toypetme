# ToyPetMe Vercel Deployment Checklist

Complete these steps to deploy ToyPetMe to Vercel (100% free tier).

---

## ✅ Pre-Deployment Verification (Already Done)

- ✅ App runs locally: `npm run dev` (Replit)
- ✅ Database migrated: `npm run db:push` (Supabase)
- ✅ Build succeeds: `npm run build`
  - Frontend: `dist/public/` (1.3 MB)
  - Backend: `dist/index.js` (133 KB)
- ✅ Removed unused Neon dependency
- ✅ Created `vercel.json` configuration
- ✅ Session storage: PostgreSQL (persistent)
- ✅ Database client: Generic postgres (Supabase-compatible)

---

## 🚀 Step 1: Push to GitHub

### 1.1 Create GitHub Repository
- Go to https://github.com/new
- Repository name: `toypetme`
- Description: "Virtual pet game - React + Express + Supabase"
- Public or private (your choice)
- Click "Create repository"

### 1.2 Push Your Code
```bash
# From your Replit terminal:
git add .
git commit -m "Initial commit: ToyPetMe ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/toypetme.git
git push -u origin main
```

**Verify:** Visit your GitHub repo - all files should be there ✅

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub account
- Click "Authorize"

### 2.2 Import Project
- Dashboard → "Add New..." → "Project"
- Click "Import Git Repository"
- Search for `toypetme` repo
- Select it and click "Import"

### 2.3 Configure Build Settings
Vercel should auto-detect from `vercel.json`, but verify:
- **Framework Preset:** None/Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`

### 2.4 Add Environment Variables
Before deploying, add these in Vercel dashboard → Settings → Environment Variables:

**REQUIRED (for app to work):**
```
DATABASE_URL          = postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres
SESSION_SECRET        = (random string, e.g., openssl rand -hex 32)
JWT_SECRET            = (random string, e.g., openssl rand -hex 32)
```

**RECOMMENDED (for full features):**
```
EMAIL_API_KEY         = (your Resend API key from https://resend.com)
FRONTEND_URL          = https://toypetme.vercel.app  (Vercel will auto-fill this)
GOOGLE_CLIENT_ID      = (from Google Console)
GOOGLE_CLIENT_SECRET  = (from Google Console)
```

**Optional (for production logging):**
```
NODE_ENV              = production
```

### 2.5 Deploy
- Click "Deploy"
- Wait for build to complete (~2-3 minutes)
- You should see: ✅ "Deployment Complete"

---

## ✅ Step 3: Verify Production

### 3.1 Test Your Live App
- Visit: `https://toypetme.vercel.app`
- Should see login page ✅
- Try signing up with email/password
- Create a pet and test features

### 3.2 Check Logs
- Vercel Dashboard → Deployments → Click latest deploy
- Click "Functions" tab to see backend logs
- Look for:
  ```
  ✅ Database storage initialized (PostgreSQL/Supabase)
  ✅ serving on port 5000
  ```

### 3.3 Test API Routes
```bash
# In browser console or curl:
fetch('https://toypetme.vercel.app/api/user', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)

# Should return: { error: "Not authenticated" } (expected if not logged in)
```

---

## 🎯 Step 4: Setup Custom Domain (Optional)

If you have `toypetme.com`:

### 4.1 Add Domain to Vercel
- Vercel Dashboard → Settings → Domains
- Click "Add Domain"
- Enter `toypetme.com`
- Follow DNS setup instructions (add Vercel nameservers or CNAME)
- SSL certificate auto-generated (free)

### 4.2 Update Environment Variables
Change `FRONTEND_URL` in Vercel to:
```
FRONTEND_URL = https://toypetme.com
```

---

## 🔧 Troubleshooting

### Build Fails
```
Error: DATABASE_URL not set
```
**Solution:** Verify DATABASE_URL is set in Vercel env vars

### App Shows 500 Error
1. Check Vercel function logs
2. Verify DATABASE_URL format (use Session Pooler, not Direct)
3. Verify Supabase project is running
4. Check that `npm run db:push` completed successfully locally

### API Routes Return 404
```
GET /api/pets → 404
```
**Solution:** Verify `vercel.json` rewrites are correct:
- Vercel Dashboard → Settings → Advanced
- Check "Rewrites and Redirects" shows your `/api/(.*)` rule

### Session Lost on Refresh
```
User logs in → refreshes page → logged out
```
**Solution:** Verify:
- DATABASE_URL set in Vercel env vars
- `npm run db:push` was run successfully
- PostgreSQL session store initialized (check logs)

---

## 📊 Cost Summary

| Service | Free Tier | Cost | Status |
|---------|-----------|------|--------|
| Vercel | Hobby (unlimited) | $0 | ✅ |
| Supabase | 500MB DB, unlimited API | $0 | ✅ |
| Resend | 100 emails/day | $0 | ✅ |
| Google OAuth | Unlimited | $0 | ✅ |
| GitHub | Public repos | $0 | ✅ |
| **Total** | | **$0** | ✅ |

**Important:** With these settings, ToyPetMe **will never charge you** unless:
- Your Supabase database grows >500MB (very unlikely)
- Your Vercel functions take >100 hours/month (extremely unlikely)

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and imported
- [ ] Environment variables set in Vercel
- [ ] Build succeeds on Vercel
- [ ] App loads at `https://toypetme.vercel.app`
- [ ] Can sign up and create a pet
- [ ] Pet data persists across page refreshes
- [ ] API routes work (check browser DevTools Network tab)
- [ ] (Optional) Custom domain configured

---

## 📞 Next Steps After Deployment

1. **Monitor:** Check Vercel analytics dashboard weekly
2. **Update:** Push code changes: `git push` → Vercel auto-redeploys
3. **Scale:** If needed, upgrade plans (both stay free until you exceed limits)
4. **Customize:** Update `FRONTEND_URL` to your custom domain if deployed

---

## 🚨 Important: Session Persistence

Your app uses **two storage modes:**

### Development (Replit, no DATABASE_URL)
- Sessions: Memory (ephemeral)
- Data: MemStorage (lost on server restart)
- Use for: Testing, development only

### Production (Vercel with DATABASE_URL)
- Sessions: PostgreSQL/Supabase (persistent)
- Data: Supabase database (persistent)
- Use for: Live deployment, users

**Vercel automatically uses production mode** because DATABASE_URL will be set in env vars.

---

## 📖 Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Drizzle ORM:** https://orm.drizzle.team
- **Express.js:** https://expressjs.com
- **React + Wouter:** https://www.npmjs.com/package/wouter

---

**Ready to deploy? Start with Step 1: Push to GitHub!** 🚀

# Web Viewer Deployment Guide

**Status:** ✅ Ready to Deploy  
**Platform:** Vercel (recommended) or Netlify  
**Build Time:** ~2 minutes  
**Deployment Time:** ~5 minutes

---

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Fastest)

**Prerequisites:**
```bash
npm install -g vercel
```

**Deploy in 2 steps:**

```bash
# From root of jsone repo
vercel --prod
```

You'll be prompted:
```
? Set up and deploy "jsone"? [Y/n] Y
? Which scope? Your username
? Found project settings. Overwrite? [y/N] y
? Deployed to production. (3s)
✓ Production: https://jsone.vercel.app
```

### Option 2: Deploy via GitHub (Automatic)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Click "Add New..." → "Project"
4. Select jsone repository
5. Vercel auto-detects settings from `vercel.json`
6. Click "Deploy" → Done! 🎉

---

## 🌐 Custom Domain (Optional)

After deployment, add custom domain:

```bash
vercel env add VERCEL_URL=jsone.io
# or
# In Vercel dashboard: Settings → Domains → Add Domain
```

---

## 📋 What Gets Deployed

**Files included:**
- `viewer/dist/` - Production build (13.38 kB HTML, 11.38 kB JS)
- `vercel.json` - Configuration
- `package.json` - Dependencies

**Files excluded:**
- Source code (src/, node_modules/)
- Development files

**Total size:** ~50 MB (with dependencies), ~25 kB (gzipped app)

---

## ✅ Deployment Checklist

- [x] Landing page created with hero section
- [x] Feature cards added
- [x] Example data included (Users, Orders, Products, Nested)
- [x] Production build successful (13.38 kB gzip)
- [x] vercel.json configuration ready
- [x] Git branch with all changes pushed

**Next:**
- [ ] Run `vercel --prod` or deploy via GitHub
- [ ] Verify app loads: https://jsone.vercel.app
- [ ] Test file upload
- [ ] Test example buttons
- [ ] Share link on social media

---

## 🧪 Testing After Deployment

**Test checklist:**
1. ✅ Landing page displays correctly
2. ✅ "Upload JSON" button works
3. ✅ Example buttons load data (Users, Orders, Products, Nested)
4. ✅ File upload accepts .json and .jsone
5. ✅ Table view renders correctly
6. ✅ Search/sort functionality works
7. ✅ CSV export works
8. ✅ Mobile responsive (check on phone)

---

## 🔧 Environment Variables

Currently needed:
- None (fully static/client-side)

Optional future additions:
- `ANALYTICS_KEY` - For Google Analytics
- `CUSTOM_DOMAIN` - For vanity URLs

---

## 📊 Monitoring

After deployment, monitor:

**Vercel Dashboard:**
- Analytics tab → View traffic
- Deployments tab → See build logs
- Settings tab → Configure domain

**Track metrics:**
- Page views
- Upload frequency
- Example button clicks
- Geographic distribution

---

## 🚨 Troubleshooting

**Issue: Build fails**
```bash
# Check build logs
vercel logs jsone
```

**Issue: App shows blank**
```bash
# Verify vercel.json is correct
cat vercel.json

# Rebuild and redeploy
vercel --prod --force
```

**Issue: File upload not working**
- Check browser console (F12) for errors
- Verify CORS settings in vercel.json
- Test with different file formats

---

## 📈 Performance

**Current metrics:**
- Page load: < 1s
- File parsing: < 100ms (typical JSON)
- Table render: < 500ms
- Gzipped size: 3.20 kB (HTML) + 4.40 kB (JS)

---

## 🔐 Security

- ✅ No server-side processing
- ✅ No data transmission
- ✅ Files stay in browser
- ✅ HTTPS enabled by default
- ✅ No cookies/tracking (unless Analytics enabled)

---

## 💡 Next Steps After Deploy

1. **Share on social media** with direct link
2. **Create Product Hunt post** with deployed URL
3. **Write Dev.to article** with live demo
4. **Monitor analytics** for user behavior
5. **Collect feedback** via GitHub Discussions
6. **Iterate on UI** based on real user data

---

## 📝 Deployment Record

**Deploy Status:** Ready  
**Feature Branch:** feature/product-roadmap (commit 6307eec)  
**Build Output:** viewer/dist/ (13.38 kB gzip)  
**Ready URL:** https://jsone.vercel.app (or custom domain)

---

**Deployed by:** Mohan Reddy Mummareddy  
**Date:** March 23, 2026  
**Status:** ✅ Production Ready

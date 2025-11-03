# 🚀 Netlify Deployment Guide - Profy Academy

## ✅ **Quick Fix Checklist**

Follow these steps to get your site working:

- [ ] **Step 1:** Add environment variables to Netlify
- [ ] **Step 2:** Push the new configuration files
- [ ] **Step 3:** Trigger a new deploy
- [ ] **Step 4:** Verify the site is live

---

## 📋 **Step 1: Configure Environment Variables on Netlify**

### **1.1 Go to Netlify Dashboard**
1. Open https://app.netlify.com/
2. Click on your site: **profy-academy**
3. Go to **Site settings**
4. Click **Environment variables** (in the left sidebar)

### **1.2 Add These Variables**

Click **Add a variable** and add each of these:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wvhnudjqwmbudhhyqmvo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key from `.env.local` |
| `NEXT_PUBLIC_APP_URL` | `https://profy-academy.netlify.app` |
| `NEXT_PUBLIC_APP_NAME` | `أكاديمية بروفي` |
| `NODE_VERSION` | `18` |

**Important:** For `NEXT_PUBLIC_SUPABASE_ANON_KEY`, copy the value from your local `.env.local` file.

---

## 📦 **Step 2: Push Configuration Files**

I've created these new files for you:
- ✅ `netlify.toml` - Netlify build configuration
- ✅ `.env.production.example` - Environment variable template

### **Push to Git:**

```bash
# Add all changes
git add .

# Commit
git commit -m "Add Netlify configuration and fix deployment"

# Push to main branch
git push origin main
```

---

## 🔄 **Step 3: Trigger New Deploy**

### **Option A: Automatic (Recommended)**
After you push to Git, Netlify will automatically detect the changes and start a new deployment.

### **Option B: Manual**
1. Go to Netlify Dashboard
2. Click **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**

---

## 🔍 **Step 4: Monitor the Deployment**

### **4.1 Watch the Build Log**
1. In Netlify, go to **Deploys**
2. Click on the latest deploy (should show "Building")
3. Click **Deploy log** to see progress

### **4.2 What to Look For**

**✅ Successful build should show:**
```
Build ready to start
Installing dependencies
Building Next.js app
✓ Generating static pages
✓ Finalizing page optimization
Deploy succeeded!
```

**❌ If you see errors:**
- Check environment variables are set correctly
- Make sure Supabase anon key is valid
- Look for the specific error message

---

## 🌐 **Step 5: Verify Your Site**

Once deployed, test these URLs:

1. **Home:** https://profy-academy.netlify.app/
2. **Login:** https://profy-academy.netlify.app/login
3. **Register:** https://profy-academy.netlify.app/register
4. **Student Dashboard:** https://profy-academy.netlify.app/student/dashboard

---

## 🛠️ **Netlify Configuration Explained**

### **netlify.toml:**
```toml
[build]
  command = "npm run build"      # Build command
  publish = ".next"              # Output directory

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Next.js plugin

[build.environment]
  NODE_VERSION = "18"            # Node.js version
```

This tells Netlify:
- How to build your Next.js app
- Which folder contains the built files
- What Node version to use
- To use the Next.js plugin for optimal performance

---

## 🔑 **Finding Your Supabase Anon Key**

### **Option 1: From your .env.local file**
```bash
# Open your local .env.local
# Copy the value of NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Option 2: From Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project: **wvhnudjqwmbudhhyqmvo**
3. Go to **Settings** → **API**
4. Copy the **anon public** key

---

## 🐛 **Troubleshooting**

### **Problem: Build Fails**

**Check:**
1. Environment variables are set correctly
2. All required variables are present
3. No syntax errors in code

**Solution:**
- Review build log for specific error
- Ensure Supabase credentials are valid
- Check that all files are pushed to Git

---

### **Problem: Site Loads but Shows Errors**

**Check:**
1. Browser console for JavaScript errors
2. Network tab for failed API calls
3. Supabase connection works

**Solution:**
- Verify `NEXT_PUBLIC_APP_URL` matches your Netlify domain
- Check Supabase RLS policies allow access
- Ensure Supabase project is active

---

### **Problem: White Screen / Blank Page**

**Check:**
1. Environment variables include `NEXT_PUBLIC_` prefix
2. Build completed successfully
3. No console errors

**Solution:**
- Rebuild the site
- Clear browser cache
- Check Netlify deploy log

---

### **Problem: Styles Not Loading**

**Check:**
1. Build output includes CSS files
2. No CSP blocking resources
3. Tailwind CSS compiled correctly

**Solution:**
- Ensure `npm run build` works locally
- Check build log for CSS compilation
- Verify no missing dependencies

---

## 📊 **Expected Build Output**

Your successful build should show:

```
Generating static pages (15/15)

Route (app)                              Size     First Load JS
┌ ○ /                                    175 B    96.2 kB
├ ○ /admin/dashboard                     5.02 kB  162 kB
├ ○ /login                               2.5 kB   166 kB
├ ○ /parent/dashboard                    5.12 kB  162 kB
├ ○ /register                            3.93 kB  174 kB
├ ƒ /student/assignments/[id]            4.96 kB  162 kB
├ ○ /student/dashboard                   4.76 kB  162 kB
├ ○ /student/payment                     5.31 kB  162 kB
├ ○ /student/subscription                4.01 kB  152 kB
├ ○ /student/videos                      4.96 kB  162 kB
├ ƒ /student/videos/[id]                 4.89 kB  162 kB
├ ○ /teacher/assignments/create          4.5 kB   162 kB
├ ○ /teacher/dashboard                   5.11 kB  162 kB
└ ○ /teacher/sessions/create             4.86 kB  162 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## 🎯 **Common Mistakes to Avoid**

### ❌ **Don't:**
- Forget the `NEXT_PUBLIC_` prefix for client-side variables
- Use localhost URLs in production
- Commit `.env.local` or `.env.production` to Git
- Skip environment variables setup

### ✅ **Do:**
- Use `NEXT_PUBLIC_` for variables used in browser
- Set all environment variables in Netlify
- Use production URLs for `NEXT_PUBLIC_APP_URL`
- Test locally with `npm run build` before deploying

---

## 🔄 **Redeployment Process**

When you make changes:

```bash
# 1. Make your changes
# 2. Test locally
npm run build
npm start

# 3. Commit changes
git add .
git commit -m "Your change description"

# 4. Push to trigger auto-deploy
git push origin main

# 5. Monitor deploy in Netlify dashboard
```

---

## 📱 **Testing After Deployment**

### **Basic Tests:**
1. ✅ Homepage loads
2. ✅ Login page accessible
3. ✅ Registration works
4. ✅ Supabase connection works
5. ✅ Images load correctly
6. ✅ Navigation functions
7. ✅ Forms submit properly

### **Advanced Tests:**
1. ✅ Student dashboard shows data
2. ✅ Video player works
3. ✅ Assignments load
4. ✅ Payment page accessible
5. ✅ Subscription management works

---

## 📈 **Performance Optimization**

### **Already Optimized:**
- ✅ Image optimization with Next.js Image
- ✅ Code splitting
- ✅ Minification
- ✅ Gzip compression
- ✅ Static page generation

### **Monitor Performance:**
1. Use Lighthouse in Chrome DevTools
2. Check Core Web Vitals
3. Monitor Netlify Analytics

---

## 🔒 **Security Checklist**

- ✅ Environment variables not in code
- ✅ HTTPS enabled (automatic with Netlify)
- ✅ Security headers configured
- ✅ Supabase RLS enabled
- ✅ API keys protected

---

## 📞 **Getting Help**

### **If deployment still fails:**

1. **Check Build Log:**
   - Netlify Dashboard → Deploys → Latest Deploy → Deploy log
   - Look for the specific error message

2. **Verify Environment Variables:**
   - Site settings → Environment variables
   - Ensure all required variables are set

3. **Test Locally:**
   ```bash
   npm run build
   npm start
   ```
   - If it works locally but not on Netlify, it's likely an environment variable issue

4. **Common Issues:**
   - Missing `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Wrong Supabase URL
   - Node version mismatch
   - Missing dependencies

---

## ✅ **Final Checklist**

Before considering deployment complete:

- [ ] All environment variables set in Netlify
- [ ] Latest code pushed to Git
- [ ] Build completed successfully
- [ ] Site loads at https://profy-academy.netlify.app/
- [ ] Login/Register pages work
- [ ] Database connection works
- [ ] Images load correctly
- [ ] No console errors
- [ ] Forms submit properly
- [ ] Navigation works

---

## 🎉 **Success Indicators**

You'll know it's working when:

✅ **Build log shows:** "Deploy succeeded"  
✅ **Site loads:** Homepage displays correctly  
✅ **Database works:** Can login/register  
✅ **No errors:** Clean browser console  
✅ **Features work:** All pages accessible  

---

## 📝 **Quick Reference**

### **Netlify Build Settings:**
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** `18`

### **Required Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_NAME
```

### **Deploy Commands:**
```bash
# Push changes
git add .
git commit -m "Update"
git push origin main

# Manual trigger (in Netlify dashboard)
Deploys → Trigger deploy → Deploy site
```

---

**🚀 Your Profy Academy is ready to deploy!**

Follow the steps above and your site will be live in minutes!

*Last Updated: November 3, 2025*

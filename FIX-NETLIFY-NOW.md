# 🚨 QUICK FIX - Do This Now!

## The Problem
Your website at https://profy-academy.netlify.app/ is not working because:
1. ❌ Missing Netlify configuration files
2. ❌ Environment variables not set on Netlify

---

## ✅ SOLUTION (3 Steps - 5 Minutes)

### **STEP 1: Set Environment Variables on Netlify** ⚙️

1. Go to: https://app.netlify.com/
2. Click your site: **profy-academy**
3. Go to: **Site settings** → **Environment variables**
4. Click **Add a variable** and add these:

#### **Copy these EXACTLY:**

```
Variable 1:
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://wvhnudjqwmbudhhyqmvo.supabase.co

Variable 2:
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [GET THIS FROM YOUR .env.local FILE]

Variable 3:
Key: NEXT_PUBLIC_APP_URL
Value: https://profy-academy.netlify.app

Variable 4:
Key: NEXT_PUBLIC_APP_NAME
Value: أكاديمية بروفي

Variable 5:
Key: NODE_VERSION
Value: 18
```

**To get NEXT_PUBLIC_SUPABASE_ANON_KEY:**
- Open your local file: `.env.local`
- Copy the value after `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- Paste it in Netlify

---

### **STEP 2: Push New Configuration** 📦

Run these commands:

```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

---

### **STEP 3: Wait for Deploy** ⏳

1. Netlify will automatically rebuild (takes 2-3 minutes)
2. Watch progress at: https://app.netlify.com/ → **Deploys**
3. When it says "Published", your site is live!

---

## ✅ How to Know It Worked

1. Open: https://profy-academy.netlify.app/
2. You should see your homepage
3. Click "تسجيل الدخول" - login page should load
4. No errors!

---

## ⚠️ If It Still Doesn't Work

### Check Netlify Deploy Log:
1. Go to: https://app.netlify.com/
2. Click: **Deploys** tab
3. Click: Latest deploy
4. Look for errors in the log

### Most Common Issue:
❌ **Missing or wrong NEXT_PUBLIC_SUPABASE_ANON_KEY**

**Solution:**
1. Check `.env.local` file on your computer
2. Copy the exact value
3. Update in Netlify environment variables
4. Click **Trigger deploy** → **Deploy site**

---

## 🎯 Quick Checklist

- [ ] Added all 5 environment variables in Netlify
- [ ] Pushed code with `git push`
- [ ] Waiting for Netlify to rebuild (check Deploys tab)
- [ ] Site loads at https://profy-academy.netlify.app/

---

## 📝 Files I Created for You

1. ✅ `netlify.toml` - Build configuration
2. ✅ `.env.production.example` - Environment variable template
3. ✅ `NETLIFY-DEPLOYMENT-GUIDE.md` - Full deployment guide

---

## 🆘 Still Stuck?

**Send me the Netlify deploy log:**
1. Go to Netlify Deploys
2. Click latest deploy
3. Copy the error message
4. Share with me

---

**Just follow Step 1, Step 2, and Step 3 above!**  
**Your site will be live in 5 minutes! 🚀**

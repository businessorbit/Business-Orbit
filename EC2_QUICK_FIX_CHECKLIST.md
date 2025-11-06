# ✅ EC2 Quick Fix Checklist

## 🎯 The Problem
Chapters and Groups show "Failed to load" on deployed website but work locally.

## 🔧 The Fix
1. ✅ Updated `next.config.mjs` - Disabled API proxy rewrites on EC2
2. ✅ Updated API routes - Added fallback to user preferences
3. ✅ Added proper error handling

## 📋 What to Do on EC2

### Step 1: Deploy the Code (Automatic via CI/CD)
```bash
# Just push to GitHub - CI/CD will deploy automatically
git add .
git commit -m "Fix chapters and groups on EC2"
git push origin main
```

### Step 2: Verify on EC2 (After Deployment)

**SSH into EC2:**
```bash
ssh -i your-key.pem ubuntu@51.20.78.210
```

**Check 1: Verify DATABASE_URL is set**
```bash
cd /home/ubuntu/Business-Orbit
pm2 env frontend | grep DATABASE_URL
```
**Expected:** Should show your database connection string

**Check 2: Verify VERCEL is NOT set**
```bash
pm2 env frontend | grep VERCEL
```
**Expected:** Should return nothing (empty)

**Check 3: Restart PM2 (to pick up new code)**
```bash
pm2 restart ecosystem.config.js
pm2 save
```

**Check 4: View logs for errors**
```bash
pm2 logs frontend --lines 50
```
**Look for:** Database connection errors, API errors

**Check 5: Test database connection**
```bash
# Test if database is accessible
psql $DATABASE_URL -c "SELECT COUNT(*) FROM user_preferences LIMIT 1;"
```
**Expected:** Should return a number (not an error)

### Step 3: Test the Website

1. Visit `https://www.businessorbit.org/product/feed`
2. Check left sidebar
3. Should see:
   - ✅ "Chapters (X)" with count
   - ✅ "Secret Groups (X)" with count
   - ❌ NOT "Failed to load chapters"
   - ❌ NOT "Failed to load secret groups"

## 🚨 If Still Not Working

### Check PM2 Environment Variables

**View all frontend env vars:**
```bash
pm2 env frontend
```

**Make sure these are set:**
- ✅ `DATABASE_URL` - Database connection string
- ✅ `JWT_SECRET` - JWT secret
- ✅ `COOKIE_SECRET` - Cookie secret
- ✅ `NODE_ENV=production`
- ❌ `VERCEL` - Should NOT be set (or empty)

### Check Database Connection

**Test connection:**
```bash
psql $DATABASE_URL -c "SELECT version();"
```

**If connection fails:**
1. Check RDS security group allows EC2
2. Verify DATABASE_URL format
3. Check database is running

### Check Next.js Config

**Verify rewrites are conditional:**
```bash
cat next.config.mjs | grep -A 15 "rewrites"
```

**Should see:**
```javascript
if (process.env.VERCEL === '1') {
  // proxy code
}
return []; // Empty for EC2
```

### Rebuild if Needed

**If changes aren't taking effect:**
```bash
cd /home/ubuntu/Business-Orbit
npm run build
pm2 restart frontend
```

## ✅ Success Indicators

After fix, you should see:
- ✅ Chapters card shows count: "Chapters (2)"
- ✅ Secret Groups card shows count: "Secret Groups (1)"
- ✅ Expanding shows the actual chapters/groups
- ✅ No error messages
- ✅ PM2 logs show no database errors

## 📞 Quick Commands Reference

```bash
# View PM2 status
pm2 list

# View frontend logs
pm2 logs frontend

# Restart frontend
pm2 restart frontend

# Check environment variables
pm2 env frontend

# Test database
psql $DATABASE_URL -c "SELECT NOW();"

# Rebuild Next.js
npm run build
```

---

**Most likely issue:** DATABASE_URL not set in PM2, or database not accessible from EC2.


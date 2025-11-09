# Fix 404 Errors - Step by Step

Your repository name is correct: `MEC-2025-Frontend` ✅

## The Problem
404 errors mean GitHub Pages can't find your assets. This usually happens when:
1. GitHub Pages source is not set to "GitHub Actions"
2. The deployment hasn't completed yet
3. Browser cache

## Solution - Step by Step

### Step 1: Verify GitHub Pages Settings
1. Go to: https://github.com/AmmaarShareef/MEC-2025-Frontend/settings/pages
2. Under **Source**, make sure it says: **"GitHub Actions"** (NOT "Deploy from a branch")
3. If it's set to a branch, change it to **"GitHub Actions"**
4. Click **Save**

### Step 2: Check Deployment Status
1. Go to: https://github.com/AmmaarShareef/MEC-2025-Frontend/actions
2. Look for the latest "Deploy to GitHub Pages" workflow
3. Make sure it shows a green checkmark ✅ (successful)
4. If it's red ❌, click on it to see the error

### Step 3: Trigger a New Deployment
If the deployment failed or you want to redeploy:

```bash
# Make a small change to trigger deployment
git add .
git commit -m "Trigger GitHub Pages deployment"
git push origin main
```

### Step 4: Wait and Clear Cache
1. Wait 2-3 minutes after pushing
2. Clear your browser cache:
   - **Chrome/Edge**: `Ctrl+Shift+Delete` → Clear cached images and files
   - Or use Incognito/Private mode
3. Visit: `https://AmmaarShareef.github.io/MEC-2025-Frontend/`

### Step 5: Check Browser Console
1. Open your site: `https://AmmaarShareef.github.io/MEC-2025-Frontend/`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for errors - they'll tell you exactly what's missing

## Common Issues

### Issue: "Source" is set to a branch instead of GitHub Actions
**Fix**: Change to "GitHub Actions" in Settings → Pages

### Issue: Deployment is still running
**Fix**: Wait for it to complete (check Actions tab)

### Issue: Assets are loading from wrong path
**Check**: In browser console, see what path it's trying:
- ✅ Correct: `/MEC-2025-Frontend/assets/index-xxx.js`
- ❌ Wrong: `/assets/index-xxx.js` (missing base path)

### Issue: Cached old version
**Fix**: Clear browser cache or use Incognito mode

## Quick Test
After fixing, test locally first:
```bash
npm run build
npm run preview
```
Then visit: `http://localhost:4173/MEC-2025-Frontend/`

If it works locally but not on GitHub Pages, it's a deployment issue.


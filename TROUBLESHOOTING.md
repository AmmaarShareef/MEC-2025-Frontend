# Troubleshooting Blank Page on GitHub Pages

## Quick Fixes

### 1. Verify Repository Name
**Most Common Issue**: The base path in `vite.config.js` must match your GitHub repository name exactly.

- Check your repository name on GitHub
- Update `vite.config.js` line 7: `base: '/YOUR-REPO-NAME/'`
- Make sure it matches exactly (case-sensitive, with trailing slash)

### 2. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### 3. Check Browser Console
1. Open your deployed site
2. Press `F12` to open Developer Tools
3. Check the **Console** tab for errors
4. Check the **Network** tab for failed requests (404 errors)

### 4. Verify Deployment
1. Go to your repository → **Actions** tab
2. Check if the latest deployment succeeded
3. If it failed, check the error logs

### 5. Test Locally
```bash
npm run build
npm run preview
```
Visit `http://localhost:4173/MEC-2025-Frontend/` (or your repo name)
If it works locally but not on GitHub Pages, it's a base path issue.

## Common Errors and Solutions

### Error: "Failed to fetch" or Network errors
**Solution**: Your app is trying to connect to `http://localhost:8000` for the backend. This won't work on GitHub Pages. The app should still load, but backend features won't work.

### Error: 404 on assets (CSS/JS files)
**Solution**: Base path mismatch. Update `vite.config.js` base path to match your repo name exactly.

### Error: Blank white page
**Solution**: 
1. Check browser console for JavaScript errors
2. Verify the base path is correct
3. Make sure you're accessing: `https://username.github.io/REPO-NAME/` (with trailing slash)

### Error: "Cannot GET /"
**Solution**: You're accessing the wrong URL. GitHub Pages requires the full path including repo name.

## Step-by-Step Debugging

1. **Verify Base Path**:
   - Repository name: `MEC-2025-Frontend`
   - Base path in `vite.config.js`: `/MEC-2025-Frontend/`
   - URL you're accessing: `https://AmmaarShareef.github.io/MEC-2025-Frontend/`

2. **Rebuild and Redeploy**:
   ```bash
   npm run build
   git add .
   git commit -m "Fix base path"
   git push origin main
   ```

3. **Wait 2-3 minutes** for GitHub Pages to update

4. **Check the deployed files**:
   - Go to: `https://github.com/AmmaarShareef/MEC-2025-Frontend/settings/pages`
   - Verify it shows "Your site is published at..."

## Still Not Working?

1. **Check the actual repository name**:
   - Go to your repo on GitHub
   - Look at the URL: `github.com/AmmaarShareef/???`
   - The part after your username is the repo name

2. **Update all references**:
   - `vite.config.js` → `base: '/REPO-NAME/'`
   - `package.json` → `"homepage": "https://AmmaarShareef.github.io/REPO-NAME/"`

3. **Rebuild and push again**

## Testing Checklist

- [ ] Repository name matches base path exactly
- [ ] Built files have correct paths (check `dist/index.html`)
- [ ] GitHub Actions deployment succeeded
- [ ] Accessing URL with trailing slash
- [ ] Browser console shows no critical errors
- [ ] Network tab shows assets loading (200 status)


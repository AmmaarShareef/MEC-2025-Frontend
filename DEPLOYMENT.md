# GitHub Pages Deployment Guide

This guide will help you deploy your Phoenix AID frontend to GitHub Pages.

## Prerequisites
- A GitHub repository
- Node.js and npm installed
- Git installed

## Method 1: Using GitHub Actions (Recommended)

### Step 1: Update Repository Name
1. Make sure your GitHub repository name matches the base path in `vite.config.js`
2. Currently set to: `/MEC-2025-Frontend/`
3. If your repo has a different name, update the `base` property in `vite.config.js`

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### Step 3: Push to GitHub
1. Make sure all your changes are committed:
   ```bash
   git add .
   git commit -m "Prepare for GitHub Pages deployment"
   git push origin main
   ```

2. The GitHub Action will automatically:
   - Build your project
   - Deploy it to GitHub Pages
   - Your site will be available at: `https://[your-username].github.io/[repo-name]/`

## Method 2: Manual Deployment using gh-pages

### Step 1: Update Configuration
1. Update `package.json` homepage to match your repo:
   ```json
   "homepage": "https://[your-username].github.io/[repo-name]"
   ```

2. Update `vite.config.js` base path:
   ```js
   base: '/[repo-name]/'
   ```

### Step 2: Build and Deploy
```bash
# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on **Settings** → **Pages**
3. Under **Source**, select **gh-pages** branch
4. Select `/ (root)` folder
5. Click **Save**

## Troubleshooting

### Issue: Blank page or 404 errors
**Solution:** Make sure the `base` path in `vite.config.js` matches your repository name exactly (case-sensitive).

### Issue: Assets not loading
**Solution:** 
1. Check that all paths in your code use relative paths
2. Verify the `base` path is correct
3. Clear browser cache and try again

### Issue: API calls not working
**Solution:** 
- GitHub Pages serves static files only
- Backend API calls will only work if:
  1. Your backend is publicly accessible
  2. You update the API base URL in `src/utils/api.js` to point to your backend URL
  3. Your backend has CORS enabled for your GitHub Pages domain

### Issue: Map not showing
**Solution:**
- Leaflet maps require HTTPS
- GitHub Pages provides HTTPS by default
- Make sure you're accessing the site via the HTTPS URL

## Updating Your Site

### Using GitHub Actions (Method 1):
Just push changes to the main branch - deployment is automatic!

### Using gh-pages (Method 2):
```bash
npm run deploy
```

## Current Configuration
- **Repository:** MEC-2025-Frontend
- **Homepage:** https://AmmaarShareef.github.io/MEC-2025-Frontend
- **Base Path:** /MEC-2025-Frontend/

## Notes
- The first deployment may take a few minutes
- After deployment, wait 1-2 minutes for changes to propagate
- Always test locally with `npm run preview` before deploying


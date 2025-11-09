# Check Your Repository Name

The 404 errors mean the base path doesn't match your repository name.

## How to Find Your Exact Repository Name:

1. Go to your GitHub repository
2. Look at the URL in your browser: `https://github.com/AmmaarShareef/???`
3. The part after your username is your repository name

## Common Issues:

- Repository name: `MEC-2025-Frontend` ✅
- Repository name: `mec-2025-frontend` ❌ (case sensitive!)
- Repository name: `MEC-2025-Frontend-` ❌ (extra dash)
- Repository name: `MEC2025Frontend` ❌ (no dashes)

## Current Configuration:

- Base path in `vite.config.js`: `/MEC-2025-Frontend/`
- Homepage in `package.json`: `https://AmmaarShareef.github.io/MEC-2025-Frontend/`

If your repository name is different, we need to update these!


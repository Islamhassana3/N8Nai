# Railway Deployment Guide for n8n

This repository contains configuration files to deploy n8n as a single service on Railway.app, avoiding the common multi-service detection issues.

## 🚨 IMPORTANT: Avoiding Multiple Services

The screenshot shows Railway detecting 20+ services instead of one. This happens when Railway auto-detects services from the monorepo. **Follow these steps to deploy correctly:**

### Step 1: Delete All Auto-Detected Services
1. In your Railway dashboard, **delete all services** that were auto-detected
2. Start fresh with a clean project

### Step 2: Deploy Using Configuration (Choose ONE method)

#### Method A: Manual Service Creation (RECOMMENDED)
1. Create a **new service** manually in Railway
2. Connect it to your GitHub repository
3. Set the **Root Directory** to `.` (repository root)
4. Railway will use the `railway.json` configuration automatically
5. The `.railwayignore` file prevents detection of multiple services

**The `.railwayignore` file is key** - it excludes all `packages/*/` directories so Railway won't scan the 52+ package.json files and create hundreds of services.

#### Method B: Railway Template
1. Create a Railway template using the `railway.json` configuration
2. Deploy using the template rather than direct GitHub connection

#### Method C: Railway CLI
```bash
railway login
railway link
railway up
```

## Configuration Files

- **`.railwayignore`** - **MOST IMPORTANT** - Prevents auto-detection of multiple services
- **`railway.json`** - Primary configuration 
- **`railway.toml`** - Alternative TOML format
- **`nixpacks.toml`** - Explicit build configuration
- **`Procfile`** - Simple fallback process definition

## What These Files Solve

**Problem**: Railway auto-detects multiple services from the monorepo structure, creating services for:
- Main n8n app
- Editor UI  
- Node dev tools
- Various workspace packages (52+ package.json files)
- Extensions and testing packages

**Solution**: 
- **`.railwayignore`** prevents Railway from scanning packages/* directories for services
- `railway.json` explicitly defines build and start commands for ONE service named "n8n"
- `railway.toml` provides TOML configuration alternative
- `nixpacks.toml` provides explicit build instructions
- `Procfile` defines the web process
- Root `package.json` includes `start:railway` script

## Build Process

1. Install pnpm package manager
2. Install dependencies using `pnpm install --frozen-lockfile`
3. Build the application using `pnpm build:deploy`
4. Start the application using `pnpm start:railway`

## Environment Variables

Railway will automatically set these from the configuration:
- `NODE_ENV=production`
- `N8N_HOST=0.0.0.0`
- `N8N_PORT=$PORT` (Railway provides this)
- `N8N_PROTOCOL=https`
- `WEBHOOK_URL=https://$RAILWAY_STATIC_URL/`

## Troubleshooting Multiple Services

If you still see multiple services being created:

1. **Check .railwayignore exists** - This file should exclude packages/ directories  
2. **Delete all auto-detected services** in Railway dashboard
3. **Create a new service manually**:
   - Go to your Railway project
   - Click "New Service"  
   - Select "GitHub Repo"
   - Choose your repository
   - Set Root Directory to `.` (repository root)
   - Ensure `.railwayignore` is in your repo root
   - Railway will use the `railway.json` configuration and ignore monorepo packages

4. **Alternative: Use Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway up
   ```

4. **If services keep auto-detecting**:
   - Verify `.railwayignore` is properly configured
   - Check that your Railway service uses this repository directly (not a fork that's missing the ignore file)
   - Alternative: Use Railway template deployment

## Key Files Added to Fix Multiple Services

This repository now includes:
- **`.railwayignore`** - Excludes all 52+ package.json files from service detection
- Updated Railway configs with consistent service naming and commands

The root cause was Railway detecting each of the 52 package.json files (across packages, templates, tests) as separate potential services, creating 800+ services instead of 1.

## Railway Template Creation

To create a reusable template:
1. Set up the service correctly with these files
2. In Railway dashboard, go to your service
3. Click "Create Template"
4. Share the template link for one-click deployments
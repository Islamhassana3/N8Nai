# Railway Deployment Guide for n8n

This repository contains configuration files to deploy n8n as a single service on Railway.app, avoiding the common multi-service detection issues.

## Files Overview

- `railway.json` - Railway-specific deployment configuration
- `.railwayignore` - Prevents Railway from detecting individual workspace packages as separate services
- `nixpacks.toml` - Explicit build configuration for Nixpacks (Railway's builder)
- `Procfile` - Alternative process definition

## Deployment Options

### Option 1: Direct Repository Deploy
1. Connect your GitHub repository to Railway
2. The `railway.json` and `.railwayignore` files will configure a single n8n service
3. Railway will use the specified build and start commands

### Option 2: Using the Deploy Button
If you create a deploy template, use these environment variables:
```
NODE_ENV=production
N8N_HOST=0.0.0.0
N8N_PORT=$PORT
N8N_PROTOCOL=https
N8N_EDITOR_BASE_URL=https://$RAILWAY_STATIC_URL/
```

## What These Files Solve

**Problem**: Railway auto-detects multiple services from the monorepo structure, creating services for:
- Main n8n app
- Editor UI
- Node dev tools
- Various workspace packages
- Extensions and testing packages

**Solution**: 
- `.railwayignore` excludes workspace packages that shouldn't be separate services
- `railway.json` explicitly defines build and start commands
- `nixpacks.toml` provides explicit build instructions
- `Procfile` defines the web process

## Build Process

1. Install pnpm package manager
2. Install dependencies using `pnpm install --frozen-lockfile`
3. Build the application using `pnpm build:deploy`
4. Start the application from `packages/cli/bin/n8n`

## Environment Variables

Set these in your Railway project:
- `NODE_ENV=production`
- `N8N_HOST=0.0.0.0`
- `N8N_PORT=$PORT` (Railway provides this)
- `N8N_PROTOCOL=https`
- `N8N_EDITOR_BASE_URL=https://$RAILWAY_STATIC_URL/`

## Troubleshooting

If you still see multiple services being created:
1. Delete all services in your Railway project
2. Redeploy from the repository root
3. Ensure the `.railwayignore` file is properly configured
4. Check that `railway.json` is in the repository root

## Advanced Configuration

For queue mode or multi-instance setups, you would need to modify the configuration files to include additional services like Redis and PostgreSQL, but for standard single-instance n8n deployment, these files ensure only one service is created.
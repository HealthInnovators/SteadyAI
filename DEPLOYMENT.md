# Deployment Guide for SteadyAI

This project contains a Fastify backend, Next.js frontend, and Android app. Follow the steps below to deploy.

## Quick Start (Railway)

### Prerequisites
- Railway.app account (free tier available)
- GitHub account (for repo)
- Vercel account (free tier for frontend)

### Deploy Backend to Railway

1. **Push to GitHub**
   ```bash
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy Backend**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository
   - Railway will auto-detect and build using `Dockerfile.backend`
   - Add environment variables from `.env` in Railway dashboard:
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `SUPABASE_URL`
     - `SUPABASE_API_KEY`
     - `GEMINI_API_KEY`
     - `GROQ_API_KEY`
     - `LLM_PROVIDER`
     - And any other required variables

3. **Backend URL**
   - Railway provides a public URL automatically
   - Note this URL for frontend configuration

### Deploy Frontend to Vercel

1. **Deploy Frontend**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import from GitHub
   - Configure:
     - **Root Directory**: `web`
     - **Framework**: Next.js
     - **Environment Variables**:
       - `NEXT_PUBLIC_API_URL=<railway-backend-url>`
   - Click "Deploy"

2. **Frontend URL**
   - Vercel provides a public URL automatically

## Local Testing with Docker

```bash
# Build and run locally
docker-compose up --build

# Backend: http://localhost:3000
# Frontend: http://localhost:3001
```

## Database Migrations

After deployment, run migrations:

```bash
# For Railway-deployed backend
npx prisma migrate deploy --skip-generate
```

## Environment Variables Needed

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_API_KEY=sb_...
NUTRITION_AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
LLM_PROVIDER=gemini
LLM_TIMEOUT_MS=15000
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

## Production Checklist

- [ ] Database migrations applied
- [ ] Environment variables set on Railway
- [ ] Environment variables set on Vercel
- [ ] Frontend can reach backend API
- [ ] CORS configured if needed
- [ ] Database backups enabled
- [ ] Monitoring/logging enabled

## Troubleshooting

**Backend won't start**
- Check environment variables are set
- Verify database connection string
- Check logs in Railway dashboard

**Frontend can't reach backend**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS headers in backend
- Ensure backend is running

**Database connection issues**
- Verify `DATABASE_URL` is correct
- Check network access to database
- Ensure Prisma client is generated

## Android App Deployment

Android app builds are configured in `.github/workflows/android-ci.yml`. Check that workflow for CI/CD pipeline details.

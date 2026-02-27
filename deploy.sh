#!/bin/bash
# Quick deployment script for SteadyAI

set -e

echo "🚀 SteadyAI Deployment Script"
echo "=================================="
echo ""

# Check required tools
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Display deployment options
echo "Choose deployment platform:"
echo "1) Railway (Backend) + Vercel (Frontend) - Recommended"
echo "2) Docker Compose (Local)"
echo "3) Manual steps"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Railway + Vercel Deployment"
        echo "================================"
        echo ""
        echo "Step 1: Push to GitHub"
        echo "$ git add ."
        echo "$ git commit -m 'Add deployment configuration'"
        echo "$ git push -u origin main"
        echo ""
        read -p "Have you pushed to GitHub? (y/n): " github_done
        if [ "$github_done" = "y" ]; then
            echo ""
            echo "Step 2: Deploy Backend to Railway"
            echo "1. Go to https://railway.app"
            echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
            echo "3. Select your repository"
            echo "4. Add environment variables (from .env file)"
            echo "5. Deploy!"
            echo ""
            echo "Step 3: Deploy Frontend to Vercel"
            echo "1. Go to https://vercel.com"
            echo "2. Click 'Add New...' → 'Project'"
            echo "3. Import from GitHub, select repo"
            echo "4. Root Directory: 'web'"
            echo "5. Add NEXT_PUBLIC_API_URL=<railway-backend-url>"
            echo "6. Deploy!"
            echo ""
            echo "✅ Deployment started!"
        fi
        ;;
    2)
        echo ""
        echo "🐳 Docker Compose Deployment"
        echo "=============================="
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed"
            echo "Install Docker from https://www.docker.com/products/docker-desktop"
            exit 1
        fi
        
        echo "Building containers..."
        docker-compose build
        
        echo ""
        echo "Starting services..."
        docker-compose up -d
        
        echo ""
        echo "✅ Services running:"
        echo "   Backend: http://localhost:3000"
        echo "   Frontend: http://localhost:3001"
        echo ""
        echo "View logs: docker-compose logs -f"
        echo "Stop services: docker-compose down"
        ;;
    3)
        echo ""
        echo "📋 Manual Deployment Steps"
        echo "=========================="
        echo ""
        echo "Backend (Fastify):"
        echo "1. npm run build"
        echo "2. npm start"
        echo ""
        echo "Frontend (Next.js):"
        echo "1. cd web"
        echo "2. npm run build"
        echo "3. npm start"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

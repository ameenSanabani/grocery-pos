#!/bin/bash

# Production Deployment Script
# This script builds and deploys the Grocery POS system

set -e

echo "🚀 Starting Grocery POS Production Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Build backend
echo "📦 Building backend..."
cd server
npm ci --production
npm run build

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit server/.env with your production values"
    echo "   - Set JWT_SECRET to a secure random string"
    echo "   - Set ALLOWED_ORIGINS to your frontend domain"
    echo "   - Set NODE_ENV=production"
    exit 1
fi

# Build frontend
echo "🎨 Building frontend..."
cd ../client
npm ci --production
npm run build

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit client/.env.local with your production values"
    echo "   - Set NEXT_PUBLIC_API_URL to your backend domain"
    exit 1
fi

echo "✅ Build completed successfully!"

# Create production startup script
cd ..
cat > start-production.sh << 'EOF'
#!/bin/bash

# Production Startup Script
echo "🛒 Starting Grocery POS Production Server..."

# Start backend
cd server
echo "🔧 Starting backend server..."
npm start &

# Wait a moment for backend to start
sleep 3

# Start frontend (if using Next.js standalone)
cd ../client
echo "🎨 Starting frontend server..."
npm start &

echo "✅ Production servers started!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Press Ctrl+C to stop all services"

# Wait for interrupt signal
wait
EOF

chmod +x start-production.sh

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in:"
echo "   - server/.env"
echo "   - client/.env.local"
echo ""
echo "2. Run the production server with:"
echo "   ./start-production.sh"
echo ""
echo "3. For production deployment, consider:"
echo "   - Setting up a reverse proxy (nginx)"
echo "   - Configuring SSL certificates"
echo "   - Setting up process monitoring (PM2)"
echo "   - Configuring automated backups"
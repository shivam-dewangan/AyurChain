# Docker Setup Guide for AyurChain

## Quick Start

### Production Mode
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Mode (with hot reload)
```bash
# Build and start all services in dev mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Services

- **MongoDB**: Port 27017
- **Backend**: Port 5000
- **Frontend**: 
  - Production: Port 80
  - Development: Port 5173

## Environment Configuration

Create `.env.docker` file in root directory:

```env
BUILD_TARGET=production
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost
VITE_API_URL=http://localhost:5000/api
```

## Useful Commands

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs backend
docker-compose logs frontend

# Execute commands in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Remove all containers and volumes
docker-compose down -v

# Clean rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
lsof -ti:80 | xargs kill -9
```

### Clear Docker cache
```bash
docker system prune -a
docker volume prune
```

### MongoDB connection issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

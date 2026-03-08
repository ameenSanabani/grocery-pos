# 🚀 Production Deployment Guide

This guide covers deploying the Grocery POS system to production environments.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+) recommended
- **Node.js**: 18.x or higher
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: Minimum 10GB SSD
- **Network**: Stable internet connection

### Domain & SSL
- Registered domain name
- SSL certificate (Let's Encrypt recommended)

## 🏗️ Deployment Options

### Option 1: Single Server Deployment
All services on one server (VPS/dedicated server)

### Option 2: Multi-Server Deployment
- Frontend server (nginx + static files)
- Backend server (Node.js API)
- Database server (PostgreSQL recommended for scale)

## 📦 Step-by-Step Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo adduser grocery
sudo usermod -aG sudo grocery
```

### 2. Application Deployment

```bash
# Switch to application user
sudo su - grocery

# Clone repository
git clone <your-repo-url> grocery-pos
cd grocery-pos

# Build application
chmod +x deploy.sh
./deploy.sh

# Configure environment variables
nano server/.env
nano client/.env.local
```

### 3. Configure Environment Variables

#### Backend (server/.env)
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=./grocery.db
JWT_SECRET=your-super-secure-jwt-secret-here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
```

#### Frontend (client/.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Grocery POS
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_BARCODES=true
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/grocery-pos
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend (Next.js static files)
    location / {
        root /home/grocery/grocery-pos/client/.next;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Process Management with PM2

Create PM2 ecosystem file:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'grocery-api',
      script: './server/dist/index.js',
      cwd: '/home/grocery/grocery-pos',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    }
  ]
};
```

Start applications with PM2:

```bash
# Start PM2 process
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 7. Database Setup

For production, consider upgrading from SQLite to PostgreSQL:

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql
CREATE DATABASE grocery_db;
CREATE USER grocery_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE grocery_db TO grocery_user;
\q
```

Update backend configuration to use PostgreSQL in production.

## 🔒 Security Hardening

### Firewall Setup
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Application Security
- Change all default passwords
- Use strong JWT secrets
- Enable HTTPS only
- Set up intrusion detection
- Regular security updates

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# PM2 Monitoring
pm2 monit

# Log monitoring
tail -f /home/grocery/grocery-pos/logs/api-combined.log
```

### System Monitoring
- Set up system monitoring (Prometheus/Grafana)
- Monitor disk space, memory, CPU
- Database performance monitoring
- Error alerting setup

## 🔄 Backup Strategy

### Database Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump grocery_db > /backups/grocery_db_$DATE.sql
find /backups -name "grocery_db_*.sql" -mtime +7 -delete
```

### Application Backups
- Code repository backups
- Configuration file backups
- User data backups
- Test restoration process regularly

## 🚀 Performance Optimization

### Frontend Optimization
- Enable compression (gzip)
- Browser caching headers
- CDN for static assets
- Image optimization

### Backend Optimization
- Database indexing
- Connection pooling
- Response caching
- API rate limiting

## 📱 Update Process

### Zero-Downtime Deployment
```bash
# Clone new version
git pull origin main

# Build new version
npm run build

# Reload PM2 processes (zero downtime)
pm2 reload grocery-api
```

### Database Migrations
```bash
# Run migrations
cd server
npm run migrate

# Verify everything works
pm2 logs grocery-api --lines 50
```

## 🔧 Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check logs
pm2 logs grocery-api

# Check configuration
cat server/.env

# Verify Node.js version
node -v
```

#### Database connection issues
```bash
# Test database connection
psql -h localhost -U grocery_user -d grocery_db

# Check database status
sudo systemctl status postgresql
```

#### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --dry-run
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- Weekly: Check logs, update packages
- Monthly: Security updates, performance review
- Quarterly: Backup verification, SSL renewal check

### Support Channels
- Application logs: `/home/grocery/grocery-pos/logs/`
- System logs: `/var/log/nginx/`, `/var/log/postgresql/`
- PM2 monitoring: `pm2 monit`

## 📈 Scaling Considerations

### When to Scale
- CPU usage consistently > 80%
- Memory usage > 80%
- Database query times increasing
- User complaints about performance

### Scaling Options
- Vertical scaling (more resources)
- Horizontal scaling (load balancer)
- Database read replicas
- Caching layer (Redis)

---

**Note**: This guide covers basic deployment. Adjust configurations based on your specific requirements and infrastructure.
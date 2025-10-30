# VPS Deployment Guide

## Quick Reference Commands

### Deploy/Update

```bash
# Stop, rebuild, and start
docker-compose down && docker-compose up --build -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Environment Setup

```env
# Required in .env file
NEXT_PUBLIC_POCKETBASE_URL=https://api.ducworld.com
FRONTEND_URL=https://ducworld.com
```

---

## Prerequisites

1. **VPS Requirements:**

   - Ubuntu 20.04+ or Debian 11+ recommended
   - At least 1GB RAM (2GB recommended)
   - 10GB+ storage
   - Docker and Docker Compose installed

2. **Domain Setup (Optional but Recommended):**
   - A domain pointing to your VPS IP
   - SSL certificate (use Let's Encrypt with Certbot)

## Step 1: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

Log out and log back in for group changes to take effect.

## Step 2: Clone Your Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/re-ecommerce.git
cd re-ecommerce
```

## Step 3: Configure Environment

```bash
# Create environment file
cp .env.example .env

# Edit with your settings
nano .env
```

Update the `NEXT_PUBLIC_POCKETBASE_URL` with your actual domain or VPS IP:

- For domain: `https://yourdomain.com`
- For IP: `http://YOUR_VPS_IP:8080`

## Step 4: Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 5: Configure Nginx Reverse Proxy (Recommended)

Install Nginx:

```bash
sudo apt install nginx -y
```

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/re-ecommerce
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend Admin Panel
    location /_/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/re-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx for HTTPS
```

## Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Useful Commands

### View logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Restart services:

```bash
docker-compose restart
```

### Stop services:

```bash
docker-compose down
```

### Update and rebuild:

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Backup PocketBase data:

```bash
# Create backup
tar -czf backup-$(date +%Y%m%d).tar.gz backend/pb_data/

# Restore backup
tar -xzf backup-YYYYMMDD.tar.gz
```

## Troubleshooting

### Check container status:

```bash
docker-compose ps
```

### Check container health:

```bash
docker inspect re-ecommerce-backend | grep -A 10 Health
docker inspect re-ecommerce-frontend | grep -A 10 Health
```

### Access container shell:

```bash
docker exec -it re-ecommerce-frontend sh
docker exec -it re-ecommerce-backend sh
```

### Check disk space:

```bash
df -h
docker system df
```

### Clean up Docker:

```bash
# Remove unused images and containers
docker system prune -a
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Firewall configured
- [ ] Nginx reverse proxy setup
- [ ] SSL certificate installed
- [ ] Regular backups scheduled
- [ ] Monitoring setup (optional: Uptime Kuma, Prometheus)
- [ ] Log rotation configured
- [ ] Auto-restart enabled (restart: unless-stopped in docker-compose)

## Monitoring & Maintenance

### Set up automatic backups (cron job):

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/re-ecommerce && tar -czf /backups/pb_data-$(date +\%Y\%m\%d).tar.gz backend/pb_data/
```

### Monitor disk space:

```bash
# Check disk usage weekly
0 0 * * 0 df -h > /var/log/disk-usage.log
```

## Security Best Practices

1. Keep system and Docker updated
2. Use strong passwords for PocketBase admin
3. Enable firewall
4. Use SSL/TLS certificates
5. Regular backups
6. Monitor logs for suspicious activity
7. Keep sensitive data in environment variables
8. Don't expose unnecessary ports

## Support

For issues, check:

- Docker logs: `docker-compose logs`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- System logs: `sudo journalctl -xe`

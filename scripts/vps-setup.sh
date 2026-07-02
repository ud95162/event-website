#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# One-time VPS provisioning for events-lk (Ubuntu 22.04/24.04).
# Run as a sudo-capable user:  bash vps-setup.sh
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR=/var/www/events-lk
DB_NAME=events_lk
DB_USER=events_prod
# Change this before running, or you'll be prompted.
DB_PASS="${DB_PASS:-}"

echo "==> Updating system"
sudo apt-get update -y && sudo apt-get upgrade -y

echo "==> Installing Node 20 LTS"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "==> Installing MySQL + nginx + tools"
sudo apt-get install -y mysql-server nginx git ufw
sudo npm install -g pm2

echo "==> Firewall (SSH + HTTP + HTTPS)"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "==> Creating database and user"
if [ -z "$DB_PASS" ]; then
  read -rsp "Enter a strong password for MySQL user '$DB_USER': " DB_PASS; echo
fi
sudo mysql <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

echo "==> Preparing app directory"
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER":"$USER" "$APP_DIR"

echo "==> Writing .env.production (edit later with: nano $APP_DIR/.env.production)"
cat > "$APP_DIR/.env.production" <<ENV
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=${DB_USER}
MYSQL_PASSWORD=${DB_PASS}
MYSQL_DATABASE=${DB_NAME}
NODE_ENV=production
PORT=3001
ENV

echo "==> Configuring nginx reverse proxy"
sudo tee /etc/nginx/sites-available/events-lk >/dev/null <<'NGINX'
server {
    listen 80;
    server_name test.codexium.dev;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    client_max_body_size 10M;   # allow base64 image uploads
}
NGINX
sudo ln -sf /etc/nginx/sites-available/events-lk /etc/nginx/sites-enabled/events-lk
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "==> Enabling pm2 on boot"
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1 | bash || true

echo ""
echo "✅ VPS ready. Next:"
echo "   1) Add GitHub secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT)"
echo "   2) Push to main — the deploy workflow ships the build here."
echo "   3) (Optional) HTTPS:  sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx"

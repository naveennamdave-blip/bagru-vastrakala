# 🌿 Bagru Vastrakala — E-Commerce Website v2.0

Heritage Indian textiles, full-stack e-commerce website.  
**Node.js + Express + WhatsApp Checkout + Email Notifications**

---

## 🚀 Run Locally (5 Minutes)

### Step 1 — Install Node.js
Download from: https://nodejs.org (choose "LTS" version)

### Step 2 — Setup Project

```bash
# Extract the zip, then open a terminal in the bagru-vastrakala folder

# Install dependencies
npm install

# Create your .env file
copy .env.example .env        # Windows
cp .env.example .env           # Mac / Linux
```

### Step 3 — Configure Email (open `.env` file)

```env
EMAIL_USER=naveennamdave@gmail.com
EMAIL_PASS=kfqd nbkd tafz bhja     # Your Gmail App Password
WHATSAPP_NUMBER=919376542891
```

**To get a Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Click "App Passwords" → Select "Mail" → Generate
4. Copy the 16-character password into `EMAIL_PASS`

### Step 4 — Start

```bash
npm run dev
```

Open: http://localhost:3000 ✅

---

## ☁️ HOSTING — Deploy to Internet

### Option A: Railway.app (Easiest — FREE)

1. Create account at https://railway.app
2. Click **"New Project" → "Deploy from GitHub"**
3. Push your code to GitHub first:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/bagru-vastrakala.git
   git push -u origin main
   ```
4. In Railway: connect your GitHub repo
5. Add Environment Variables in Railway dashboard:
   - `EMAIL_USER` = naveennamdave@gmail.com
   - `EMAIL_PASS` = your app password
   - `WHATSAPP_NUMBER` = 919376542891
   - `NODE_ENV` = production
6. Railway auto-detects Node.js and deploys!
7. Get your live URL like: `https://bagru-vastrakala-production.up.railway.app`

### Option B: Render.com (Free Tier)

1. Create account at https://render.com
2. Click **"New" → "Web Service"** → Connect GitHub
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add Environment Variables (same as above)
5. Click **Deploy** — live in ~3 minutes!

> ⚠️ Free tier sleeps after 15 min inactivity. First load may be slow.

### Option C: VPS (DigitalOcean / Hostinger — Production)

For a professional permanent server:

```bash
# On your VPS (Ubuntu 22.04)

# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2 (keeps app running)
sudo npm install -g pm2

# 3. Upload your files and enter directory
cd bagru-vastrakala

# 4. Install dependencies
npm install --production

# 5. Create .env with your credentials
nano .env

# 6. Start with PM2
pm2 start server.js --name "bagru-vastrakala"
pm2 startup     # Auto-start on reboot
pm2 save

# 7. Install Nginx
sudo apt install nginx

# 8. Configure Nginx (replace yourdomain.com)
sudo nano /etc/nginx/sites-available/bagru

# Paste this config:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/bagru /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 9. SSL Certificate (HTTPS) — FREE
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Your site will be live at `https://yourdomain.com` 🎉

---

## 🔧 Project Structure

```
bagru-vastrakala/
├── public/
│   ├── index.html      ← Main frontend page
│   ├── css/
│   │   └── style.css   ← All styles
│   └── js/
│       └── app.js      ← Frontend logic (cart, wishlist, etc.)
├── server.js           ← Express backend
├── package.json
├── .env.example        ← Copy to .env and fill in
├── .gitignore
├── Procfile            ← For Railway/Render
└── README.md           ← This file
```

---

## ✨ Features

- ✅ **24 real products** with actual product images
- ✅ **Cart** with qty controls, stored in browser
- ✅ **Wishlist** with move-to-cart, badge count
- ✅ **WhatsApp Checkout** — pre-filled order message
- ✅ **Contact form** sends real email notification to your Gmail
- ✅ **Product search** across all categories
- ✅ **Mobile responsive** — works on all screen sizes
- ✅ **Product modal** with details, WhatsApp inquiry
- ✅ **SEO ready** — meta tags, OG tags, clean structure
- ✅ **Fast** — static files, lazy image loading

---

## 📞 Support

WhatsApp: +91 9376542891  
Email: naveennamdave@gmail.com

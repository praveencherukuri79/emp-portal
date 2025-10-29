# 🚀 Deployment Guide

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Pros**: Free tier, automatic deployments, MongoDB included, easy setup
**Cost**: Free tier available, ~$5/month for production

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js and deploy

3. **Add MongoDB**
   - In your project, click "+ New"
   - Select "Database" → "Add MongoDB"
   - Copy the connection string
   - Add to environment variables

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<railway-mongodb-url>
   JWT_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   SESSION_SECRET=<generate-random-string>
   EMAIL_USER=<your-gmail>
   EMAIL_PASSWORD=<gmail-app-password>
   CORS_ORIGIN=<your-frontend-url>
   FRONTEND_URL=<your-frontend-url>
   ```

5. **Deploy**
   - Railway deploys automatically on git push
   - Get your URL: `https://your-app.railway.app`

---

### Option 2: Heroku

**Pros**: Popular, well-documented, free tier
**Cost**: Free tier available (with limits)

#### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create emp-portal-backend
   ```

4. **Add MongoDB**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set EMAIL_USER=your-email
   heroku config:set EMAIL_PASSWORD=your-password
   ```

6. **Add Procfile**
   Create `Procfile` in backend root:
   ```
   web: npm start
   ```

7. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

---

### Option 3: Render

**Pros**: Modern, free tier, automatic SSL, easy setup
**Cost**: Free tier available

#### Steps:

1. **Push to GitHub** (same as Railway)

2. **Create Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Name**: emp-portal-backend
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

3. **Add MongoDB**
   - Use MongoDB Atlas (free tier)
   - Or add Render's MongoDB addon

4. **Set Environment Variables**
   - Add all variables from `.env.example`

5. **Deploy**
   - Render deploys automatically

---

### Option 4: Digital Ocean App Platform

**Pros**: Professional, scalable, good pricing
**Cost**: $5/month starter

#### Steps:

1. **Create App**
   - Go to [digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)
   - Connect GitHub
   - Select repository

2. **Configure**
   - **Type**: Web Service
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: 3000

3. **Add Database**
   - Add managed MongoDB database
   - Copy connection string

4. **Set Environment Variables**

5. **Deploy**

---

### Option 5: AWS (EC2 + MongoDB Atlas)

**Pros**: Full control, scalable, professional
**Cost**: Variable, ~$10-50/month

#### Steps:

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro for testing (free tier)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd emp-portal/backend
   npm install
   npm run build
   ```

6. **Setup MongoDB Atlas**
   - Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Whitelist EC2 IP

7. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   # Add all variables
   ```

8. **Start with PM2**
   ```bash
   pm2 start dist/server.js --name emp-portal
   pm2 startup
   pm2 save
   ```

9. **Setup Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/emp-portal
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/emp-portal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended for Angular)

1. **Build Angular**
   ```bash
   cd frontend
   ng build --configuration production
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configure**
   - Set output directory to `dist/emp-portal-frontend`
   - Add environment variables (API URL)

### Option 2: Netlify

1. **Build**
   ```bash
   ng build --configuration production
   ```

2. **Deploy**
   - Drag and drop `dist` folder to Netlify
   - Or connect GitHub for auto-deploy

### Option 3: AWS S3 + CloudFront

1. **Build**
   ```bash
   ng build --configuration production
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/emp-portal-frontend s3://your-bucket-name
   ```

3. **Setup CloudFront** for CDN

---

## MongoDB Atlas Setup (Recommended)

1. **Create Free Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up and create free M0 cluster
   - Choose AWS/GCP/Azure and region closest to your users

2. **Create Database User**
   - Database Access → Add New Database User
   - Choose password authentication
   - Save username and password

3. **Whitelist IP**
   - Network Access → Add IP Address
   - For testing: Allow access from anywhere (0.0.0.0/0)
   - For production: Add your server's IP

4. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password

5. **Use in .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emp-portal?retryWrites=true&w=majority
   ```

---

## Environment Variables Checklist

Before deploying, ensure all these are set:

```bash
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=<your-mongodb-connection-string>

# JWT
JWT_SECRET=<random-string-min-32-chars>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<another-random-string>
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=<another-random-string>
SESSION_MAX_AGE=86400000

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<your-gmail>
EMAIL_PASSWORD=<gmail-app-password>
EMAIL_FROM=<no-reply-email>

# URLs
CORS_ORIGIN=<your-frontend-url>
FRONTEND_URL=<your-frontend-url>
BACKEND_URL=<your-backend-url>

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Security Checklist

Before going to production:

- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS properly (not `*`)
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Whitelist specific IPs for MongoDB
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Set secure session cookies
- [ ] Enable Helmet security headers
- [ ] Review and update rate limits
- [ ] Set up monitoring (logs, errors)
- [ ] Configure backup strategy for database
- [ ] Test password reset flow
- [ ] Test all API endpoints
- [ ] Load test the application

---

## Post-Deployment

1. **Test All Endpoints**
   - Use Postman to test each API endpoint
   - Verify authentication works
   - Test password reset emails
   - Check CORS configuration

2. **Monitor**
   - Set up logging (Logtail, Papertrail, etc.)
   - Monitor errors (Sentry)
   - Track performance (New Relic, DataDog)

3. **Backup**
   - Enable MongoDB Atlas automated backups
   - Export backup of environment variables

4. **Documentation**
   - Update API documentation with production URL
   - Document deployment process
   - Create runbook for common issues

---

## Cost Estimates

### Free Tier (Development)
- **Backend**: Railway/Render - Free
- **Database**: MongoDB Atlas M0 - Free
- **Frontend**: Vercel/Netlify - Free
- **Total**: $0/month

### Starter (Small Business)
- **Backend**: Railway/Render - $5-10/month
- **Database**: MongoDB Atlas M2 - $9/month
- **Frontend**: Vercel Pro - $20/month
- **Domain**: $12/year
- **Total**: ~$35-40/month

### Professional (Medium Business)
- **Backend**: Digital Ocean - $12/month
- **Database**: MongoDB Atlas M10 - $57/month
- **Frontend**: Vercel Pro - $20/month
- **CDN**: CloudFlare - $20/month
- **Monitoring**: Sentry - $26/month
- **Total**: ~$135/month

### Enterprise (Large Organization)
- **Backend**: AWS EC2 - $50-200/month
- **Database**: MongoDB Atlas M30 - $180/month
- **Frontend**: AWS CloudFront - $50/month
- **Load Balancer**: $20/month
- **Monitoring**: DataDog - $100/month
- **Total**: ~$400-550/month

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check connection string
   - Verify IP whitelist
   - Test with MongoDB Compass

2. **CORS Errors**
   - Verify CORS_ORIGIN in .env
   - Check frontend API URL configuration
   - Ensure credentials: true in both sides

3. **Email Not Sending**
   - Verify Gmail App Password
   - Check EMAIL_* variables
   - Test with a simple email first

4. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiry
   - Ensure proper Authorization header

5. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify TypeScript configuration

---

## Success!

Once deployed, your application will be accessible at:
- Backend: `https://your-backend-url.com`
- Frontend: `https://your-frontend-url.com`

Remember to:
- Update API_REFERENCE.md with production URLs
- Test thoroughly before announcing
- Set up monitoring and alerts
- Create a deployment checklist
- Document any custom configurations

Happy Deploying! 🚀

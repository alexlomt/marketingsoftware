# CRM Application Deployment Guide

This document provides instructions for deploying the CRM application to a production environment.

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- SQLite 3.x or later (for development)
- PostgreSQL 14.x or later (recommended for production)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Application
   NODE_ENV=production
   APP_URL=https://your-domain.com
   
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/crm_database
   
   # Authentication
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=7d
   
   # Email
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASSWORD=your-smtp-password
   EMAIL_FROM=noreply@your-domain.com
   
   # File Storage
   STORAGE_TYPE=s3
   S3_BUCKET=your-bucket-name
   S3_REGION=us-east-1
   S3_ACCESS_KEY=your-access-key
   S3_SECRET_KEY=your-secret-key
   ```

4. Configure your database:
   - For SQLite (development):
     ```bash
     npm run migrate
     ```
   - For PostgreSQL (production):
     - Create a PostgreSQL database
     - Update the `DATABASE_URL` in your `.env` file
     - Run migrations:
       ```bash
       npm run migrate:production
       ```

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. The build output will be in the `.next` directory.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Follow the prompts to link your project and set up environment variables.

### Option 2: Self-hosted

1. Install PM2 for process management:
   ```bash
   npm install -g pm2
   ```

2. Start the application:
   ```bash
   pm2 start npm --name "crm-app" -- start
   ```

3. Configure PM2 to start on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

4. Set up a reverse proxy with Nginx:
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

5. Secure with SSL using Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Option 3: Docker

1. Build the Docker image:
   ```bash
   docker build -t crm-app .
   ```

2. Run the container:
   ```bash
   docker run -d -p 3000:3000 --name crm-app --env-file .env crm-app
   ```

## Post-Deployment Steps

1. Create an admin user:
   ```bash
   npm run create-admin
   ```

2. Verify the application is running correctly by accessing it in a browser.

3. Set up regular database backups:
   ```bash
   # Example cron job for daily backups
   0 0 * * * pg_dump -U username crm_database > /path/to/backups/crm_$(date +\%Y\%m\%d).sql
   ```

## Troubleshooting

- **Application not starting**: Check the logs with `pm2 logs crm-app` or `docker logs crm-app`
- **Database connection issues**: Verify your database credentials and connection string
- **Email not sending**: Check your SMTP configuration and credentials

## Maintenance

- Regularly update dependencies:
  ```bash
  npm update
  ```

- Monitor application performance:
  ```bash
  pm2 monit
  ```

- Check for security vulnerabilities:
  ```bash
  npm audit
  ```

For additional support, please contact the development team.

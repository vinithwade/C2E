# C2E Quick Start Guide

Get C2E up and running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database running
- [ ] AWS S3 bucket created
- [ ] SMTP credentials (for email invites)

## Step 1: Database Setup

```bash
# Create PostgreSQL database
createdb c2e

# Or using psql
psql -U postgres
CREATE DATABASE c2e;
\q
```

## Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/c2e?schema=public"
JWT_SECRET="change-this-to-random-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="change-this-to-random-refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"

# OAuth (optional for MVP)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL="http://localhost:3000/auth/github/callback"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="c2e-videos"
S3_SIGNED_URL_EXPIRY="15"

# Email (for invites)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="C2E <noreply@c2e.com>"

# App
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"
EOF

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start server
npm run start:dev
```

Backend should now be running at http://localhost:3000

## Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

# Start dev server
npm run dev
```

Frontend should now be running at http://localhost:3001

## Step 4: Desktop Connector (Optional for Testing)

```bash
cd desktop-connector

# Install dependencies
npm install

# Start in development
npm start
```

## Step 5: Test the Flow

1. **Register as Creator**
   - Go to http://localhost:3001/register
   - Create an account

2. **Create a Project**
   - Click "New Project"
   - Enter project name and description

3. **Upload a Video**
   - Click on your project
   - Drag & drop or select a video file
   - File uploads directly to S3

4. **Invite an Editor**
   - Click "Invite Editor"
   - Enter editor email
   - Editor receives email invitation

5. **Editor Accepts**
   - Editor clicks link in email
   - Registers/logs in
   - Accepts invitation

6. **Open in Editor**
   - Editor views project files
   - Clicks "Open in Editor"
   - Desktop connector downloads and opens in DaVinci/Premiere

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env

### S3 Upload Fails
- Verify AWS credentials
- Check bucket name and permissions
- Ensure bucket allows PUT operations

### Email Not Sending
- For Gmail, use App Password (not regular password)
- Check SMTP settings
- Invites still work even if email fails (token is in response)

### Desktop Connector Not Opening
- Ensure Electron app is running
- Check protocol handler registration
- Try manual protocol test: `c2e://open?fileId=test&url=https://example.com/video.mp4`

## Next Steps

- Set up production environment variables
- Configure custom domain
- Set up SSL certificates
- Deploy backend to production server
- Deploy frontend to Vercel/Netlify
- Build and distribute desktop connector

## API Documentation

Once backend is running, visit:
- Swagger UI: http://localhost:3000/api

## Support

Check the main README.md for detailed documentation.

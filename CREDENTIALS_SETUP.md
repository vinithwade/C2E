# How to Get C2E Credentials

This guide explains where to obtain each credential needed for the `.env` file.

## 1. DATABASE_URL (PostgreSQL)

### Option A: Install PostgreSQL Locally

**macOS:**
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb c2e
```

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install and use pgAdmin to create a database named `c2e`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb c2e
```

**Format:**
```
DATABASE_URL="postgresql://username:password@localhost:5432/c2e?schema=public"
```

**Default credentials:**
- Username: `postgres` (or your system username)
- Password: (set during installation, or empty)
- Port: `5432` (default)

**To set a password:**
```bash
psql -U postgres
ALTER USER postgres PASSWORD 'your-password';
\q
```

### Option B: Use a Cloud Database (Free Tier)

**Free PostgreSQL Services:**
- **Supabase**: https://supabase.com (free tier available)
- **Neon**: https://neon.tech (free tier available)
- **Railway**: https://railway.app (free tier available)
- **Render**: https://render.com (free tier available)

They provide a connection string like:
```
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

---

## 2. JWT_SECRET & REFRESH_TOKEN_SECRET

These are **random secret keys** you generate yourself. They should be long, random strings.

### Generate Random Secrets:

**Option A: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice to get two different secrets:
- One for `JWT_SECRET`
- One for `REFRESH_TOKEN_SECRET`

**Option B: Using OpenSSL**
```bash
openssl rand -hex 64
```

**Option C: Online Generator**
- Visit: https://generate-secret.vercel.app/64
- Generate a 64-character random string

**Example:**
```
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
REFRESH_TOKEN_SECRET="f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1"
```

⚠️ **Important:** Never share these secrets or commit them to Git!

---

## 3. AWS S3 Credentials

AWS S3 is used to store video files. You need an AWS account.

### Step 1: Create AWS Account
1. Go to: https://aws.amazon.com/
2. Sign up for a free account (12 months free tier)
3. Add a credit card (won't be charged for free tier usage)

### Step 2: Create S3 Bucket
1. Log into AWS Console: https://console.aws.amazon.com/
2. Go to **S3** service
3. Click **Create bucket**
4. Bucket name: `c2e-videos` (or your preferred name)
5. Region: Choose closest to you (e.g., `us-east-1`)
6. Uncheck "Block all public access" (or configure as needed)
7. Click **Create bucket**

### Step 3: Create IAM User for Access
1. Go to **IAM** service in AWS Console
2. Click **Users** → **Create user**
3. Username: `c2e-s3-user`
4. Check **"Provide user access to the AWS Management Console"** → **Next**
5. Select **"Attach policies directly"**
6. Search and select: **AmazonS3FullAccess** (or create custom policy with only S3 permissions)
7. Click **Next** → **Create user**

### Step 4: Create Access Keys
1. Click on the user you just created
2. Go to **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select **"Application running outside AWS"**
6. Click **Next** → **Create access key**
7. **IMPORTANT:** Copy both:
   - **Access key ID** → This is `AWS_ACCESS_KEY_ID`
   - **Secret access key** → This is `AWS_SECRET_ACCESS_KEY`
   - ⚠️ You can only see the secret key once! Save it immediately.

**Your .env will have:**
```
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
S3_BUCKET_NAME="c2e-videos"
```

### Alternative: Use Local Storage (Development Only)
If you don't want to set up AWS yet, you can modify the code to use local file storage for development.

---

## 4. SMTP Credentials (Email)

SMTP is used to send invitation emails to editors.

### Option A: Gmail (Easiest for Development)

**Step 1: Enable 2-Factor Authentication**
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**

**Step 2: Generate App Password**
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "C2E"
4. Click **Generate**
5. Copy the 16-character password (no spaces)

**Your .env will have:**
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="abcd efgh ijkl mnop"  # The app password from step 2
SMTP_FROM="C2E <your-email@gmail.com>"
```

### Option B: Other Email Providers

**Outlook/Hotmail:**
```
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-password"
```

**SendGrid (Free Tier - 100 emails/day):**
1. Sign up: https://sendgrid.com/
2. Create API key
3. Use:
```
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

**Mailgun (Free Tier - 5,000 emails/month):**
1. Sign up: https://www.mailgun.com/
2. Get SMTP credentials from dashboard
```
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="your-mailgun-username"
SMTP_PASSWORD="your-mailgun-password"
```

### Option C: Skip Email (Development Only)
If you don't need email invites for development, you can:
- Leave SMTP fields empty (invites will still work, but no emails sent)
- Or use a mock email service

---

## Quick Setup Script

Here's a script to help you set up the `.env` file interactively:

```bash
cd backend

# Generate JWT secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

cat > .env << EOF
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/c2e?schema=public"
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="$REFRESH_SECRET"
REFRESH_TOKEN_EXPIRES_IN="7d"

# AWS S3 (fill these in)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="c2e-videos"
S3_SIGNED_URL_EXPIRY="15"

# SMTP (fill these in)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="C2E <your-email@gmail.com>"

# App
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"
EOF

echo "✅ .env file created! Now fill in:"
echo "   - DATABASE_URL (with your PostgreSQL password)"
echo "   - AWS credentials (from AWS Console)"
echo "   - SMTP credentials (from Gmail or other provider)"
```

---

## Priority Order for Setup

1. **Start with:** DATABASE_URL + JWT_SECRET (required to run backend)
2. **Then add:** AWS S3 (required for file uploads)
3. **Finally:** SMTP (optional for development, required for production)

---

## Testing Your Credentials

After setting up `.env`, test each service:

**Test Database:**
```bash
cd backend
npx prisma db push
```

**Test AWS S3:**
- Try uploading a file through the app

**Test SMTP:**
- Send an invite to yourself and check email

---

## Security Notes

⚠️ **Never commit `.env` to Git!**

Make sure `.env` is in `.gitignore`:
```bash
echo ".env" >> .gitignore
```

For production, use environment variables or a secrets management service (AWS Secrets Manager, HashiCorp Vault, etc.).

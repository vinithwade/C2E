# SMTP Setup Guide for C2E

This guide will help you set up SMTP (email) credentials to send invitation emails.

## Option 1: Gmail (Easiest - Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Sign in with your Gmail account
3. Under "Signing in to Google", find **"2-Step Verification"**
4. Click **"Get Started"** and follow the prompts to enable 2FA
   - You'll need to verify your phone number
   - This is required to generate App Passwords

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. At the bottom, click **"Select app"** dropdown
   - Choose **"Mail"**
3. Click **"Select device"** dropdown
   - Choose **"Other (Custom name)"**
   - Type: **"C2E Backend"**
4. Click **"Generate"**
5. **IMPORTANT:** Copy the 16-character password that appears
   - It will look like: `abcd efgh ijkl mnop` (with spaces)
   - You can remove the spaces when using it
   - ⚠️ You can only see this password once! Save it immediately.

### Step 3: Update .env File
Add these values to your `backend/.env` file:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"        # Your Gmail address
SMTP_PASSWORD="abcdefghijklmnop"        # The 16-character app password (no spaces)
SMTP_FROM="C2E <your-email@gmail.com>"  # Your Gmail address
```

**Example:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="john.doe@gmail.com"
SMTP_PASSWORD="abcd efgh ijkl mnop"
SMTP_FROM="C2E <john.doe@gmail.com>"
```

---

## Option 2: Outlook/Hotmail

### Setup:
1. Use your Outlook/Hotmail email and password
2. Update `.env`:

```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-outlook-password"
SMTP_FROM="C2E <your-email@outlook.com>"
```

---

## Option 3: SendGrid (Free Tier - 100 emails/day)

### Step 1: Sign Up
1. Go to: https://sendgrid.com/
2. Sign up for a free account
3. Verify your email address

### Step 2: Create API Key
1. Go to: Settings → API Keys
2. Click **"Create API Key"**
3. Name it: "C2E Backend"
4. Select **"Full Access"** or **"Restricted Access"** (with Mail Send permissions)
5. Click **"Create & View"**
6. **Copy the API key** (you'll only see it once!)

### Step 3: Update .env
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key-here"
SMTP_FROM="C2E <noreply@yourdomain.com>"
```

---

## Option 4: Mailgun (Free Tier - 5,000 emails/month)

### Step 1: Sign Up
1. Go to: https://www.mailgun.com/
2. Sign up for a free account
3. Verify your email and add a domain (or use sandbox domain for testing)

### Step 2: Get SMTP Credentials
1. Go to: Sending → Domain Settings
2. Find **"SMTP credentials"** section
3. Copy:
   - SMTP hostname
   - SMTP username
   - SMTP password

### Step 3: Update .env
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="your-mailgun-username"
SMTP_PASSWORD="your-mailgun-password"
SMTP_FROM="C2E <noreply@yourdomain.com>"
```

---

## Testing Your SMTP Setup

After updating your `.env` file, test the email functionality:

1. **Start your backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Create a project and send an invite** through the frontend

3. **Check the email inbox** of the invited user

4. **Check backend logs** for any SMTP errors

---

## Troubleshooting

### Gmail: "Username and Password not accepted"
- ✅ Make sure 2FA is enabled
- ✅ Use App Password (not your regular Gmail password)
- ✅ Remove spaces from the app password
- ✅ Make sure you copied the full 16-character password

### "Connection timeout" or "Connection refused"
- ✅ Check your firewall isn't blocking port 587
- ✅ Try port 465 with SSL (requires different config)
- ✅ Verify SMTP_HOST is correct

### "Authentication failed"
- ✅ Double-check SMTP_USER matches your email exactly
- ✅ Verify SMTP_PASSWORD is correct (no extra spaces)
- ✅ For Gmail, make sure you're using App Password, not regular password

### Emails going to spam
- ✅ Add SPF/DKIM records to your domain (for production)
- ✅ Use a proper "From" address
- ✅ For Gmail, emails might go to spam initially

---

## Skip Email for Development (Optional)

If you don't need email invites for development, you can:
- Leave SMTP fields empty in `.env`
- Invites will still work, but no emails will be sent
- You can manually share invite links/tokens

---

## Production Recommendations

For production, use:
- **SendGrid** or **Mailgun** (better deliverability)
- **Custom domain** with proper SPF/DKIM records
- **Dedicated email service** (not personal Gmail)
- **Email templates** for better branding

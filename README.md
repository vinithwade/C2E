# C2E — Creator to Editor

A private, encrypted, role-based video collaboration platform where creators can securely share video files with editors, and editors can open files directly in DaVinci Resolve or Premiere Pro.

## 🎯 Core Features

- **Secure Video Upload**: Direct-to-S3 uploads with signed URLs
- **Role-Based Access**: Creator and Editor roles with granular permissions
- **Editor Invitations**: Email-based invite system with secure tokens
- **Direct Editor Integration**: One-click opening in DaVinci Resolve / Premiere Pro
- **No Public Links**: Private, encrypted storage with access control
- **Authentication**: Email/password + Google OAuth + GitHub OAuth

## 🏗️ Architecture

```
Frontend (Next.js) → Backend API (NestJS) → Storage (AWS S3)
                                    ↓
                          Desktop Connector (Electron)
                                    ↓
                    DaVinci Resolve / Premiere Pro
```

## 📁 Project Structure

```
c2e/
├── backend/              # NestJS API server
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── projects/    # Project management
│   │   ├── files/       # File management
│   │   ├── storage/     # S3 integration
│   │   └── invites/     # Invitation system
│   └── prisma/          # Database schema
├── frontend/            # Next.js 14 web app
│   ├── app/             # App router pages
│   ├── components/      # React components
│   └── lib/             # API client & utilities
└── desktop-connector/   # Electron app for editor integration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (for video storage)
- Redis (optional, for sessions)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run start:dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Create .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Start development server
npm run dev
```

### Desktop Connector Setup

```bash
cd desktop-connector

# Install dependencies
npm install

# Start in development
npm start

# Build for production
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/c2e"
JWT_SECRET="your-secret-key"
REFRESH_TOKEN_SECRET="your-refresh-secret"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET_NAME="c2e-videos"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
FRONTEND_URL="http://localhost:3001"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:3000/api

## 🎬 Workflow

1. **Creator** creates a project and uploads video files
2. **Creator** invites editor by email
3. **Editor** receives email invitation and accepts
4. **Editor** views project files in dashboard
5. **Editor** clicks "Open in Editor" → Desktop connector downloads and opens in DaVinci/Premiere

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Signed S3 URLs with short expiry
- Encrypted storage (AES-256)
- No public links
- Access logging and audit trails

## 🛠️ Tech Stack

- **Backend**: NestJS, PostgreSQL, Prisma, AWS S3, Redis
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Desktop**: Electron
- **Auth**: JWT, Passport.js (Google, GitHub OAuth)

## 📝 Development Phases

### Phase 1 (MVP) ✅
- Authentication
- Projects
- File upload
- Editor invitations
- Desktop connector
- Open in DaVinci/Premiere

### Phase 2 (Future)
- Versioning
- Comments
- Notifications
- Real-time collaboration

### Phase 3 (Future)
- DaVinci plugin
- Enterprise features
- Advanced analytics

## 📄 License

MIT

# Starting the C2E Project

## Quick Start

### 1. Start PostgreSQL Database

**Option A: Using Homebrew (macOS)**
```bash
brew services start postgresql@14
# or
brew services start postgresql
```

**Option B: Manual Start**
```bash
pg_ctl -D /usr/local/var/postgres start
# or check your PostgreSQL installation path
```

**Option C: Using Docker**
```bash
docker run --name c2e-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=c2e \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Create Database and Run Migrations

```bash
cd backend

# Create database (if using default postgres user)
createdb c2e

# Or using psql
psql -U postgres -c "CREATE DATABASE c2e;"

# Run migrations
psql -U postgres -d c2e -f prisma/migrations/init.sql
```

### 3. Start Backend Server

```bash
cd backend
npm run start:dev
```

Backend will run on: http://localhost:3000
API Docs: http://localhost:3000/api

### 4. Start Frontend Server

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3001

## Verify Everything is Running

1. **Backend**: Visit http://localhost:3000/api (should show Swagger docs)
2. **Frontend**: Visit http://localhost:3001 (should show login page)
3. **Database**: Run `psql -U postgres -d c2e -c "\dt"` to see tables

## Troubleshooting

### PostgreSQL Connection Error
- Make sure PostgreSQL is running: `pg_isready`
- Check connection: `psql -U postgres -c "SELECT version();"`
- Verify DATABASE_URL in backend/.env matches your setup

### Port Already in Use
- Backend (3000): Change PORT in backend/.env
- Frontend (3001): Change port in frontend/package.json scripts

### Database Migration Errors
- Drop and recreate: `dropdb c2e && createdb c2e`
- Re-run migrations: `psql -U postgres -d c2e -f prisma/migrations/init.sql`

## Default Credentials

After setup, you can:
1. Register a new account at http://localhost:3001/register
2. Or use the API directly at http://localhost:3000/api

## Next Steps

1. Register as a Creator
2. Create a project
3. Upload video files
4. Invite an editor
5. Test the desktop connector (optional)

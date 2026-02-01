#!/usr/bin/env node

/**
 * C2E Database Setup Script (Node.js version)
 * Creates the PostgreSQL database and runs migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Please set it in your .env file');
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(DATABASE_URL);
const dbName = url.pathname.slice(1).split('?')[0];
const dbHost = url.hostname;
const dbPort = url.port || 5432;
const dbUser = url.username;
const dbPassword = url.password;

console.log('🚀 Setting up C2E Database...\n');
console.log('📊 Database Info:');
console.log(`   Host: ${dbHost}`);
console.log(`   Port: ${dbPort}`);
console.log(`   User: ${dbUser}`);
console.log(`   Database: ${dbName}\n`);

try {
  // Check if database exists
  console.log('🔍 Checking if database exists...');
  try {
    execSync(
      `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -lqt | cut -d \\| -f 1 | grep -qw ${dbName}`,
      { stdio: 'ignore' }
    );
    console.log('✅ Database already exists\n');
  } catch {
    // Database doesn't exist, create it
    console.log(`📦 Creating database '${dbName}'...`);
    execSync(
      `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -c "CREATE DATABASE ${dbName};"`,
      { stdio: 'inherit' }
    );
    console.log('✅ Database created\n');
  }

  // Run migration SQL
  console.log('🔄 Running migrations...');
  const migrationPath = path.join(__dirname, '../prisma/migrations/init.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  execSync(
    `PGPASSWORD="${dbPassword}" psql "${DATABASE_URL}" -f "${migrationPath}"`,
    { stdio: 'inherit' }
  );

  console.log('\n✅ Database setup complete!');
  console.log('\nYou can now start the backend server:');
  console.log('  npm run start:dev\n');
} catch (error) {
  console.error('\n❌ Error setting up database:', error.message);
  process.exit(1);
}

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Usage: npm run migrate:create <migration-name>');
  process.exit(1);
}

const timestamp = Date.now();
const fileName = `${String(timestamp).padStart(13, '0')}_${migrationName}.sql`;
const filePath = join(__dirname, 'migrations', fileName);

const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here

`;

writeFileSync(filePath, template);
console.log(`Created migration: ${fileName}`);


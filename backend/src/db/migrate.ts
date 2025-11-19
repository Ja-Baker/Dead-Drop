import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../config/database';

const runMigrations = async () => {
  try {
    console.log('Running migrations...');
    
    const migrationFile = readFileSync(
      join(__dirname, 'migrations', '001_initial_schema.sql'),
      'utf-8'
    );
    
    await query(migrationFile);
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();


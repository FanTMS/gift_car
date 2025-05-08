import { runMigrations } from '../firebase/migrations';

// This utility can be executed directly to run migrations
// Example: npx ts-node src/utils/runMigrations.ts
const run = async () => {
  try {
    console.log('Starting migration...');
    const result = await runMigrations();
    
    if (result) {
      console.log('Migration completed successfully');
      process.exit(0);
    } else {
      console.error('Migration failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// If this file is run directly via Node.js
if (typeof require !== 'undefined' && require.main === module) {
  run();
}

export default run; 
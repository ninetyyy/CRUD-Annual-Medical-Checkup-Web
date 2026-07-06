require('dotenv').config();
const { Client } = require('pg');
const readline = require('readline');

// ─────────────────────────────────────────────────────────────────────────────
// clear-db.js
// Permanently deletes ALL records from public.medical_checkup.
// The table structure (schema) is preserved.
//
// Usage:
//   node clear-db.js          → prompts for confirmation
//   node clear-db.js --force  → skips confirmation (use with caution!)
// ─────────────────────────────────────────────────────────────────────────────

const FORCE = process.argv.includes('--force');

async function clearDatabase() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database.');

    // Count existing rows so the user knows what will be deleted
    const countResult = await client.query('SELECT COUNT(*) FROM public.medical_checkup');
    const rowCount = parseInt(countResult.rows[0].count, 10);

    if (rowCount === 0) {
      console.log('ℹ️  Table is already empty. Nothing to delete.');
      return;
    }

    console.log(`⚠️  WARNING: This will permanently delete ${rowCount} record(s) from public.medical_checkup.`);

    if (!FORCE) {
      const confirmed = await askConfirmation(
        '   Are you sure you want to continue? Type "yes" to confirm: '
      );
      if (!confirmed) {
        console.log('❌ Operation cancelled. No data was deleted.');
        return;
      }
    }

    // TRUNCATE removes all rows and resets the auto-increment sequence
    await client.query('TRUNCATE TABLE public.medical_checkup RESTART IDENTITY CASCADE');
    console.log(`🗑️  Successfully deleted all ${rowCount} record(s). The table is now empty.`);

  } catch (err) {
    console.error('❌ Error clearing the database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

/**
 * Prompts the user for a yes/no confirmation in the terminal.
 * @param {string} question
 * @returns {Promise<boolean>} true if the user typed "yes"
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

clearDatabase();

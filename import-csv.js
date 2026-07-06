require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─────────────────────────────────────────────────────────────────────────────
// import-csv.js
// Imports records from medical_records.csv into public.medical_checkup.
//
// CSV column order (36 columns, no header row):
//   id, year, first_name, last_name, gender, weight, height,
//   sugar, bun, creatinine, egrf, cholesterol, triglycerides,
//   uric_acid, total_protein, albumin, hdl_c, ldl_c, alk_phos,
//   sgot, sgpt, hbs_ag, wbc, rbc_m, hgb_m, hct_m, platelets,
//   neu, lymp, mono, eos, baso, specific_gravity, ph,
//   urine_exam, chest_x_ray
//
// "\N" values are treated as NULL.
//
// Usage:
//   node import-csv.js                           → uses medical_records.csv in the same dir
//   node import-csv.js path/to/other_file.csv   → uses a custom file path
// ─────────────────────────────────────────────────────────────────────────────

const CSV_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'medical_records.csv');

// Column names in the exact order they appear in the CSV
const COLUMNS = [
  'id', 'year', 'first_name', 'last_name', 'gender', 'weight', 'height',
  'sugar', 'bun', 'creatinine', 'egrf', 'cholesterol', 'triglycerides',
  'uric_acid', 'total_protein', 'albumin', 'hdl_c', 'ldl_c', 'alk_phos',
  'sgot', 'sgpt', 'hbs_ag', 'wbc', 'rbc_m', 'hgb_m', 'hct_m', 'platelets',
  'neu', 'lymp', 'mono', 'eos', 'baso', 'specific_gravity', 'ph',
  'urine_exam', 'chest_x_ray',
];

// Columns that should stay as text (VARCHAR); everything else → numeric
const TEXT_COLUMNS = new Set(['first_name', 'last_name', 'gender', 'hbs_ag', 'urine_exam', 'chest_x_ray']);

/**
 * Parse a raw CSV value:
 *   - "\N"  → null  (PostgreSQL-style NULL)
 *   - ""    → null
 *   - text columns → keep as string
 *   - numeric columns → cast to Number (NaN becomes null)
 */
function parseValue(raw, colName) {
  const trimmed = raw.trim();
  if (trimmed === '\\N' || trimmed === '') return null;
  if (TEXT_COLUMNS.has(colName)) return trimmed;
  const num = Number(trimmed);
  return isNaN(num) ? null : num;
}

/**
 * Read and parse the CSV file.
 * Returns an array of row-objects keyed by column name.
 */
function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = [];

  for (const line of content.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // skip blank lines

    const values = trimmedLine.split(',');
    if (values.length !== COLUMNS.length) {
      console.warn(`⚠️  Skipping malformed row (expected ${COLUMNS.length} columns, got ${values.length}): ${trimmedLine}`);
      continue;
    }

    const row = {};
    COLUMNS.forEach((col, i) => {
      row[col] = parseValue(values[i], col);
    });
    rows.push(row);
  }

  return rows;
}

async function importCsv() {
  // ── Validate CSV file exists ──────────────────────────────────────────────
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found: ${CSV_PATH}`);
    process.exit(1);
  }

  console.log(`📄 Reading CSV: ${CSV_PATH}`);
  const rows = parseCsv(CSV_PATH);

  if (rows.length === 0) {
    console.log('ℹ️  No valid rows found in the CSV. Nothing to import.');
    return;
  }

  console.log(`📊 Found ${rows.length} record(s) to import.`);

  // ── Connect ───────────────────────────────────────────────────────────────
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await client.connect();
  console.log('✅ Connected to PostgreSQL database.');

  // ── Build INSERT query (all columns except id uses CSV value) ─────────────
  // We use ON CONFLICT (id) DO UPDATE so re-running the script is safe.
  const colList = COLUMNS.join(', ');
  const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(', ');
  const updateSet = COLUMNS
    .filter(c => c !== 'id')
    .map(c => `${c} = EXCLUDED.${c}`)
    .join(', ');

  const query = `
    INSERT INTO public.medical_checkup (${colList})
    VALUES (${placeholders})
    ON CONFLICT (id) DO UPDATE SET ${updateSet}
  `;

  // ── Insert rows ───────────────────────────────────────────────────────────
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    const values = COLUMNS.map(col => row[col]);
    try {
      const result = await client.query(query, values);
      // rowCount = 1 for INSERT, 1 for UPDATE
      // command tag tells us: "INSERT 0 1" or "UPDATE 1"
      if (result.command === 'INSERT') inserted++;
      else updated++;
    } catch (err) {
      console.error(`❌ Failed to insert row id=${row.id}: ${err.message}`);
      failed++;
    }
  }

  await client.end();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n─── Import Summary ───────────────────────────────');
  console.log(`  ✅ Inserted (new):  ${inserted}`);
  console.log(`  🔄 Updated (exist): ${updated}`);
  console.log(`  ❌ Failed:          ${failed}`);
  console.log(`  📦 Total processed: ${rows.length}`);
  console.log('──────────────────────────────────────────────────');
  console.log('🔌 Database connection closed.');
}

importCsv().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});

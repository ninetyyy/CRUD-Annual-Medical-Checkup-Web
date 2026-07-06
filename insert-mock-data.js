require('dotenv').config();
const { Client } = require('pg');

async function insertMockData() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database for mock insertion');

    // Clear old data to start fresh (optional but helpful for testing)
    await client.query('TRUNCATE TABLE public.medical_checkup RESTART IDENTITY CASCADE');
    console.log('Cleared existing records from public.medical_checkup');

    const query = `
      INSERT INTO public.medical_checkup (
        year, first_name, last_name, gender, weight, height,
        sugar, bun, creatinine, egrf, cholesterol, triglycerides,
        uric_acid, total_protein, albumin, hdl_c, ldl_c, alk_phos,
        sgot, sgpt, hbs_ag, wbc, rbc_m, hgb_m, hct_m, platelets,
        neu, lymp, mono, eos, baso, specific_gravity, ph,
        urine_exam, chest_x_ray
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
    `;

    // 1. All Normal Patient (Male)
    const normalPatient = [
      2026, 'Normal', 'Patient', 'Male', 65.0, 175.0, // Weight 65, Height 175 -> BMI 21.2 (Normal)
      85.0,   // Sugar (Normal 70-99)
      12.0,   // BUN (Normal 7-20)
      0.9,    // Creatinine (Normal Male 0.73-1.18)
      95.0,   // eGFR (Normal >= 90)
      180.0,  // Cholesterol (Normal < 200)
      120.0,  // Triglycerides (Normal < 150)
      50.0,   // HDL-C (Normal Male >= 40)
      100.0,  // LDL-C (Normal < 130)
      5.5,    // Uric Acid (Normal Male 3.5-7.2)
      7.2,    // Total Protein (Normal 6.0-8.3)
      4.2,    // Albumin (Normal 3.5-5.0)
      75.0,   // Alk Phos (Normal 30-120)
      25.0,   // SGOT (Normal 10-40)
      30.0,   // SGPT (Normal Male 10-50)
      'Negative', // HBs Ag (Normal)
      6.5,    // WBC (Normal 4.0-10.0)
      5.0,    // RBC (Normal Male 4.5-5.9)
      15.0,   // HGB (Normal Male 13.5-17.5)
      44.0,   // HCT (Normal Male 39-49)
      250.0,  // Platelets (Normal 150-450)
      55.0,   // NEU (Normal 40-70)
      30.0,   // LYMP (Normal 20-45)
      5.0,    // MONO (Normal 2-10)
      3.0,    // EOS (Normal 1-6)
      1.0,    // BASO (Normal 0-2)
      1.015,  // Specific Gravity (Normal 1.003-1.030)
      6.0,    // pH (Normal 4.6-8.0)
      'Normal', // Urine Exam
      'Normal'  // Chest X-Ray
    ];

    // 2. All Low/Under-range Patient (Female)
    const lowPatient = [
      2026, 'Low', 'Patient', 'Female', 45.0, 165.0, // Weight 45, Height 165 -> BMI 16.5 (Low / Underweight)
      65.0,   // Sugar (Low < 70)
      5.0,    // BUN (Low < 7)
      0.4,    // Creatinine (Low Female < 0.5)
      110.0,  // eGFR (Normal >= 90)
      120.0,  // Cholesterol (Normal < 200)
      90.0,   // Triglycerides (Normal < 150)
      40.0,   // HDL-C (Low Female < 50)
      70.0,   // LDL-C (Normal < 130)
      1.8,    // Uric Acid (Low Female < 2.4)
      5.5,    // Total Protein (Low < 6.0)
      3.0,    // Albumin (Low < 3.5)
      25.0,   // Alk Phos (Low < 30)
      8.0,    // SGOT (Low < 10)
      8.0,    // SGPT (Low Female < 10)
      'Negative', // HBs Ag (Normal)
      3.2,    // WBC (Low < 4.0)
      3.5,    // RBC (Low Female < 4.0)
      10.5,   // HGB (Low Female < 12.0)
      32.0,   // HCT (Low Female < 35)
      120.0,  // Platelets (Low < 150)
      35.0,   // NEU (Low < 40)
      15.0,   // LYMP (Low < 20)
      1.0,    // MONO (Low < 2)
      0.5,    // EOS (Low < 1)
      0.0,    // BASO (Normal 0-2)
      1.001,  // Specific Gravity (Low < 1.003)
      4.0,    // pH (Low < 4.6)
      'Normal', // Urine Exam
      'Normal'  // Chest X-Ray
    ];

    // 3. All High/Obese/Abnormal Patient (Male)
    const highPatient = [
      2026, 'High', 'Patient', 'Male', 90.0, 170.0, // Weight 90, Height 170 -> BMI 31.1 (Obese / High)
      125.0,  // Sugar (High > 99)
      25.0,   // BUN (High > 20)
      1.5,    // Creatinine (High Male > 1.18)
      55.0,   // eGFR (Low < 90)
      240.0,  // Cholesterol (High > 200)
      210.0,  // Triglycerides (High > 150)
      35.0,   // HDL-C (Low Male < 40)
      160.0,  // LDL-C (High > 130)
      8.5,    // Uric Acid (High Male > 7.2)
      9.0,    // Total Protein (High > 8.3)
      5.5,    // Albumin (High > 5.0)
      150.0,  // Alk Phos (High > 120)
      55.0,   // SGOT (High > 40)
      60.0,   // SGPT (High Male > 50)
      'Positive', // HBs Ag (Abnormal)
      12.5,   // WBC (High > 10.0)
      6.2,    // RBC (High Male > 5.9)
      18.5,   // HGB (High Male > 17.5)
      52.0,   // HCT (High Male > 49)
      500.0,  // Platelets (High > 450)
      75.0,   // NEU (High > 70)
      50.0,   // LYMP (High > 45)
      12.0,   // MONO (High > 10)
      8.0,    // EOS (High > 6)
      3.0,    // BASO (High > 2)
      1.035,  // Specific Gravity (High > 1.030)
      8.5,    // pH (High > 8.0)
      'Abnormal', // Urine Exam (Abnormal)
      'Abnormal'  // Chest X-Ray (Abnormal)
    ];

    // 4. Overweight Boundary Patient (Female) - to test the BMI warning badge
    const warningPatient = [
      2026, 'Warning', 'Patient', 'Female', 66.0, 165.0, // Weight 66, Height 165 -> BMI 24.2 (Overweight / Warning)
      88.0, 12.0, 0.7, 98.0, 190.0, 110.0, 48.0, 115.0, 4.5,
      7.0, 4.0, 70.0, 20.0, 22.0, 'Negative', 6.0, 4.5, 13.5, 38.0,
      300.0, 52.0, 35.0, 6.0, 4.0, 1.0, 1.018, 5.8, 'Normal', 'Normal'
    ];

    await client.query(query, normalPatient);
    await client.query(query, lowPatient);
    await client.query(query, highPatient);
    await client.query(query, warningPatient);

    console.log('Successfully inserted 4 medical test records:');
    console.log('1. Normal Patient (Male, BMI Normal)');
    console.log('2. Low/Under-range Patient (Female, BMI Underweight)');
    console.log('3. High/Obese/Abnormal Patient (Male, BMI Obese)');
    console.log('4. Warning Patient (Female, BMI Overweight)');
  } catch (err) {
    console.error('Error inserting mock data:', err);
  } finally {
    await client.end();
  }
}

insertMockData();

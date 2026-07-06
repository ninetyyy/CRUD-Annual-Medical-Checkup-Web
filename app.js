require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Medical Storage"');
    return res.status(401).send('Authentication required.');
  }
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];
  if (user === (process.env.ADMIN_USER || 'admin') && pass === (process.env.ADMIN_PASS || 'admin1234')) {
    return next();
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="Secure Medical Storage"');
  return res.status(401).send('Authentication failed.');
};

app.use(basicAuth);

// Serve static files (frontend) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// GET: Fetch all medical checkups
app.get('/api/checkups', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.medical_checkup ORDER BY year DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST: Save a new medical checkup
app.post('/api/checkups', async (req, res) => {
  const {
    year, first_name, last_name, gender, weight, height,
    sugar, bun, creatinine, egrf, cholesterol, triglycerides,
    uric_acid, total_protein, albumin, hdl_c, ldl_c, alk_phos,
    sgot, sgpt, hbs_ag, wbc, rbc_m, hgb_m, hct_m, platelets,
    neu, lymp, mono, eos, baso, specific_gravity, ph,
    urine_exam, chest_x_ray
  } = req.body;

  try {
    const query = `
      INSERT INTO public.medical_checkup (
        year, first_name, last_name, gender, weight, height,
        sugar, bun, creatinine, egrf, cholesterol, triglycerides,
        uric_acid, total_protein, albumin, hdl_c, ldl_c, alk_phos,
        sgot, sgpt, hbs_ag, wbc, rbc_m, hgb_m, hct_m, platelets,
        neu, lymp, mono, eos, baso, specific_gravity, ph,
        urine_exam, chest_x_ray
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35
      )
      RETURNING *
    `;
    const values = [
      year, first_name, last_name, gender, weight, height,
      sugar, bun, creatinine, egrf, cholesterol, triglycerides,
      uric_acid, total_protein, albumin, hdl_c, ldl_c, alk_phos,
      sgot, sgpt, hbs_ag, wbc, rbc_m, hgb_m, hct_m, platelets,
      neu, lymp, mono, eos, baso, specific_gravity, ph,
      urine_exam, chest_x_ray
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE: Remove a medical checkup
app.delete('/api/checkups/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.medical_checkup WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

# 🩸 Medical Checkup & Blood Result Storage System

A modern Node.js (Express) and PostgreSQL web application for recording, viewing, and comparing medical checkup and blood test results over time.

Designed with specialized healthy reference ranges for **Asian/Thai clinical populations**, dynamic BMI calculations, and a secure basic authentication layer.

---

## 🛠️ Features

- **🔒 Secure Basic Authentication** — Access is protected with configurable credentials via `.env`.
- **📂 Structured Codebase** — Frontend split into dedicated `index.html`, `style.css`, and `script.js` served statically from the `public/` directory.
- **📊 Dynamic Transposed Medical Chart**
  - Compare test results chronologically side-by-side.
  - Clinical parameters are aligned **vertically (rows)**; checkup events are **columns**.
  - First column (parameter labels) is **sticky** on horizontal scroll.
  - Divided into logical clinical panels: Blood Chemistry, Lipid Profile, Liver, CBC, Urine/Imaging.
- **🔍 Real-time Name Filter** — Instantly filter the Historical Records table by patient first name (case-insensitive, no page reload).
- **🟢 Healthy Reference Ranges (Thai/Asian Standards)** — Colors anomalies with badges:
  - 🟢 **Green**: Within normal limits
  - 🔵 **Blue**: Below healthy range (Low)
  - 🔴 **Red**: Above healthy range (High) / Abnormal positive (HBs Ag, Urine Exam, X-Ray)
  - 🟡 **Yellow**: Borderline / Warning zone
- **⚖️ Automatic BMI Calculation (WHO Asian Criteria)** — Live BMI updates in the form and history; classifies into *Underweight (<18.5)*, *Normal (18.5–22.9)*, *Overweight (23.0–24.9)*, and *Obese (≥25.0)*.
- **📱 Fully Mobile Responsive** — Transitions from desktop comparison table to stacked clinical cards on screens <992px.
- **📦 Database Auto-Initialization** — PostgreSQL table schema initializes automatically on first Docker startup via `init.sql`.

---

## 🚀 Setup & Run

### 1. Requirements
- Node.js (v16+)
- Docker & Docker Desktop

### 2. Configure Environment (`.env`)
Create or verify your `.env` file in the project root:
```env
DB_USER=blood_user
DB_HOST=localhost
DB_NAME=blood_db
DB_PASSWORD=blood_password
DB_PORT=5433
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=admin1234
```

### 3. Start PostgreSQL via Docker
```bash
docker-compose up -d
```
*(Boots the DB container and auto-executes `init.sql` to create the table schema.)*

### 4. Install Dependencies
```bash
npm install
```

### 5. Start the Web Server
```bash
npm start
```
*(On Windows, if you hit execution policy errors run: `node app.js`)*

### 6. Open the Application
Navigate to **[http://localhost:3000](http://localhost:3000)** and sign in with:
- **Username**: `admin` (or your configured `ADMIN_USER`)
- **Password**: `admin1234` (or your configured `ADMIN_PASS`)

---

## 🗄️ Database Utilities

All utilities read credentials from `.env` automatically.

### Import from CSV (`import-csv.js`)
Import records from a `.csv` file directly into the database.

```bash
npm run import-csv                       # imports medical_records.csv in project root
node import-csv.js path/to/other.csv    # import from a custom file path
```

**CSV Format:**
- **No header row** — 36 columns in schema order (see table below).
- Use `\N` for `NULL` values.
- Safe to re-run — uses `ON CONFLICT (id) DO UPDATE` (upsert), so existing records are updated, not duplicated.

<details>
<summary>CSV column order (click to expand)</summary>

```
id, year, first_name, last_name, gender, weight, height,
sugar, bun, creatinine, egrf, cholesterol, triglycerides,
uric_acid, total_protein, albumin, hdl_c, ldl_c, alk_phos,
sgot, sgpt, hbs_ag, wbc, rbc_m, hgb_m, hct_m, platelets,
neu, lymp, mono, eos, baso, specific_gravity, ph,
urine_exam, chest_x_ray
```
</details>

---

### Clear All Records (`clear-db.js`)
Permanently deletes **all rows** from `public.medical_checkup` and resets the ID sequence.

```bash
npm run clear-db          # shows row count → asks "yes" confirmation → truncates
npm run clear-db:force    # skips confirmation (useful for scripting/automation)
```

> ⚠️ **This is irreversible.** Re-populate with `npm run mock-data` or `npm run import-csv` afterward.

---

### Insert Mock Test Data (`insert-mock-data.js`)
Clears the database and inserts 4 synthetic patients covering every clinical state (Low, Normal, Warning, High):

```bash
npm run mock-data
```

---

## 📋 NPM Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node app.js` | Start the Express web server |
| `init-db` | `node init-db.js` | Manually create the DB table schema |
| `import-csv` | `node import-csv.js` | Import records from `medical_records.csv` |
| `mock-data` | `node insert-mock-data.js` | Populate with synthetic test records |
| `clear-db` | `node clear-db.js` | Clear all records (with confirmation prompt) |
| `clear-db:force` | `node clear-db.js --force` | Clear all records (no confirmation) |

---

## 📁 Project Structure

```
├── public/                   # Static frontend assets
│   ├── index.html            # App structure, forms, and table markup
│   ├── style.css             # Grid layouts, dark theme, badges, responsive cards
│   └── script.js             # Clinical range dictionary, BMI logic, DOM renderer
├── app.js                    # Express backend with Basic Auth middleware
├── docker-compose.yml        # PostgreSQL container configuration
├── init.sql                  # Database table schema (auto-run by Docker)
├── import-csv.js             # CSV → database import utility (upsert-safe)
├── clear-db.js               # Utility to truncate all records with confirmation
├── insert-mock-data.js       # Synthetic test records for all clinical states
├── medical_records.csv       # Real checkup records (personal data)
├── init-db.js                # Manual DB schema initializer (alternative to Docker)
└── package.json              # Node project config and npm scripts
```

---

## 🩺 Clinical Reference Ranges (Thai/Asian Standards)

| Panel | Metric | Normal Range |
|-------|--------|-------------|
| Blood Chemistry | Sugar | 70–100 mg/dL |
| | BUN | 7–20 mg/dL |
| | Creatinine | 0.6–1.1 mg/dL |
| | eGFR | ≥60 mL/min/1.73m² |
| Lipid Profile | Cholesterol | <200 mg/dL |
| | Triglycerides | <150 mg/dL |
| | HDL-C | >40 mg/dL |
| | LDL-C | <130 mg/dL |
| Liver | ALK Phos | 30–120 U/L |
| | SGOT (AST) | 5–40 U/L |
| | SGPT (ALT) | 5–40 U/L |
| CBC | WBC | 4,500–11,000 /μL |
| | Hemoglobin | 12–17.5 g/dL |
| | Platelets | 150,000–400,000 /μL |
| BMI (WHO Asian) | Normal | 18.5–22.9 |
| | Overweight | 23.0–24.9 |
| | Obese | ≥25.0 |
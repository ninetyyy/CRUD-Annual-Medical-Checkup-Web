# 🩸 Medical Checkup & Blood Result Storage System

A modern Node.js (Express) and PostgreSQL web application for recording, viewing, and comparing medical checkup and blood test results over time.
Designed with specialized healthy reference ranges for Asian/Thai clinical populations, dynamic BMI calculations, and a secure basic authentication layer.

✨ Now Fully Containerized!
Run the entire application (Web Server + Database) with a single command using Docker Compose.

---

## 🛠️ Features

- **🔒 Secure Basic Authentication**— Access is protected with configurable credentials via `.env.`
- **📂 Structured Codebase** — Frontend split into dedicated `index.html`, `style.css`, and `script.js` served statically from the public/ directory.
- **📊 Dynamic Transposed Medical Chart**
Compare test results chronologically side-by-side.
Clinical parameters are aligned vertically (rows); checkup events are columns.
First column (parameter labels) is sticky on horizontal scroll.
Divided into logical clinical panels: Blood Chemistry, Lipid Profile, Liver, CBC, Urine/Imaging.
- **🔍 Real-time Name Filter** — Instantly filter the Historical Records table by patient first name (case-insensitive, no page reload).
- **✏️ Edit Medical Records** — Click "Edit" on any record to open a centered modal dialog with all fields pre-populated. Modify any value and save to update the database. Changes are reflected immediately in the table.
- **🟢 Healthy Reference Ranges (Thai/Asian Standards)** — Colors anomalies with badges:
- **🟢 Green**: Within normal limits
- **🔵 Blue**: Below healthy range (Low)
- **🔴 Red**: Above healthy range (High) / Abnormal positive (HBs Ag, Urine Exam, X-Ray)
- **🟡 Yellow**: Borderline / Warning zone
- **⚖️ Automatic BMI Calculation (WHO Asian Criteria)** — Live BMI updates in the form and history; classifies into Underweight (<18.5), Normal (18.5–22.9), Overweight (23.0–24.9), and Obese (≥25.0).
- **📱 Fully Mobile Responsive** — Transitions from desktop comparison table to stacked clinical cards on screens <992px.
- **📦 Database Auto-Initialization** — PostgreSQL table schema initializes automatically on first Docker startup via `init.sql`.

---

## 🚀 Setup & Run
This is the recommended way to run the application. It ensures a consistent environment across all machines.

### 1. Requirements
- Docker & Docker Desktop installed on your machine.
- (Node.js is no longer required on the host machine as it runs inside the container)

### 2. Configure Environment (`.env`)
Create or verify your .env file in the project root. Note that DB_HOST must be set to db to communicate with the PostgreSQL container.
```env
DB_USER=blood_user
DB_HOST=db              # <--- Crucial: Use 'db' service name, not localhost
DB_NAME=blood_db
DB_PASSWORD=blood_password
DB_PORT=5432            # <--- Internal container port
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=admin1234
```

### 3. Build and Start All Services
Run the following command in your terminal. This will:

Build the Node.js application image using the Dockerfile.
Start the PostgreSQL database container.
Start the Web Server container connected to the database.

```bash
docker-compose up --build -d
```
(The --build flag ensures any changes to your code or Dockerfile are included. The -d flag runs it in detached mode.)
*(Boots the DB container and auto-executes `init.sql` to create the table schema.)*

### 4. Open the Application
Navigate to http://localhost:3000 and sign in with:

Username: admin (or your configured ADMIN_USER)
Password: admin1234 (or your configured ADMIN_PASS)

### 5. Stopping the Application
To stop and remove the containers (data is preserved in volumes):
```bash
docker-compose down
```

---

## 🗄️ Database Utilities(Inside Container)
If you need to run database utilities, you can execute commands inside the running web container.

Access the Container
```bash
docker exec -it <container_name> sh
# Example: docker exec -it blood_result_storage_web_1 sh
```

### Import from CSV (`import-csv.js`)
Once inside the container (or by running docker exec):

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
node clear-db.js          # Same as npm run clear-db
node clear-db.js --force  # Same as npm run clear-db:force
```

> ⚠️ **This is irreversible.** Re-populate with `npm run mock-data` or `npm run import-csv` afterward.

---

### Insert Mock Test Data (`insert-mock-data.js`)
Clears the database and inserts 4 synthetic patients covering every clinical state (Low, Normal, Warning, High):

```bash
npm run insert-mock-data
node insert-mock-data.js
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
├── docker-compose.yml        # Docker Compose configuration (Web + DB)
├── Dockerfile                # Instructions to build the Node.js application image
├── init.sql                  # Database table schema (auto-run by Docker)
├── import-csv.js             # CSV → database import utility
├── clear-db.js               # Utility to truncate all records
├── insert-mock-data.js       # Synthetic test records generator
├── medical_records.csv       # Sample checkup records
├── init-db.js                # Manual DB schema initializer
├── .env                      # Environment variables (DB credentials, etc.)
└── package.json              # Node project config and npm scripts
```

---

## 🩺 Clinical Reference Ranges (Thai/Asian Standards)

| Panel | Metric | Normal Range |
|-------|--------|-------------|
| Blood Chemistry | Sugar | 70–99 mg/dL |
| | BUN | 8.9–20.6 mg/dL |
| | Creatinine | 0.73–1.18 mg/dL |
| | eGFR | ≥90 mL/min/1.73m² |
| Lipid Profile | Cholesterol | <200 mg/dL |
| | Triglycerides | <150 mg/dL |
| | HDL-C | >40 mg/dL |
| | LDL-C | <130 mg/dL |
| Liver | ALK Phos | 40–150 U/L |
| | SGOT (AST) | 5–34 U/L |
| | SGPT (ALT) | 0–45 U/L |
| CBC | WBC | 4–10 10^3/μL |
| | RBC | 4.5–5.9 10^6/μL |
| | Hemoglobin | 13–18 g/dL |
| | Platelets | 150,000–450,000 /μL |
| BMI (WHO Asian) | Normal | 18.5–22.9 |
| | Overweight | 23.0–24.9 |
| | Obese | ≥25.0 |
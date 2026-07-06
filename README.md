# 🩸 Medical Checkup & Blood Result Storage System

A modern Node.js (Express) and PostgreSQL web application for recording, viewing, and comparing medical checkup and blood test results over time.

Designed with specialized healthy reference ranges for **Asian/Thai clinical populations**, dynamic BMI calculations, and a secure basic authentication layer.

---

## 🛠️ Features

*   **🔒 Secure Basic Authentication**: Access to the app is secured with basic credentials checkable via environmental settings.
*   **📂 Structured Codebase**: Refactored frontend split into dedicated `index.html`, `style.css`, and `script.js` files served statically.
*   **📊 Dynamic Transposed Medical Chart**:
    *   Compare test results chronologically side-by-side.
    *   Clinical parameters are aligned vertically (rows), and checkup events are columns.
    *   The first column containing parameter labels is **sticky** on horizontal scroll.
    *   Divided into logical clinical panels (Blood Chemistry, Lipid Profile, Liver, CBC, Urine/Imaging).
*   **🟢 Healthy Reference Ranges (Thai/Asian Standards)**: Colors anomalies using badges:
    *   **Green**: Within normal limits.
    *   **Blue**: Below healthy range (Low).
    *   **Red**: Above healthy range (High) / Abnormal positive readings (HBs Ag, Urine Exam, X-Ray).
*   **⚖️ Automatic BMI Calculation (WHO Asian Criteria)**:
    *   Dynamic on-the-fly BMI updates in the data entry form and history list.
    *   Classifies into *Underweight (<18.5)*, *Normal (18.5-22.9)*, *Overweight (23.0-24.9)*, and *Obese (>=25.0)* with distinct badge colors.
*   **📱 Fully Mobile Responsive**: Automatically transitions from the transposed desktop comparison table to clean, stacked clinical cards on smaller screens (<992px).
*   **📦 Database Auto-Initialization**: PostgreSQL tables initialize automatically on first startup via Docker initialization volumes.

---

## 🚀 How to Setup and Run

### 1. Requirements
*   Node.js (v16+)
*   Docker & Docker Desktop

### 2. Configure Environments (`.env`)
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

### 3. Spin Up PostgreSQL database
Start the database container using Docker Compose:
```bash
docker-compose up -d
```
*(This automatically boots the DB and executes `init.sql` to initialize the table schema).*

### 4. Populate Testing Mock Data (Optional)
Run the utility script to clean the database and populate 4 medical records testing all range limits (low, normal, high, warning):
```bash
node insert-mock-data.js
```

### 5. Start the Web Server
Install dependencies and run:
```bash
npm install
npm start
```
*(If you encounter execution policy errors on Windows, run: `node app.js`)*

### 6. Open the Application
Navigate to **[http://localhost:3000](http://localhost:3000)** and sign in with:
*   **Username**: `admin` (or your configured `ADMIN_USER`)
*   **Password**: `admin1234` (or your configured `ADMIN_PASS`)

---

## 📁 Project Structure

```
├── public/                 # Static frontend assets
│   ├── index.html          # Clean structure, forms, and tables
│   ├── style.css           # Grid layouts, dark/light themes, badges, responsive cards
│   └── script.js           # clinical range dictionary, BMI math, DOM populator
├── app.js                  # Express backend server with Basic Auth middleware
├── docker-compose.yml      # DB container mapping
├── init.sql                # Initial schema
├── insert-mock-data.js     # Mock clinical records insertion script
├── init-db.js              # Manual DB schema initializer (alternative)
└── package.json            # Node project configuration
```
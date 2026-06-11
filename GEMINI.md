# 🩸 Blood & Medical Result Storage System Builder via Gemini CLI

ไฟล์นี้รวมคำสั่ง **Gemini CLI Prompt** เวอร์ชันอัปเดตตามตารางฐานข้อมูลจริง `public.medical_checkup` สำหรับให้คุณคัดลอกไปรันใน Terminal เพื่อสั่งให้ Gemini ช่วยเจนโค้ดเว็บเซิร์ฟเวอร์และหน้าบ้าน (Frontend) สำหรับบันทึกผลตรวจร่างกายได้อย่างสมบูรณ์

## 🛠️ ขั้นตอนการเตรียมตัวก่อนรัน Prompt

1. **เตรียมสภาพแวดล้อม:** ติดตั้ง Node.js หรือ Python และ Docker (สำหรับรัน PostgreSQL) ให้เรียบร้อย
2. **ตั้งค่า Gemini CLI:** ตรวจสอบว่าได้ผูก API Key และเรียกใช้งานคำสั่ง `gemini` ใน Terminal ได้แล้ว
3. **สร้างโฟลเดอร์โปรเจกต์:** ```bash
   mkdir medical-checkup-app && cd medical-checkup-app

## 🚀 Prompt 1: ให้ Gemini เจนโครงสร้างโปรเจกต์และโค้ดทั้งหมด

ก๊อปปี้คำสั่งด้านล่างนี้ทั้งหมด แล้วไปวางใน Terminal ของคุณเพื่อสั่งรันผ่าน Gemini CLI ได้เลย:

```bash
gemini "I want to build a simple Medical Checkup and Blood Result Storage web server using Node.js (Express) and PostgreSQL. 

Please provide the full source code and setup steps in a single response, based EXACTLY on this PostgreSQL table schema:

CREATE TABLE public.medical_checkup (
    id bigint NOT NULL,
    year integer,
    first_name character varying(50),
    last_name character varying(50),
    gender character varying(15),
    weight double precision,
    height double precision,
    sugar double precision,
    bun double precision,
    creatinine double precision,
    egrf double precision,
    cholesterol double precision,
    triglycerides double precision,
    uric_acid double precision,
    total_protein double precision,
    albumin double precision,
    hdl_c double precision,
    ldl_c double precision,
    alk_phos double precision,
    sgot double precision,
    sgpt double precision,
    hbs_ag character varying(20),
    wbc double precision,
    rbc_m double precision,
    hgb_m double precision,
    hct_m double precision,
    platelets double precision,
    neu double precision,
    lymp double precision,
    mono double precision,
    eos double precision,
    baso double precision,
    specific_gravity double precision,
    ph double precision,
    urine_exam character varying(20),
    chest_x_ray character varying(20)
);

Requirements:
1. Provide a 'docker-compose.yml' to spin up a local PostgreSQL container and include the initialization SQL script to create this table (make sure 'id' handles auto-increment or serial behavior properly if needed, or ask for it in the form).
2. Provide a 'package.json' with express, pg, and dotenv.
3. Provide an 'app.js' with:
   - Database connection setup.
   - POST '/api/checkups' to insert all these fields into the database.
   - GET '/api/checkups' to retrieve all records.
4. A clean, responsive HTML frontend served at '/' that contains a user-friendly form with fields grouping (e.g., Personal Info, Blood Panels, Urine Exam) to input ALL these metrics, and a clean table/dashboard below it to view the historical results.

Keep the code clean, well-commented, and suitable for a beginner."
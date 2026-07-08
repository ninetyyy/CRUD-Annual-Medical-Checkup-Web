# 1. เลือก Base Image ที่เสถียรและเล็ก (เช่น Alpine)
FROM node:18-alpine

# 2. สร้างไดเรกทอรีทำงานใน Container
WORKDIR /app

# 3. คัดลอกไฟล์ package.json และ package-lock.json ก่อน
# การทำขั้นตอนนี้ช่วยให้ Docker Cache layer ของ npm install ได้ดี
COPY package*.json ./

# 4. ติดตั้ง Dependencies
RUN npm install --production

# 5. คัดลอกโค้ดทั้งหมดของแอปพลิเคชัน
COPY . .

# 6. ระบุพอร์ตที่แอปใช้งาน (ตาม .env ที่ระบุ PORT=3000)
EXPOSE 3000

# 7. คำสั่งรันแอปพลิเคชัน
CMD ["node", "app.js"]
# Workspace Guidelines & Instructions

## Strict Policy: ห้ามทำ Mockup เด็ดขาด (Zero Mockup Policy)

1. **ห้ามทำ Mockup หรือ Hardcoded Dummy Data**:
   - ห้ามสร้างหน้าจอจำลอง (Mockup), ข้อมูลหลอก (`const mockData = [...]`), หรือ Fake Data Layer
   - ห้ามสร้างปุ่มหรือแบบฟอร์มที่ไม่มีการทำงานจริง (เช่น ทำแค่ `alert()` หรือ `console.log()`)
   - ทุกปุ่ม, ฟอร์ม, และอินพุต ต้องเชื่อมต่อกับ State จริง และยิงคำขอไปยัง Backend / Database จริง

2. **ระบบ Persistence และ Database จริงเท่านั้น**:
   - หากหน้าจอต้องแสดงหรือบันทึกข้อมูล ต้องต่อเข้ากับตารางฐานข้อมูลจริง (PostgreSQL / Neon / Supabase ฯลฯ)
   - หากยังไม่มีตาราง ให้สร้าง Schema และ Migration ในฐานข้อมูลจริงก่อน ไม่ใช้ In-memory object หรือ Mock JSON ทดแทน

3. **API และ Server Actions จริง**:
   - API endpoints และ Server Actions ต้องรัน SQL Query / Mutation จริง และมี Input Validation (Zod) เสมอ
   - ห้าม Return Mock JSON หลอกๆ

4. **การวางแผน (/plan)**:
   - เมื่อใช้คำสั่ง `/plan` หรือวางแผนสถาปัตยกรรม ต้องวางขั้นตอนการสร้าง Schema จริง และการเชื่อมต่อ End-to-End จริงเสมอ ห้ามวางแผนเป็นขั้นสร้าง Mockup เพื่อมาแก้ทีหลัง

# Booking hotel (monorepo)

โปรเจกต์แยกเป็น **สองแอป** ใต้โฟลเดอร์ย่อย — ไฟล์ที่อยู่ **ระดับราก** (ข้างนอก `backend/` และ `frontend/`) เป็นของ **ทั้งโปรเจกต์ (workspace)** ไม่ใช่เฉพาะฝั่งเว็บหรือเฉพาะ API

## โครงสร้าง

```
.
├── backend/           # NestJS + Prisma + REST API
├── frontend/          # Next.js (App Router)
├── package.json       # npm workspaces — สคริปต์รวม (dev, build, db:*)
├── package-lock.json  # ล็อก dependency ทั้ง monorepo
├── .env.example       # ตัวอย่างตัวแปรสภาพแวดล้อม (คัดลอกไป backend/.env และ frontend/.env.local)
├── .gitignore
└── .vscode/           # การตั้งค่าโปรแกรมแก้ไข (ถ้ามี)
```

| รายการที่ราก | บทบาท |
|-------------|--------|
| `package.json` | ประกาศ `workspaces`: `frontend`, `backend` และคำสั่งเช่น `npm run dev`, `npm run start:dev` |
| `package-lock.json` | ล็อกเวอร์ชันแพ็กเกจของ workspace ทั้งก้อน |
| `.env.example` | เอกสารอ้างอิง env — ค่าจริงแยกไว้ใน `backend/.env` และ `frontend/.env.local` |
| `.gitignore` | กฎไม่ commit เช่น `node_modules`, `.env` |

## ความต้องการของระบบ

- Node.js (แนะนำ LTS)

## ติดตั้งและรัน

```bash
npm install
```

คัดลอก env ตาม `.env.example` ไปที่ `backend/.env` และ `frontend/.env.local` จากนั้น:

```bash
npm run dev
```

รันเฉพาะ API (Nest, watch):

```bash
npm run start:dev
```

รันเฉพาะ frontend:

```bash
npm run dev -w frontend
```

ฐานข้อมูล (Prisma ที่ `backend/`):

```bash
npm run db:push
npm run db:seed
```

## หมายเหตุ

เปิดโฟลเดอร์โปรเจกต์ที่มี `package.json`, `backend`, `frontend` อยู่ **ชั้นเดียวกัน** เป็น workspace ใน IDE — ไม่ควรมีโฟลเดอร์ซ้อนชื่อซ้ำอีกชั้น

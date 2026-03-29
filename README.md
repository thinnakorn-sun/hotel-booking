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

---

## QA / พร้อม deploy หรือยัง

### Build ที่ควรผ่านก่อนขึ้น production

```bash
npm install
npm run build -w backend
npm run build -w frontend
```

- **Backend:** `npm run start:prod` รันจาก `backend/dist/main.js` หลัง `nest build`
- **Frontend:** `next.config` ใช้ `output: 'standalone'` — เหมาะกับ Docker / บางแพลตฟอร์มที่รัน `node server.js` จาก `.next/standalone`

### ตัวแปรสภาพแวดล้อม (สรุป)

| ที่ | ตัวแปร | บังคับ? | หมายเหตุ |
|-----|--------|---------|----------|
| Backend | `DATABASE_URL` | ใช่ | PostgreSQL สำหรับ Prisma |
| Backend | `CORS_ORIGIN` | แนะนำ | คั่นด้วย comma ได้หลาย origin (เช่น Vercel preview + โดเมนจริง) |
| Backend | `PORT` | ไม่ | default `3001` |
| Backend | `SUPABASE_*` | ตามฟีเจอร์ | `SupabaseService` พร้อมใช้; ถ้ายังไม่เรียกจาก controller จะไม่พังตอนบูต |
| Frontend | `NEXT_PUBLIC_API_URL` | ใช่ | URL ของ API ฝั่ง backend (ไม่มี `/` ท้าย) |
| Frontend | `NEXT_PUBLIC_SUPABASE_*` | สำหรับแอดมิน | ถ้าไม่ตั้ง แอดมินล็อกอินไม่ได้ แต่หน้า guest ยังโหลดได้ |
| Frontend | `NEXT_PUBLIC_SUITE_IMAGE_FALLBACK_URL` | ไม่ | ถ้าไม่ตั้ง ใช้รูป default (picsum) ตาม `lib/env/public-env.ts` |

รายละเอียดและตัวอย่างค่า: ดู `.env.example` ที่รากโปรเจกต์, `backend/.env.example`, `frontend/.env.example`

**Deploy บน Render (API) + Vercel (เว็บ):** ค่า env แบบก้อปวาง → [docs/RENDER-VERCEL-ENV.md](docs/RENDER-VERCEL-ENV.md)

### ข้อจำกัดด้านความปลอดภัย (ควรทราบก่อนเปิด public API)

- ฝั่ง **API ยังไม่มีการตรวจ JWT / Bearer** ใน controllers — ฝั่ง frontend ส่ง `Authorization` จาก Supabase แล้ว แต่ **backend ยังไม่ verify token** ดังนั้น route ที่ละเอียดอ่อน (เช่น `booking/admin/*`, `admin/*`) ในทางทฤษฎีถูกเรียกได้โดยไม่ล็อกอิน หากรู้ URL  
- **แนะนำก่อน production จริง:** เพิ่ม Guard ตรวจ Supabase JWT กับ route แอดมิน, จำกัด rate, และ/หรือวาง API หลัง private network / API gateway

### สิ่งอื่นที่ควรเช็ก

- รัน `npm run db:push` และ `npm run db:seed` (หรือ migrate) บน DB production หลังตั้ง `DATABASE_URL`
- ตั้ง `CORS_ORIGIN` ให้ตรงกับโดเมนที่ user เปิดเว็บ (รวม `https://`)
- อย่า commit `.env`, `.env.local`, หรือ service role key

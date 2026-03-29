# Deploy: Render (API) + Vercel (Frontend) — ค่า Environment

ลำดับแนะนำ: สร้าง **PostgreSQL บน Render** → สร้าง **Web Service (Nest)** → ได้ URL API → สร้างโปรเจกต์ **Vercel** → เอา URL เว็บไปใส่ **CORS** บน Render แล้ว **Redeploy** รอบหนึ่ง

---

## 1) Render — PostgreSQL (ถ้ายังไม่มี DB)

ใน Dashboard → **New** → **PostgreSQL**  
หลังสร้างเสร็จ คัดลอก **Internal Database URL** (หรือ External ถ้า API ไม่อยู่บน Render — กรณีนี้ API อยู่ Render ใช้ Internal ได้)

เก็บไว้ใส่ในตัวแปร `DATABASE_URL` ของ Web Service

---

## 2) Render — Web Service (Backend / Nest)

### ค่าที่ตั้งในแท็บ Settings

| รายการ | ค่าที่แนะนำ |
|--------|------------|
| **Root Directory** | *(ว่าง — ใช้ราก repo)* |
| **Runtime** | Node |
| **Build Command** | `npm ci && npm run db:generate -w backend && npm run build -w backend` |
| **Start Command** | `npm run start:prod -w backend` |

ถ้า Render ให้เลือก **Node version** ให้ใช้ **20 LTS** (หรือตรงกับที่รันบนเครื่อง)

### Environment Variables (ก้อปชื่อ Key ไปวาง — Value ใส่ของจริง)

```env
# Render มักใส่ PORT ให้อัตโนมัติ — ถ้ามีในแดชบอร์ดแล้วไม่ต้องซ้ำ
# PORT=10000

NODE_ENV=production

# จาก PostgreSQL บน Render (Internal Database URL แนะนำ)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# URL เว็บบน Vercel — ใส่ได้หลายค่า คั่นด้วย comma ไม่เว้นวรรคหลัง comma ก็ได้
# ตัวอย่าง: โดเมนหลัก + preview (แก้เป็นของคุณ)
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-git-main-xxx.vercel.app

# Supabase (โปรเจกต์เดียวกับที่ใช้ล็อกอินแอดมินบนเว็บ)
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ใช้ค่าเดียวกับ anon key ใน Supabase → Project Settings → API (public anon)
# เก็บเฉพาะบนเซิร์ฟเวอร์ ไม่ฝังใน frontend ตัวนี้
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**หมายเหตุ**

- หลัง deploy Vercel ครั้งแรก ถ้าได้ URL ใหม่ ให้กลับมาแก้ `CORS_ORIGIN` แล้วกด **Manual Deploy** บน Render
- รอบแรกหลังมี `DATABASE_URL` ควรรัน migration/seed บน DB (เช่น Shell บน Render หรือรันจากเครื่องชี้ไปที่ `DATABASE_URL` production):  
  `npx prisma db push` / `migrate deploy` ตามที่โปรเจกต์ใช้ และ `npm run db:seed -w backend` ถ้าต้องการข้อมูลเริ่มต้น

---

## 3) Vercel — Frontend (Next.js)

สร้างโปรเจกต์จาก **repo เดียวกับ backend** แล้วตั้งแบบ monorepo:

| รายการ | ค่าที่แนะนำ |
|--------|------------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Next.js |
| **Install Command** | `cd .. && npm ci` |
| **Build Command** | `cd .. && npm run build -w frontend` |

(ให้ `npm ci` รันที่ราก repo เพื่อใช้ `package-lock.json` ของ workspace ทั้งก้อน)

**ทางเลือก:** ถ้าไม่ตั้ง Root Directory เป็น `frontend` ให้ชี้ที่ราก repo แล้วใช้ Build = `npm ci && npm run build -w frontend` — ต้องลองกับ UI ของ Vercel เวอร์ชันปัจจุบันว่ารู้จัก Next ใน subdirectory หรือไม่

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-api-name.onrender.com

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ไม่บังคับ — ถ้าว่างระบบใช้รูป default (picsum)
# NEXT_PUBLIC_SUITE_IMAGE_FALLBACK_URL=https://your-cdn.com/placeholder-suite.jpg
```

**สำคัญ**

- `NEXT_PUBLIC_API_URL` **ไม่มี** `/` ท้าย  
- ใช้ **https** ของ Render (`https://....onrender.com`)  
- หลังแก้ env บน Vercel ให้ **Redeploy** ทุกครั้ง (ค่า `NEXT_PUBLIC_*` ถูกฝังตอน build)

---

## 4) เช็กลิสต์สั้นๆ

- [ ] Render API ขึ้นแล้ว เปิด `https://xxx.onrender.com` หรือลอง path ที่รู้ว่ามี (เช่น route ของ booking ถ้ามี)  
- [ ] `CORS_ORIGIN` บน Render มีโดเมน Vercel ครบทั้ง production และ branch preview ที่ใช้  
- [ ] Vercel ใส่ `NEXT_PUBLIC_API_URL` ตรงกับ Render แล้ว build ผ่าน  
- [ ] Supabase **Site URL / Redirect URLs** ใน Dashboard ใส่โดเมน Vercel แล้ว (ถ้าใช้ OAuth / magic link — กรณี email/password ก็ควรตั้งให้ครอบคลุมโดเมนจริง)

---

## 5) ตัวอย่างเติมเต็ม (แก้เป็นของคุณ)

**Render (Backend)**

```
NODE_ENV=production
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://hotel-booking.vercel.app,https://hotel-booking-git-dev-xxx.vercel.app
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

**Vercel (Frontend)**

```
NEXT_PUBLIC_API_URL=https://hotel-api.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

ไฟล์อ้างอิงทั่วไป: `.env.example` ที่ราก repo, `backend/.env.example`, `frontend/.env.example`

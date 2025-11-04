# 🚀 Quick Start Guide - Aplikasi Manajemen Talenta ASN BSSN

## Langkah-Langkah Setup

### 1️⃣ Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2️⃣ Setup MySQL Database
```bash
# Pastikan MySQL sudah running
# Buat database baru
mysql -u root -e "CREATE DATABASE talent_management;"

# Atau lewat MySQL Workbench/phpMyAdmin
```
✅ Database URL di `.env` sudah dikonfigurasi: `mysql://root@localhost:3306/talent_management`  
✅ Jika MySQL Anda pakai password, ubah di `.env` menjadi: `mysql://root:password@localhost:3306/talent_management`

### 3️⃣ Push Database Schema
```bash
npx prisma db push
```

### 4️⃣ Seed Data Dummy
```bash
npm run db:seed
```
✅ Akan membuat 1 akun OSDM, 5 akun pegawai, 8 jabatan, dan 17 kompetensi

### 5️⃣ (Opsional) Tambahkan OpenAI API Key
Edit file `.env`:
```env
OPENAI_API_KEY="sk-..."
```
💡 Jika tidak ada API key, sistem akan gunakan mock analysis

### 6️⃣ Jalankan Development Server
```bash
npm run dev
```
✅ Buka http://localhost:3000

---

## 🔑 Login Credentials

### OSDM
- Email: `osdm@bssn.go.id`
- Password: `password123`

### Pegawai
- Email: `budi.santoso@bssn.go.id`
- Password: `password123`

(Ada 4 pegawai lainnya - lihat README.md)

---

## ✨ Fitur yang Sudah Dibuat

### ✅ Backend
- [x] Database schema lengkap dengan Prisma
- [x] Authentication dengan NextAuth v5
- [x] API routes untuk CRUD operations
- [x] Change request approval workflow
- [x] OpenAI integration untuk talent matching
- [x] Mock analysis sebagai fallback

### ✅ Frontend
- [x] Login page
- [x] Dashboard Pegawai
  - Data diri, sertifikasi, penugasan, jabatan, pendidikan
  - Change request submission
  - Status tracking
- [x] Dashboard OSDM
  - List semua pegawai
  - Approval change requests
  - Manage jabatan & kompetensi
  - AI Talent Matching dengan score & analysis
- [x] Responsive design dengan Tailwind CSS

### ✅ Data
- [x] 5 pegawai dummy dengan data lengkap
- [x] 8 jabatan BSSN (23 total tersedia di seed)
- [x] 17 kompetensi (Technical, Managerial, Sosial)
- [x] Sertifikasi, penugasan, pendidikan untuk setiap pegawai

---

## 🎯 Cara Menggunakan

### Sebagai Pegawai:
1. Login → Lihat dashboard
2. Tambah sertifikasi/penugasan/jabatan/pendidikan
3. Pengajuan masuk ke approval queue
4. Cek status di tab "Pengajuan"

### Sebagai OSDM:
1. Login → Pilih tab yang diinginkan
2. **Data Pegawai**: Lihat detail semua pegawai
3. **Persetujuan Perubahan**: Approve/reject change requests
4. **Jabatan & Kompetensi**: Kelola jabatan dan kompetensi
5. **Matching Talenta**: 
   - Pilih pegawai & jabatan
   - Klik "Analisis dengan AI"
   - Lihat match score, strengths, gaps

---

## 📁 Struktur Proyek

```
talent-management/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth
│   │   ├── employees/    # Employee CRUD
│   │   ├── change-requests/
│   │   ├── job-positions/
│   │   ├── competencies/
│   │   └── job-match/    # AI Matching
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   └── page.tsx          # Home (redirect)
├── components/
│   ├── OSDMDashboard.tsx
│   └── PegawaiDashboard.tsx
├── lib/
│   └── prisma.ts         # Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── auth.ts               # NextAuth config
├── middleware.ts         # Route protection
└── .env                  # Environment variables
```

---

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Pastikan Prisma Postgres running
npx prisma dev
```

### TypeScript Errors
```bash
npm run lint
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

---

## 📚 Resources

- **README.md**: Dokumentasi lengkap
- **Prisma Studio**: `npm run db:studio` (GUI database)
- **API Testing**: Gunakan Postman atau Thunder Client

---

## 🎉 Selesai!

Aplikasi sudah siap digunakan. Login sebagai OSDM atau Pegawai untuk menjelajahi fitur-fitur yang ada.

**Happy Coding!** 🚀

# ✅ Checklist Install Ulang - Talent Management System

## 📋 Sebelum Install Ulang
- [x] Backup database (talent_management_backup_2025-11-04_213315.sql)
- [x] Backup folder project (c:\Users\mahap\OneDrive\Documents\projectbkn\talent-management)
- [x] Simpan file .env.example untuk referensi
- [x] Catat OpenAI API Key (jika ada)
- [ ] Backup browser bookmarks (jika perlu)
- [ ] Export kredensial dari password manager

## 🖥️ Setelah Install Ulang Windows

### 1️⃣ Install Software Dasar
- [ ] Google Chrome / Firefox
- [ ] Visual Studio Code
- [ ] Git for Windows
- [ ] Node.js (v18 atau lebih baru)
  - Download: https://nodejs.org/
  - Pilih LTS version
  - Centang "Add to PATH"

### 2️⃣ Install XAMPP
- [ ] Download XAMPP: https://www.apachefriends.org/
- [ ] Install dengan MySQL
- [ ] Start Apache & MySQL
- [ ] Test: http://localhost/phpmyadmin

### 3️⃣ Restore Project

#### A. Copy Folder Project
```powershell
# Dari backup drive ke lokasi baru
# Contoh:
Copy-Item -Path "D:\Backup\talent-management" -Destination "C:\Users\[USERNAME]\Documents\projectbkn\" -Recurse
```

#### B. Install Dependencies
```powershell
cd "C:\Users\[USERNAME]\Documents\projectbkn\talent-management"
npm install
```

#### C. Setup Environment
```powershell
# Copy .env.example ke .env
Copy-Item backups\.env.example .env

# Edit .env dan masukkan OpenAI API key
code .env
```

#### D. Restore Database
```powershell
# Buat database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS talent_management;"

# Restore dari backup
Get-Content backups\talent_management_backup_2025-11-04_213315.sql | mysql -u root talent_management

# Verifikasi
mysql -u root -e "USE talent_management; SHOW TABLES;"
```

#### E. Generate Prisma Client
```powershell
npx prisma generate
```

#### F. Test Aplikasi
```powershell
# Development mode
npm run dev

# Buka browser: http://localhost:3000
# Login: osdm@bssn.go.id / password123
```

### 4️⃣ Verifikasi Fitur

Setelah aplikasi jalan, test fitur-fitur ini:

**Login & Authentication:**
- [ ] Login sebagai OSDM berhasil
- [ ] Login sebagai Pegawai berhasil
- [ ] Logout berfungsi

**Dashboard Pegawai:**
- [ ] Tab Profil - data muncul
- [ ] Tab Sertifikasi - list sertifikat
- [ ] Tab Penugasan - data penugasan
- [ ] Tab Penilaian - assessment & 9-box
- [ ] Tab AI Analisis - matching jabatan
- [ ] Learning Path - progress tracking

**Dashboard OSDM:**
- [ ] Data Pegawai - list lengkap
- [ ] Persetujuan Perubahan - approval flow
- [ ] Jabatan & Kompetensi - CRUD
- [ ] Matching Talenta - AI analysis
- [ ] Rekomendasi Kandidat - ranking system

**Database:**
- [ ] Semua tabel ada (15 tables)
- [ ] Data seed lengkap (6 users, 5 employees)
- [ ] Relasi antar tabel OK

## 🆘 Troubleshooting

### Port 3000 sudah dipakai
```powershell
npm run dev -- -p 3001
```

### MySQL tidak start
- Buka XAMPP Control Panel
- Stop Apache dulu (jika bentrok)
- Start MySQL
- Cek port 3306 tidak dipakai

### Prisma error
```powershell
# Reset Prisma
npx prisma generate --force
```

### Build error
```powershell
# Clear cache
Remove-Item .next -Recurse -Force
npm run build
```

## 📱 Kontak & Resources

- GitHub: https://github.com/mahaputra2512/talent-management
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- OpenAI API: https://platform.openai.com/

## 🎯 Versi Software (Referensi)

- Node.js: v18+ atau v20+
- npm: v9+ atau v10+
- Next.js: 16.0.0
- Prisma: 6.18.0
- MySQL: 8.0+ (via XAMPP)

---

**Created**: November 4, 2025
**System**: Windows 11
**Status**: ✅ Ready for Restore

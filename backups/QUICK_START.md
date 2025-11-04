# 🚀 QUICK START - Restore Setelah Install Ulang

## 📦 File Backup Yang Penting:

1. **talent_management_backup_2025-11-04_213315.sql** (95 KB)
   → Database lengkap dengan semua data

2. **.env.example**
   → Template environment variables

3. **README_RESTORE.md**
   → Panduan lengkap restore database

4. **CHECKLIST_INSTALL_ULANG.md**
   → Checklist step-by-step lengkap

---

## ⚡ RESTORE CEPAT (5 Menit)

### Asumsi:
- ✅ Windows sudah di-install ulang
- ✅ XAMPP sudah installed dan running
- ✅ Node.js sudah installed
- ✅ Folder project sudah di-copy ke komputer baru

### Langkah Cepat:

```powershell
# 1. Masuk folder project
cd "C:\Users\[USERNAME]\Documents\projectbkn\talent-management"

# 2. Restore database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS talent_management;"
Get-Content backups\talent_management_backup_2025-11-04_213315.sql | mysql -u root talent_management

# 3. Copy & edit .env
Copy-Item backups\.env.example .env
notepad .env  # Edit OPENAI_API_KEY kalau ada

# 4. Install dependencies
npm install

# 5. Generate Prisma
npx prisma generate

# 6. Jalankan!
npm run dev
```

### Test:
- Buka: http://localhost:3000
- Login: **osdm@bssn.go.id** / **password123**

---

## 📞 Jika Ada Masalah:

**"Can't find module"**
```powershell
npm install
```

**"Can't connect to MySQL"**
- Buka XAMPP → Start MySQL
- Test: http://localhost/phpmyadmin

**"Port 3000 already in use"**
```powershell
npm run dev -- -p 3001
```

---

## 🎯 Yang Harus Di-Backup Sebelum Install Ulang:

✅ Folder project: `talent-management` (SEMUA FILE)
✅ File backup database: `backups/talent_management_backup_2025-11-04_213315.sql`
✅ OpenAI API Key (simpan di tempat aman)
✅ File dokumentasi di folder `backups/`

---

**Date**: 2025-11-04
**Database**: talent_management (95 KB)
**Tables**: 15 tables
**Users**: 6 (1 OSDM + 5 Pegawai)
**Status**: ✅ SIAP RESTORE

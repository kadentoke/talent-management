# 📦 Database Backup - Talent Management BSSN

## 📋 Informasi Backup
- **Database Name**: talent_management
- **Backup Date**: 2025-11-04
- **File**: talent_management_backup_2025-11-04_213315.sql
- **Size**: ~95 KB
- **Status**: ✅ Complete

## 🔧 Cara Restore Database

### Prerequisites:
1. Install MySQL/MariaDB atau XAMPP
2. Pastikan MySQL service sudah running

### Langkah Restore:

#### Windows (PowerShell):
```powershell
# 1. Masuk ke folder project
cd "c:\Users\mahap\OneDrive\Documents\projectbkn\talent-management"

# 2. Buat database baru
mysql -u root -e "CREATE DATABASE IF NOT EXISTS talent_management;"

# 3. Restore database dari backup
mysql -u root talent_management < backups/talent_management_backup_2025-11-04_213315.sql

# 4. Verifikasi
mysql -u root -e "USE talent_management; SHOW TABLES;"
```

#### Alternatif menggunakan phpMyAdmin:
1. Buka http://localhost/phpmyadmin
2. Buat database baru: `talent_management`
3. Pilih database tersebut
4. Klik tab "Import"
5. Pilih file: `talent_management_backup_2025-11-04_213315.sql`
6. Klik "Go"

## 📊 Isi Database

Database ini berisi:
- ✅ Users (OSDM & Pegawai)
- ✅ Employees (5 pegawai dummy)
- ✅ Certifications
- ✅ Assignments
- ✅ Position Histories
- ✅ Education Histories
- ✅ Job Positions
- ✅ Competencies
- ✅ Job Position Competencies
- ✅ Change Requests
- ✅ Job Matches
- ✅ Assessments (NEW - sistem penilaian)
- ✅ Assessment Items
- ✅ Learning Paths (NEW - jalur pembelajaran)
- ✅ Learning Modules

## 🔑 Login Credentials (Demo)

**OSDM:**
- Email: osdm@bssn.go.id
- Password: password123

**Pegawai:**
- Email: budi.santoso@bssn.go.id
- Password: password123

(Ada 4 pegawai lainnya dengan format: [nama]@bssn.go.id / password123)

## 🚀 Setelah Restore

1. Install dependencies:
```bash
npm install
```

2. Update file .env:
```env
DATABASE_URL="mysql://root@localhost:3306/talent_management"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="talent-management-secret-key-2025-change-in-production"
OPENAI_API_KEY="your-openai-api-key-here"
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

4. Jalankan development server:
```bash
npm run dev
```

5. Akses aplikasi: http://localhost:3000

## ⚠️ Catatan Penting

- Backup ini sudah termasuk semua data dummy untuk testing
- Semua password di-hash menggunakan bcrypt (10 rounds)
- Database menggunakan MySQL/MariaDB
- Pastikan port 3306 tidak digunakan aplikasi lain
- File .env TIDAK di-backup untuk keamanan - copy manual jika perlu

## 📞 Troubleshooting

**Error: "Can't connect to MySQL server"**
- Pastikan XAMPP/MySQL sudah running
- Cek port 3306 tidak bentrok

**Error: "Table already exists"**
- Drop database dulu: `mysql -u root -e "DROP DATABASE talent_management;"`
- Buat ulang dan restore

**Error: "Access denied"**
- Pastikan user `root` tidak memerlukan password
- Atau tambahkan `-p` untuk input password

## 💾 Backup Reguler

Untuk backup regular, jalankan:
```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
mysqldump -u root talent_management > "backups/talent_management_backup_$timestamp.sql"
```

---
**Last Updated**: November 4, 2025
**Backup By**: System Administrator

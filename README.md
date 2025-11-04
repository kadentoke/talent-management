# Aplikasi Manajemen Talenta ASN BSSN# Aplikasi Manajemen Talenta ASN BSSNThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Sistem manajemen talenta untuk ASN di Badan Siber dan Sandi Negara (BSSN) dengan fitur AI-powered talent matching menggunakan OpenAI.



## 🎯 Fitur UtamaSistem manajemen talenta untuk ASN di Badan Siber dan Sandi Negara (BSSN) dengan fitur AI-powered talent matching menggunakan OpenAI.## Getting Started



### Dashboard Pegawai

- ✅ Melihat dan mengelola data diri lengkap

- ✅ Menambah dan mengelola sertifikasi## 🎯 Fitur UtamaFirst, run the development server:

- ✅ Menambah dan mengelola penugasan

- ✅ Menambah dan mengelola riwayat jabatan

- ✅ Menambah dan mengelola riwayat pendidikan

- ✅ Mengajukan perubahan data (memerlukan approval OSDM)### Dashboard Pegawai```bash

- ✅ Melihat status pengajuan perubahan

- ✅ Melihat dan mengelola data diri lengkapnpm run dev

### Dashboard OSDM

- ✅ Melihat semua data pegawai- ✅ Menambah dan mengelola sertifikasi# or

- ✅ Approve/reject pengajuan perubahan data pegawai

- ✅ Mengelola daftar jabatan di BSSN (23+ jabatan)- ✅ Menambah dan mengelola penugasanyarn dev

- ✅ Mengelola kompetensi yang diperlukan untuk setiap jabatan

- ✅ **AI Talent Matching**: Menggunakan OpenAI untuk mencocokkan pegawai dengan jabatan tersedia- ✅ Menambah dan mengelola riwayat jabatan# or

- ✅ Melihat hasil analisis kecocokan kandidat dengan score, strengths, dan gaps

- ✅ Menambah dan mengelola riwayat pendidikanpnpm dev

## 🛠 Teknologi yang Digunakan

- ✅ Mengajukan perubahan data (memerlukan approval OSDM)# or

- **Frontend & Backend**: Next.js 16 (App Router)

- **Database**: MySQL- ✅ Melihat status pengajuan perubahanbun dev

- **ORM**: Prisma

- **Authentication**: NextAuth v5```

- **AI Integration**: OpenAI GPT-4

- **Styling**: Tailwind CSS 4### Dashboard OSDM

- **Language**: TypeScript 5

- ✅ Melihat semua data pegawaiOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Setup & Instalasi

- ✅ Approve/reject pengajuan perubahan data pegawai

### 1. Install Dependencies

- ✅ Mengelola daftar jabatan di BSSN (23+ jabatan)You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

```bash

npm install --legacy-peer-deps- ✅ Mengelola kompetensi yang diperlukan untuk setiap jabatan

```

- ✅ **AI Talent Matching**: Menggunakan OpenAI untuk mencocokkan pegawai dengan jabatan tersediaThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### 2. Setup MySQL Database

- ✅ Melihat hasil analisis kecocokan kandidat dengan score, strengths, dan gaps

Pastikan MySQL sudah terinstall dan berjalan. Buat database baru:

## Learn More

```sql

CREATE DATABASE talent_management;## 🛠 Teknologi yang Digunakan

```

To learn more about Next.js, take a look at the following resources:

Database URL di `.env` sudah dikonfigurasi untuk MySQL tanpa password:

```env- **Frontend & Backend**: Next.js 16 (App Router)

DATABASE_URL="mysql://root@localhost:3306/talent_management"

```- **Database**: PostgreSQL (Prisma Postgres)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.



Jika MySQL Anda menggunakan password, ubah menjadi:- **ORM**: Prisma- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

```env

DATABASE_URL="mysql://root:password@localhost:3306/talent_management"- **Authentication**: NextAuth v5

```

- **AI Integration**: OpenAI GPT-4You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### 3. Push Schema ke Database

- **Styling**: Tailwind CSS 4

```bash

npx prisma db push- **Language**: TypeScript 5## Deploy on Vercel

```



### 4. Seed Database dengan Data Dummy

## 📦 Setup & InstalasiThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

```bash

npm run db:seed

```

### 1. Install DependenciesCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Data yang akan dibuat:

- 1 akun OSDM BSSN

- 5 akun pegawai dengan data lengkap (sertifikasi, penugasan, pendidikan)```bash

- 8 jabatan di BSSN dengan kompetensinpm install --legacy-peer-deps

- 17 kompetensi (Technical, Managerial, Sosial)```



### 5. Setup OpenAI API Key (Opsional)### 2. Setup Database



Tambahkan OpenAI API key di `.env`:Aplikasi ini menggunakan Prisma Postgres. Jalankan:



```env```bash

OPENAI_API_KEY="sk-..."# Start Prisma Postgres development server

```npx prisma dev

```

**Note**: Jika tidak ada API key, sistem akan menggunakan mock analysis sebagai fallback.

Ikuti instruksi CLI untuk create database. Database URL akan otomatis ditambahkan ke `.env`.

### 6. Jalankan Development Server

**Alternatif**: Gunakan PostgreSQL lokal dengan update `DATABASE_URL` di `.env`.

```bash

npm run dev### 3. Push Schema ke Database

```

```bash

Buka: **http://localhost:3000**npm run db:push

```

## 🔐 Login Credentials (Demo)

### 4. Seed Database dengan Data Dummy

### Akun OSDM

- **Email**: `osdm@bssn.go.id````bash

- **Password**: `password123`npm run db:seed

```

### Akun Pegawai

Data yang akan dibuat:

1. **Budi Santoso** (Kepala Seksi Keamanan Siber)- 1 akun OSDM BSSN

   - Email: `budi.santoso@bssn.go.id`- 5 akun pegawai dengan data lengkap (sertifikasi, penugasan, pendidikan)

   - Password: `password123`- 8 jabatan di BSSN dengan kompetensi

- 17 kompetensi (Technical, Managerial, Sosial)

2. **Siti Nurhaliza** (Kepala Sub Direktorat Kriptografi)

   - Email: `siti.nurhaliza@bssn.go.id`### 5. Setup OpenAI API Key (Opsional)

   - Password: `password123`

Tambahkan OpenAI API key di `.env`:

3. **Ahmad Fauzi** (Analis Keamanan Jaringan)

   - Email: `ahmad.fauzi@bssn.go.id````env

   - Password: `password123`OPENAI_API_KEY="sk-..."

```

4. **Dewi Lestari** (Analis Digital Forensik)

   - Email: `dewi.lestari@bssn.go.id`**Note**: Jika tidak ada API key, sistem akan menggunakan mock analysis sebagai fallback.

   - Password: `password123`

### 6. Jalankan Development Server

5. **Ridwan Kamil** (Kepala Seksi Perencanaan)

   - Email: `ridwan.kamil@bssn.go.id````bash

   - Password: `password123`npm run dev

```

## 📋 Daftar Jabatan BSSN

Buka: **http://localhost:3000**

Aplikasi sudah termasuk 23+ jabatan di BSSN:

## 🔐 Login Credentials (Demo)

### Biro

- Kepala Biro Perencanaan dan Keuangan### Akun OSDM

- Kepala Biro Organisasi dan Sumber Daya Manusia- **Email**: `osdm@bssn.go.id`

- Kepala Biro Hukum dan Komunikasi Publik- **Password**: `password123`

- Kepala Biro Umum

### Akun Pegawai

### Deputi

- **Deputi I - Strategi dan Kebijakan**: 4 Direktur1. **Budi Santoso** (Kepala Seksi Keamanan Siber)

- **Deputi II - Operasi**: 3 Direktur   - Email: `budi.santoso@bssn.go.id`

- **Deputi III - Pemerintahan**: 3 Direktur   - Password: `password123`

- **Deputi IV - Perekonomian**: 4 Direktur

2. **Siti Nurhaliza** (Kepala Sub Direktorat Kriptografi)

### Pusat & Balai   - Email: `siti.nurhaliza@bssn.go.id`

- Kepala Pusat Sertifikasi Teknologi (Pussertif)   - Password: `password123`

- Kepala Pusat Data dan TIK (Pusdatik)

- Kepala Pusat Pengembangan SDM3. **Ahmad Fauzi** (Analis Keamanan Jaringan)

- Kepala Balai Besar Sertifikasi Elektronik (BSrE)   - Email: `ahmad.fauzi@bssn.go.id`

- Kepala Balai Layanan Penghubung Identitas Digital (BLPID)   - Password: `password123`



## 🧠 Kompetensi yang Tersedia4. **Dewi Lestari** (Analis Digital Forensik)

   - Email: `dewi.lestari@bssn.go.id`

### Technical (8 kompetensi)   - Password: `password123`

Keamanan Informasi, Kriptografi, Network Security, Incident Response, Risk Management, Penetration Testing, Cloud Security, Digital Forensics

5. **Ridwan Kamil** (Kepala Seksi Perencanaan)

### Managerial (5 kompetensi)   - Email: `ridwan.kamil@bssn.go.id`

Kepemimpinan, Perencanaan Strategis, Manajemen Proyek, Budgeting, Pengambilan Keputusan   - Password: `password123`



### Sosial (4 kompetensi)## 📋 Daftar Jabatan BSSN

Komunikasi, Kolaborasi, Negosiasi, Public Speaking

Aplikasi sudah termasuk 23+ jabatan di BSSN:

## 🚀 Cara Menggunakan Fitur AI Matching

### Biro

1. Login sebagai **OSDM**- Kepala Biro Perencanaan dan Keuangan

2. Buka tab **"Matching Talenta"**- Kepala Biro Organisasi dan Sumber Daya Manusia

3. Pilih pegawai dari dropdown- Kepala Biro Hukum dan Komunikasi Publik

4. Pilih jabatan yang tersedia- Kepala Biro Umum

5. Klik **"Analisis dengan AI"**

6. Tunggu beberapa detik untuk hasil analisis### Deputi

7. Lihat:- **Deputi I - Strategi dan Kebijakan**: 4 Direktur

   - **Match Score**: 0-100%- **Deputi II - Operasi**: 3 Direktur

   - **Kekuatan**: Apa yang dimiliki kandidat- **Deputi III - Pemerintahan**: 3 Direktur

   - **Gap**: Apa yang perlu ditingkatkan- **Deputi IV - Perekonomian**: 4 Direktur

   - **Rekomendasi**: Apakah cocok untuk jabatan

### Pusat & Balai

## 🔗 API Endpoints- Kepala Pusat Sertifikasi Teknologi (Pussertif)

- Kepala Pusat Data dan TIK (Pusdatik)

### Authentication- Kepala Pusat Pengembangan SDM

- `POST /api/auth/[...nextauth]`- Kepala Balai Besar Sertifikasi Elektronik (BSrE)

- Kepala Balai Layanan Penghubung Identitas Digital (BLPID)

### Employees

- `GET /api/employees`## 🧠 Kompetensi yang Tersedia

- `GET /api/employees?id={id}`

- `PUT /api/employees`### Technical (8 kompetensi)

Keamanan Informasi, Kriptografi, Network Security, Incident Response, Risk Management, Penetration Testing, Cloud Security, Digital Forensics

### Change Requests

- `GET /api/change-requests`### Managerial (5 kompetensi)

- `POST /api/change-requests`Kepemimpinan, Perencanaan Strategis, Manajemen Proyek, Budgeting, Pengambilan Keputusan

- `PATCH /api/change-requests`

### Sosial (4 kompetensi)

### Job PositionsKomunikasi, Kolaborasi, Negosiasi, Public Speaking

- `GET /api/job-positions`

- `POST /api/job-positions`## 🚀 Cara Menggunakan Fitur AI Matching

- `PUT /api/job-positions`

- `DELETE /api/job-positions?id={id}`1. Login sebagai **OSDM**

2. Buka tab **"Matching Talenta"**

### Competencies3. Pilih pegawai dari dropdown

- `GET /api/competencies`4. Pilih jabatan yang tersedia

- `POST /api/competencies`5. Klik **"Analisis dengan AI"**

- `PUT /api/competencies`6. Tunggu beberapa detik untuk hasil analisis

- `DELETE /api/competencies?id={id}`7. Lihat:

   - **Match Score**: 0-100%

### Job Matching (AI)   - **Kekuatan**: Apa yang dimiliki kandidat

- `POST /api/job-match` - Analyze dengan AI   - **Gap**: Apa yang perlu ditingkatkan

- `GET /api/job-match?jobPositionId={id}`   - **Rekomendasi**: Apakah cocok untuk jabatan

- `GET /api/job-match?minScore={score}`

## 🔗 API Endpoints

## 📊 Database Schema

### Authentication

### Core Models- `POST /api/auth/[...nextauth]`

- **User**: Akun login dengan role (PEGAWAI/OSDM)

- **Employee**: Data lengkap pegawai (NIP, jabatan, unit, golongan)### Employees

- **Certification**: Sertifikasi profesional- `GET /api/employees`

- **Assignment**: Penugasan yang pernah dilakukan- `GET /api/employees?id={id}`

- **PositionHistory**: Riwayat jabatan- `PUT /api/employees`

- **EducationHistory**: Riwayat pendidikan

### Change Requests

### Management Models- `GET /api/change-requests`

- **JobPosition**: Jabatan tersedia di BSSN- `POST /api/change-requests`

- **Competency**: Kompetensi yang diperlukan- `PATCH /api/change-requests`

- **JobPositionCompetency**: Relasi jabatan-kompetensi dengan level & priority

- **ChangeRequest**: Pengajuan perubahan data (approval workflow)### Job Positions

- **JobMatch**: Hasil analisis AI matching- `GET /api/job-positions`

- `POST /api/job-positions`

## ⚙️ Scripts NPM- `PUT /api/job-positions`

- `DELETE /api/job-positions?id={id}`

```bash

npm run dev          # Start development server### Competencies

npm run build        # Build for production- `GET /api/competencies`

npm run start        # Start production server- `POST /api/competencies`

npm run lint         # Run ESLint- `PUT /api/competencies`

- `DELETE /api/competencies?id={id}`

npm run db:push      # Push schema to database

npm run db:seed      # Seed dummy data### Job Matching (AI)

npm run db:studio    # Open Prisma Studio (GUI)- `POST /api/job-match` - Analyze dengan AI

```- `GET /api/job-match?jobPositionId={id}`

- `GET /api/job-match?minScore={score}`

## 📝 Workflow Aplikasi

## 📊 Database Schema

### Sebagai Pegawai:

1. Login dengan akun pegawai### Core Models

2. Lihat dashboard dengan data diri lengkap- **User**: Akun login dengan role (PEGAWAI/OSDM)

3. Tambah/update: sertifikasi, penugasan, jabatan, pendidikan- **Employee**: Data lengkap pegawai (NIP, jabatan, unit, golongan)

4. Setiap perubahan masuk ke **Change Request** (status: PENDING)- **Certification**: Sertifikasi profesional

5. Tunggu approval dari OSDM- **Assignment**: Penugasan yang pernah dilakukan

6. Lihat status di tab "Pengajuan Perubahan"- **PositionHistory**: Riwayat jabatan

- **EducationHistory**: Riwayat pendidikan

### Sebagai OSDM:

1. Login dengan akun OSDM### Management Models

2. Tab **Data Pegawai**: Lihat semua pegawai dengan detail lengkap- **JobPosition**: Jabatan tersedia di BSSN

3. Tab **Persetujuan Perubahan**: Review dan approve/reject change requests- **Competency**: Kompetensi yang diperlukan

4. Tab **Jabatan & Kompetensi**: Kelola jabatan dan kompetensi yang diperlukan- **JobPositionCompetency**: Relasi jabatan-kompetensi dengan level & priority

5. Tab **Matching Talenta**: - **ChangeRequest**: Pengajuan perubahan data (approval workflow)

   - Gunakan AI untuk menganalisis kecocokan- **JobMatch**: Hasil analisis AI matching

   - Lihat ranking kandidat terbaik

   - Baca analisis kekuatan dan gap setiap kandidat## ⚙️ Scripts NPM



## 🎨 Fitur UI/UX```bash

npm run dev          # Start development server

- ✅ Responsive design untuk desktop & mobilenpm run build        # Build for production

- ✅ Dark mode support via Tailwindnpm run start        # Start production server

- ✅ Loading states untuk async operationsnpm run lint         # Run ESLint

- ✅ Error handling dengan user-friendly messages

- ✅ Modal dialogs untuk detail viewnpm run db:push      # Push schema to database

- ✅ Color-coded status badgesnpm run db:seed      # Seed dummy data

- ✅ Score visualization dengan color gradientnpm run db:studio    # Open Prisma Studio (GUI)

- ✅ Tab-based navigation untuk OSDM dashboard```



## 🔧 Troubleshooting## 📝 Workflow Aplikasi



### MySQL Connection Error### Sebagai Pegawai:

```bash1. Login dengan akun pegawai

# Pastikan MySQL berjalan2. Lihat dashboard dengan data diri lengkap

# Windows:3. Tambah/update: sertifikasi, penugasan, jabatan, pendidikan

net start MySQL804. Setiap perubahan masuk ke **Change Request** (status: PENDING)

5. Tunggu approval dari OSDM

# Atau cek service MySQL di Services6. Lihat status di tab "Pengajuan Perubahan"

```

### Sebagai OSDM:

### Database Tidak Ada1. Login dengan akun OSDM

```sql2. Tab **Data Pegawai**: Lihat semua pegawai dengan detail lengkap

CREATE DATABASE talent_management;3. Tab **Persetujuan Perubahan**: Review dan approve/reject change requests

```4. Tab **Jabatan & Kompetensi**: Kelola jabatan dan kompetensi yang diperlukan

5. Tab **Matching Talenta**: 

### OpenAI API Error   - Gunakan AI untuk menganalisis kecocokan

Sistem akan otomatis menggunakan **mock analysis** jika:   - Lihat ranking kandidat terbaik

- API key tidak tersedia   - Baca analisis kekuatan dan gap setiap kandidat

- API rate limit tercapai

- Network error## 🎨 Fitur UI/UX



### Port Already in Use- ✅ Responsive design untuk desktop & mobile

```bash- ✅ Dark mode support via Tailwind

npm run dev -- -p 3001- ✅ Loading states untuk async operations

```- ✅ Error handling dengan user-friendly messages

- ✅ Modal dialogs untuk detail view

### TypeScript Errors- ✅ Color-coded status badges

```bash- ✅ Score visualization dengan color gradient

npm run lint- ✅ Tab-based navigation untuk OSDM dashboard

# Fix auto-fixable issues

npx eslint --fix .## 🔧 Troubleshooting

```

### Database Connection Error

## 🚀 Deployment```bash

# Pastikan Prisma Postgres berjalan

### Vercel (Recommended)npx prisma dev

```bash

vercel deploy# Atau check PostgreSQL lokal

```psql -U postgres

```

### Docker

```bash### OpenAI API Error

docker build -t talent-management .Sistem akan otomatis menggunakan **mock analysis** jika:

docker run -p 3000:3000 talent-management- API key tidak tersedia

```- API rate limit tercapai

- Network error

## 📈 Pengembangan Selanjutnya

### Port Already in Use

Fitur yang bisa ditambahkan:```bash

- [ ] Dashboard analytics & reportingnpm run dev -- -p 3001

- [ ] Export data ke PDF/Excel```

- [ ] Email notifications untuk approval

- [ ] Multi-level approval workflow### TypeScript Errors

- [ ] Career path recommendation```bash

- [ ] Skill gap analysis dashboardnpm run lint

- [ ] Training recommendation# Fix auto-fixable issues

- [ ] Performance evaluation integrationnpx eslint --fix .

- [ ] Succession planning module```

- [ ] Mobile app (React Native)

## 🚀 Deployment

## 📄 License

### Vercel (Recommended)

Aplikasi ini dibuat untuk keperluan demo dan pembelajaran sistem manajemen talenta ASN.```bash

vercel deploy

## 👥 Support```



Untuk pertanyaan dan dukungan, hubungi tim OSDM BSSN.### Docker

```bash

---docker build -t talent-management .

docker run -p 3000:3000 talent-management

**Built with ❤️ using Next.js, Prisma, and OpenAI**```


## 📈 Pengembangan Selanjutnya

Fitur yang bisa ditambahkan:
- [ ] Dashboard analytics & reporting
- [ ] Export data ke PDF/Excel
- [ ] Email notifications untuk approval
- [ ] Multi-level approval workflow
- [ ] Career path recommendation
- [ ] Skill gap analysis dashboard
- [ ] Training recommendation
- [ ] Performance evaluation integration
- [ ] Succession planning module
- [ ] Mobile app (React Native)

## 📄 License

Aplikasi ini dibuat untuk keperluan demo dan pembelajaran sistem manajemen talenta ASN.

## 👥 Support

Untuk pertanyaan dan dukungan, hubungi tim OSDM BSSN.

---

**Built with ❤️ using Next.js, Prisma, and OpenAI**
#   t a l e n t - m a n a g e m e n t  
 
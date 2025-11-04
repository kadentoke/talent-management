import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create OSDM User
  const osdmUser = await prisma.user.upsert({
    where: { email: 'osdm@bssn.go.id' },
    update: {},
    create: {
      email: 'osdm@bssn.go.id',
      password: hashedPassword,
      name: 'Admin OSDM BSSN',
      role: 'OSDM',
    },
  });

  console.log('✅ OSDM user created');

  // Create Competencies
  const competencies = await Promise.all([
    // Technical Competencies
    prisma.competency.upsert({
      where: { name: 'Keamanan Informasi' },
      update: {},
      create: { name: 'Keamanan Informasi', category: 'Technical', description: 'Pemahaman tentang prinsip dan praktik keamanan informasi' },
    }),
    prisma.competency.upsert({
      where: { name: 'Kriptografi' },
      update: {},
      create: { name: 'Kriptografi', category: 'Technical', description: 'Pengetahuan tentang enkripsi dan metode keamanan data' },
    }),
    prisma.competency.upsert({
      where: { name: 'Network Security' },
      update: {},
      create: { name: 'Network Security', category: 'Technical', description: 'Kemampuan mengamankan infrastruktur jaringan' },
    }),
    prisma.competency.upsert({
      where: { name: 'Incident Response' },
      update: {},
      create: { name: 'Incident Response', category: 'Technical', description: 'Kemampuan merespons insiden keamanan siber' },
    }),
    prisma.competency.upsert({
      where: { name: 'Risk Management' },
      update: {},
      create: { name: 'Risk Management', category: 'Technical', description: 'Manajemen risiko keamanan siber' },
    }),
    prisma.competency.upsert({
      where: { name: 'Penetration Testing' },
      update: {},
      create: { name: 'Penetration Testing', category: 'Technical', description: 'Kemampuan melakukan pengujian penetrasi sistem' },
    }),
    prisma.competency.upsert({
      where: { name: 'Cloud Security' },
      update: {},
      create: { name: 'Cloud Security', category: 'Technical', description: 'Keamanan infrastruktur cloud' },
    }),
    prisma.competency.upsert({
      where: { name: 'Digital Forensics' },
      update: {},
      create: { name: 'Digital Forensics', category: 'Technical', description: 'Investigasi digital dan forensik' },
    }),
    // Managerial Competencies
    prisma.competency.upsert({
      where: { name: 'Kepemimpinan' },
      update: {},
      create: { name: 'Kepemimpinan', category: 'Managerial', description: 'Kemampuan memimpin tim dan organisasi' },
    }),
    prisma.competency.upsert({
      where: { name: 'Perencanaan Strategis' },
      update: {},
      create: { name: 'Perencanaan Strategis', category: 'Managerial', description: 'Kemampuan membuat strategi jangka panjang' },
    }),
    prisma.competency.upsert({
      where: { name: 'Manajemen Proyek' },
      update: {},
      create: { name: 'Manajemen Proyek', category: 'Managerial', description: 'Kemampuan mengelola proyek dengan efektif' },
    }),
    prisma.competency.upsert({
      where: { name: 'Budgeting' },
      update: {},
      create: { name: 'Budgeting', category: 'Managerial', description: 'Pengelolaan anggaran dan keuangan' },
    }),
    prisma.competency.upsert({
      where: { name: 'Pengambilan Keputusan' },
      update: {},
      create: { name: 'Pengambilan Keputusan', category: 'Managerial', description: 'Kemampuan mengambil keputusan strategis' },
    }),
    // Social Competencies
    prisma.competency.upsert({
      where: { name: 'Komunikasi' },
      update: {},
      create: { name: 'Komunikasi', category: 'Sosial', description: 'Kemampuan komunikasi yang efektif' },
    }),
    prisma.competency.upsert({
      where: { name: 'Kolaborasi' },
      update: {},
      create: { name: 'Kolaborasi', category: 'Sosial', description: 'Kemampuan bekerja sama dalam tim' },
    }),
    prisma.competency.upsert({
      where: { name: 'Negosiasi' },
      update: {},
      create: { name: 'Negosiasi', category: 'Sosial', description: 'Kemampuan bernegosiasi dengan stakeholder' },
    }),
    prisma.competency.upsert({
      where: { name: 'Public Speaking' },
      update: {},
      create: { name: 'Public Speaking', category: 'Sosial', description: 'Kemampuan berbicara di depan publik' },
    }),
  ]);

  console.log('✅ Competencies created');

  // Create Job Positions for BSSN
  const jobPositions = [
    {
      title: 'Kepala Biro Perencanaan dan Keuangan',
      unit: 'Biro Perencanaan dan Keuangan',
      level: 'Eselon II',
      isAvailable: true,
      description: 'Memimpin dan mengelola perencanaan dan keuangan BSSN',
      competencies: [
        { competencyName: 'Kepemimpinan', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Perencanaan Strategis', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Budgeting', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Manajemen Proyek', requiredLevel: 4, priority: 'MEDIUM' },
        { competencyName: 'Pengambilan Keputusan', requiredLevel: 5, priority: 'HIGH' },
      ],
    },
    {
      title: 'Kepala Biro Organisasi dan Sumber Daya Manusia',
      unit: 'Biro OSDM',
      level: 'Eselon II',
      isAvailable: false,
      description: 'Memimpin pengelolaan organisasi dan SDM BSSN',
      competencies: [
        { competencyName: 'Kepemimpinan', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Perencanaan Strategis', requiredLevel: 4, priority: 'HIGH' },
        { competencyName: 'Komunikasi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Kolaborasi', requiredLevel: 4, priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Kepala Biro Hukum dan Komunikasi Publik',
      unit: 'Biro Hukum dan Komunikasi Publik',
      level: 'Eselon II',
      isAvailable: true,
      description: 'Memimpin urusan hukum dan komunikasi publik BSSN',
      competencies: [
        { competencyName: 'Kepemimpinan', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Komunikasi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Public Speaking', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Negosiasi', requiredLevel: 4, priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Direktur Strategi Keamanan Siber dan Sandi',
      unit: 'Deputi Bidang Strategi dan Kebijakan',
      level: 'Eselon III',
      isAvailable: true,
      description: 'Mengelola strategi keamanan siber dan sandi nasional',
      competencies: [
        { competencyName: 'Keamanan Informasi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Perencanaan Strategis', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Kepemimpinan', requiredLevel: 4, priority: 'HIGH' },
        { competencyName: 'Risk Management', requiredLevel: 4, priority: 'HIGH' },
        { competencyName: 'Kriptografi', requiredLevel: 4, priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Direktur Operasi Keamanan Siber',
      unit: 'Deputi Bidang Operasi',
      level: 'Eselon III',
      isAvailable: true,
      description: 'Mengelola operasi keamanan siber',
      competencies: [
        { competencyName: 'Keamanan Informasi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Incident Response', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Network Security', requiredLevel: 4, priority: 'HIGH' },
        { competencyName: 'Kepemimpinan', requiredLevel: 4, priority: 'MEDIUM' },
        { competencyName: 'Manajemen Proyek', requiredLevel: 4, priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Kepala Pusat Sertifikasi Teknologi Keamanan Siber dan Sandi',
      unit: 'Pussertif',
      level: 'Eselon II',
      isAvailable: false,
      description: 'Memimpin pusat sertifikasi teknologi keamanan siber',
      competencies: [
        { competencyName: 'Keamanan Informasi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Kriptografi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Kepemimpinan', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Perencanaan Strategis', requiredLevel: 4, priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Kepala Pusat Data dan Teknologi Informasi Komunikasi',
      unit: 'Pusdatik',
      level: 'Eselon II',
      isAvailable: true,
      description: 'Memimpin pengelolaan data dan TIK BSSN',
      competencies: [
        { competencyName: 'Cloud Security', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Network Security', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Kepemimpinan', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Manajemen Proyek', requiredLevel: 4, priority: 'MEDIUM' },
      ],
    },
    {
      title: 'Kepala Balai Besar Sertifikasi Elektronik',
      unit: 'BSrE',
      level: 'Eselon II',
      isAvailable: true,
      description: 'Memimpin balai sertifikasi elektronik',
      competencies: [
        { competencyName: 'Kriptografi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Keamanan Informasi', requiredLevel: 5, priority: 'HIGH' },
        { competencyName: 'Kepemimpinan', requiredLevel: 4, priority: 'HIGH' },
        { competencyName: 'Digital Forensics', requiredLevel: 4, priority: 'MEDIUM' },
      ],
    },
  ];

  for (const job of jobPositions) {
    const { competencies: jobCompetencies, ...jobData } = job;
    
    const createdJob = await prisma.jobPosition.upsert({
      where: { title: job.title },
      update: {},
      create: jobData,
    });

    // Add competencies to job position
    for (const comp of jobCompetencies) {
      const competency = competencies.find(c => c.name === comp.competencyName);
      if (competency) {
        await prisma.jobPositionCompetency.upsert({
          where: {
            jobPositionId_competencyId: {
              jobPositionId: createdJob.id,
              competencyId: competency.id,
            },
          },
          update: {},
          create: {
            jobPositionId: createdJob.id,
            competencyId: competency.id,
            requiredLevel: comp.requiredLevel,
            priority: comp.priority,
          },
        });
      }
    }
  }

  console.log('✅ Job positions created');

  // Create Employee Users
  const employees = [
    {
      email: 'budi.santoso@bssn.go.id',
      name: 'Budi Santoso',
      nip: '198501012010011001',
      fullName: 'Budi Santoso, S.Kom, M.Kom',
      birthDate: new Date('1985-01-01'),
      birthPlace: 'Jakarta',
      gender: 'Laki-laki',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      phone: '081234567890',
      currentPosition: 'Kepala Seksi Keamanan Siber',
      unit: 'Deputi Bidang Operasi',
      golongan: 'IV/b',
      certifications: [
        {
          name: 'Certified Information Systems Security Professional (CISSP)',
          issuer: 'ISC2',
          issueDate: new Date('2020-06-15'),
          credential: 'CISSP-123456',
        },
        {
          name: 'Certified Ethical Hacker (CEH)',
          issuer: 'EC-Council',
          issueDate: new Date('2019-03-20'),
          credential: 'CEH-789012',
        },
      ],
      assignments: [
        {
          title: 'Tim Pengamanan Infrastruktur Kritis Nasional',
          description: 'Memimpin tim pengamanan infrastruktur kritis',
          location: 'Jakarta',
          startDate: new Date('2022-01-01'),
        },
        {
          title: 'Koordinator Incident Response Tim',
          description: 'Koordinasi respons insiden keamanan siber',
          location: 'Jakarta',
          startDate: new Date('2021-01-01'),
          endDate: new Date('2021-12-31'),
        },
      ],
      positionHistories: [
        {
          position: 'Kepala Seksi Keamanan Siber',
          unit: 'Deputi Bidang Operasi',
          startDate: new Date('2020-01-01'),
        },
        {
          position: 'Analis Keamanan Siber',
          unit: 'Deputi Bidang Operasi',
          startDate: new Date('2015-01-01'),
          endDate: new Date('2019-12-31'),
        },
      ],
      educationHistories: [
        {
          degree: 'S2 - Magister Komputer',
          institution: 'Universitas Indonesia',
          major: 'Keamanan Informasi',
          startYear: 2013,
          endYear: 2015,
          gpa: 3.8,
        },
        {
          degree: 'S1 - Sarjana Komputer',
          institution: 'Institut Teknologi Bandung',
          major: 'Teknik Informatika',
          startYear: 2003,
          endYear: 2007,
          gpa: 3.6,
        },
      ],
    },
    {
      email: 'siti.nurhaliza@bssn.go.id',
      name: 'Siti Nurhaliza',
      nip: '199002152015032001',
      fullName: 'Dr. Siti Nurhaliza, S.T, M.T',
      birthDate: new Date('1990-02-15'),
      birthPlace: 'Bandung',
      gender: 'Perempuan',
      address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
      phone: '081298765432',
      currentPosition: 'Kepala Sub Direktorat Kriptografi',
      unit: 'Pussertif',
      golongan: 'IV/a',
      certifications: [
        {
          name: 'Certified Information Security Manager (CISM)',
          issuer: 'ISACA',
          issueDate: new Date('2021-08-10'),
          credential: 'CISM-456789',
        },
        {
          name: 'Cryptography Specialist',
          issuer: 'SANS Institute',
          issueDate: new Date('2020-11-25'),
        },
      ],
      assignments: [
        {
          title: 'Implementasi Sistem Kriptografi Nasional',
          description: 'Memimpin implementasi standar kriptografi',
          location: 'Jakarta',
          startDate: new Date('2021-06-01'),
        },
      ],
      positionHistories: [
        {
          position: 'Kepala Sub Direktorat Kriptografi',
          unit: 'Pussertif',
          startDate: new Date('2021-01-01'),
        },
        {
          position: 'Peneliti Kriptografi',
          unit: 'Pussertif',
          startDate: new Date('2017-01-01'),
          endDate: new Date('2020-12-31'),
        },
      ],
      educationHistories: [
        {
          degree: 'S3 - Doktor',
          institution: 'Institut Teknologi Bandung',
          major: 'Kriptografi',
          startYear: 2018,
          endYear: 2022,
          gpa: 3.9,
        },
        {
          degree: 'S2 - Magister Teknik',
          institution: 'Institut Teknologi Bandung',
          major: 'Teknik Elektro',
          startYear: 2012,
          endYear: 2014,
          gpa: 3.85,
        },
        {
          degree: 'S1 - Sarjana Teknik',
          institution: 'Universitas Gadjah Mada',
          major: 'Teknik Elektro',
          startYear: 2008,
          endYear: 2012,
          gpa: 3.7,
        },
      ],
    },
    {
      email: 'ahmad.fauzi@bssn.go.id',
      name: 'Ahmad Fauzi',
      nip: '198803202012121001',
      fullName: 'Ahmad Fauzi, S.Kom, CISSP',
      birthDate: new Date('1988-03-20'),
      birthPlace: 'Surabaya',
      gender: 'Laki-laki',
      address: 'Jl. HR Rasuna Said No. 78, Jakarta Selatan',
      phone: '081387654321',
      currentPosition: 'Analis Keamanan Jaringan',
      unit: 'Pusdatik',
      golongan: 'III/d',
      certifications: [
        {
          name: 'Cisco Certified Network Professional (CCNP) Security',
          issuer: 'Cisco',
          issueDate: new Date('2019-05-12'),
          credential: 'CCNP-SEC-987654',
        },
        {
          name: 'CompTIA Security+',
          issuer: 'CompTIA',
          issueDate: new Date('2018-09-08'),
        },
      ],
      assignments: [
        {
          title: 'Audit Keamanan Jaringan Pemerintah',
          description: 'Audit keamanan infrastruktur jaringan instansi pemerintah',
          location: 'Multi-lokasi',
          startDate: new Date('2023-01-15'),
        },
      ],
      positionHistories: [
        {
          position: 'Analis Keamanan Jaringan',
          unit: 'Pusdatik',
          startDate: new Date('2018-01-01'),
        },
        {
          position: 'Administrator Jaringan',
          unit: 'Pusdatik',
          startDate: new Date('2012-06-01'),
          endDate: new Date('2017-12-31'),
        },
      ],
      educationHistories: [
        {
          degree: 'S1 - Sarjana Komputer',
          institution: 'Institut Teknologi Sepuluh Nopember',
          major: 'Teknik Informatika',
          startYear: 2006,
          endYear: 2010,
          gpa: 3.5,
        },
      ],
    },
    {
      email: 'dewi.lestari@bssn.go.id',
      name: 'Dewi Lestari',
      nip: '199205102017042001',
      fullName: 'Dewi Lestari, S.Si, M.Kom',
      birthDate: new Date('1992-05-10'),
      birthPlace: 'Yogyakarta',
      gender: 'Perempuan',
      address: 'Jl. Kuningan Raya No. 90, Jakarta Selatan',
      phone: '081276543210',
      currentPosition: 'Analis Digital Forensik',
      unit: 'Deputi Bidang Operasi',
      golongan: 'III/c',
      certifications: [
        {
          name: 'Certified Computer Forensics Examiner (CCFE)',
          issuer: 'IACIS',
          issueDate: new Date('2021-04-18'),
        },
        {
          name: 'EnCase Certified Examiner (EnCE)',
          issuer: 'OpenText',
          issueDate: new Date('2020-10-22'),
        },
      ],
      assignments: [
        {
          title: 'Investigasi Insiden Cyber Crime',
          description: 'Tim investigasi kasus cyber crime nasional',
          location: 'Jakarta',
          startDate: new Date('2022-07-01'),
        },
      ],
      positionHistories: [
        {
          position: 'Analis Digital Forensik',
          unit: 'Deputi Bidang Operasi',
          startDate: new Date('2019-01-01'),
        },
      ],
      educationHistories: [
        {
          degree: 'S2 - Magister Komputer',
          institution: 'Universitas Gadjah Mada',
          major: 'Ilmu Komputer',
          startYear: 2015,
          endYear: 2017,
          gpa: 3.75,
        },
        {
          degree: 'S1 - Sarjana Sains',
          institution: 'Universitas Gadjah Mada',
          major: 'Ilmu Komputer',
          startYear: 2010,
          endYear: 2014,
          gpa: 3.65,
        },
      ],
    },
    {
      email: 'ridwan.kamil@bssn.go.id',
      name: 'Ridwan Kamil',
      nip: '198707252013031001',
      fullName: 'Ridwan Kamil, S.Kom, M.M',
      birthDate: new Date('1987-07-25'),
      birthPlace: 'Medan',
      gender: 'Laki-laki',
      address: 'Jl. Thamrin No. 56, Jakarta Pusat',
      phone: '081365432109',
      currentPosition: 'Kepala Seksi Perencanaan',
      unit: 'Biro Perencanaan dan Keuangan',
      golongan: 'III/d',
      certifications: [
        {
          name: 'Project Management Professional (PMP)',
          issuer: 'PMI',
          issueDate: new Date('2020-02-14'),
          credential: 'PMP-112233',
        },
        {
          name: 'Certified Information Systems Auditor (CISA)',
          issuer: 'ISACA',
          issueDate: new Date('2019-07-30'),
        },
      ],
      assignments: [
        {
          title: 'Penyusunan Rencana Strategis BSSN 2024-2029',
          description: 'Tim penyusun renstra BSSN periode 2024-2029',
          location: 'Jakarta',
          startDate: new Date('2023-03-01'),
        },
      ],
      positionHistories: [
        {
          position: 'Kepala Seksi Perencanaan',
          unit: 'Biro Perencanaan dan Keuangan',
          startDate: new Date('2021-01-01'),
        },
        {
          position: 'Analis Perencanaan',
          unit: 'Biro Perencanaan dan Keuangan',
          startDate: new Date('2016-01-01'),
          endDate: new Date('2020-12-31'),
        },
      ],
      educationHistories: [
        {
          degree: 'S2 - Magister Manajemen',
          institution: 'Universitas Indonesia',
          major: 'Manajemen Strategis',
          startYear: 2014,
          endYear: 2016,
          gpa: 3.7,
        },
        {
          degree: 'S1 - Sarjana Komputer',
          institution: 'Universitas Sumatera Utara',
          major: 'Sistem Informasi',
          startYear: 2005,
          endYear: 2009,
          gpa: 3.55,
        },
      ],
    },
  ];

  for (const emp of employees) {
    const { certifications, assignments, positionHistories, educationHistories, ...empData } = emp;
    
    const user = await prisma.user.create({
      data: {
        email: empData.email,
        password: hashedPassword,
        name: empData.name,
        role: 'PEGAWAI',
      },
    });

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        nip: empData.nip,
        fullName: empData.fullName,
        birthDate: empData.birthDate,
        birthPlace: empData.birthPlace,
        gender: empData.gender,
        address: empData.address,
        phone: empData.phone,
        email: empData.email,
        currentPosition: empData.currentPosition,
        unit: empData.unit,
        golongan: empData.golongan,
      },
    });

    // Add certifications
    for (const cert of certifications) {
      await prisma.certification.create({
        data: {
          employeeId: employee.id,
          ...cert,
        },
      });
    }

    // Add assignments
    for (const assignment of assignments) {
      await prisma.assignment.create({
        data: {
          employeeId: employee.id,
          ...assignment,
        },
      });
    }

    // Add position histories
    for (const position of positionHistories) {
      await prisma.positionHistory.create({
        data: {
          employeeId: employee.id,
          ...position,
        },
      });
    }

    // Add education histories
    for (const education of educationHistories) {
      await prisma.educationHistory.create({
        data: {
          employeeId: employee.id,
          ...education,
        },
      });
    }
  }

  console.log('✅ Employees created');
  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('OSDM: osdm@bssn.go.id / password123');
  console.log('Pegawai 1: budi.santoso@bssn.go.id / password123');
  console.log('Pegawai 2: siti.nurhaliza@bssn.go.id / password123');
  console.log('Pegawai 3: ahmad.fauzi@bssn.go.id / password123');
  console.log('Pegawai 4: dewi.lestari@bssn.go.id / password123');
  console.log('Pegawai 5: ridwan.kamil@bssn.go.id / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

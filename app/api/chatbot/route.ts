import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get employee data with all relations
    const employee = await prisma.employee.findUnique({
      where: { id: session.user.employeeId },
      include: {
        certifications: true,
        assignments: true,
        positionHistories: {
          orderBy: { startDate: 'desc' },
          take: 5,
        },
        educationHistories: true,
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            assessmentItems: true,
          },
        },
        learningPaths: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            modules: true,
          },
        },
        jobMatches: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: {
            jobPosition: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee data not found' }, { status: 404 });
    }

    // Get available job positions
    const jobPositions = await prisma.jobPosition.findMany({
      where: { isAvailable: true },
      include: {
        competencies: {
          include: {
            competency: true,
          },
        },
      },
    });

    // Build comprehensive context about the employee
    const employeeContext = buildEmployeeContext(employee, jobPositions);

    // Create system prompt with employee context
    const systemPrompt = `Anda adalah AI Career Advisor untuk Sistem Manajemen Talenta ASN BSSN (Badan Siber dan Sandi Negara).

KONTEKS PEGAWAI:
${employeeContext}

PERAN ANDA:
1. Berikan saran pengembangan karir yang personal dan actionable
2. Analisis kekuatan dan area pengembangan pegawai
3. Rekomendasikan pelatihan, sertifikasi, atau learning path yang relevan
4. Bantu pegawai memahami posisi mereka di talent matrix (9-box)
5. Berikan motivasi dan arahan yang konstruktif
6. Jawab pertanyaan tentang pengembangan kompetensi dan karir

GAYA KOMUNIKASI:
- Ramah, profesional, dan supportif
- Gunakan bahasa Indonesia yang baik
- Berikan contoh konkret dan actionable steps
- Jika data pegawai kurang, akui keterbatasan dan berikan saran umum
- Fokus pada solusi dan pengembangan, bukan kritik

BATASAN:
- Jangan memberikan keputusan final tentang promosi atau mutasi (itu keputusan OSDM)
- Jangan membandingkan dengan pegawai lain secara negatif
- Jangan memberikan informasi yang tidak ada di database
- Fokus pada pengembangan diri pegawai`;

    // Build messages for OpenAI
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.';

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    
    // Fallback response if OpenAI fails
    return NextResponse.json({
      reply: 'Maaf, saya mengalami kendala teknis. Silakan coba lagi dalam beberapa saat atau hubungi OSDM untuk konsultasi langsung.',
      error: true,
      timestamp: new Date().toISOString(),
    });
  }
}

function buildEmployeeContext(employee: any, jobPositions: any[]): string {
  let context = `
PROFIL PEGAWAI:
- Nama: ${employee.fullName}
- NIP: ${employee.nip}
- Jabatan Saat Ini: ${employee.currentPosition || 'Belum ada data'}
- Unit: ${employee.unit || 'Belum ada data'}
- Golongan: ${employee.golongan || 'Belum ada data'}
`;

  // Education
  if (employee.educationHistories?.length > 0) {
    context += '\nRIWAYAT PENDIDIKAN:\n';
    employee.educationHistories.forEach((edu: any) => {
      context += `- ${edu.degree} - ${edu.institution} (${edu.major || 'N/A'}) - ${edu.startYear} - ${edu.endYear || 'Sekarang'}${edu.gpa ? `, IPK: ${edu.gpa}` : ''}\n`;
    });
  }

  // Certifications
  if (employee.certifications?.length > 0) {
    context += '\nSERTIFIKASI:\n';
    employee.certifications.forEach((cert: any) => {
      context += `- ${cert.name} (${cert.issuer}) - ${new Date(cert.issueDate).getFullYear()}\n`;
    });
  } else {
    context += '\nSERTIFIKASI: Belum ada sertifikasi tercatat\n';
  }

  // Position History
  if (employee.positionHistories?.length > 0) {
    context += '\nRIWAYAT JABATAN (5 Terakhir):\n';
    employee.positionHistories.forEach((pos: any) => {
      context += `- ${pos.position} di ${pos.unit || 'N/A'} (${new Date(pos.startDate).getFullYear()} - ${pos.endDate ? new Date(pos.endDate).getFullYear() : 'Sekarang'})\n`;
    });
  }

  // Assignments
  if (employee.assignments?.length > 0) {
    context += '\nPENUGASAN:\n';
    employee.assignments.forEach((assign: any) => {
      context += `- ${assign.title} di ${assign.location || 'N/A'}\n`;
    });
  }

  // Assessment (9-box)
  if (employee.assessments?.length > 0) {
    const assessment = employee.assessments[0];
    context += '\nPENILAIAN KINERJA & POTENSI:\n';
    context += `- Total Kinerja (Sumbu Y): ${assessment.totalKinerja.toFixed(1)}\n`;
    context += `- Total Potensi (Sumbu X): ${assessment.totalPotensial.toFixed(1)}\n`;
    context += `- Overall Score: ${assessment.overallScore.toFixed(1)}\n`;
    context += `- Posisi 9-Box: Kotak ${assessment.boxNumber}\n`;
    if (assessment.boxDescription) {
      context += `- Kategori: ${assessment.boxDescription}\n`;
    }
    if (assessment.recommendations) {
      try {
        const recs = JSON.parse(assessment.recommendations);
        context += '- Rekomendasi Pengembangan:\n';
        recs.forEach((rec: string) => {
          context += `  * ${rec}\n`;
        });
      } catch (e) {
        // ignore
      }
    }
  } else {
    context += '\nPENILAIAN KINERJA & POTENSI: Belum ada penilaian\n';
  }

  // Learning Path
  if (employee.learningPaths?.length > 0) {
    const learningPath = employee.learningPaths[0];
    context += '\nLEARNING PATH:\n';
    context += `- Judul: ${learningPath.title}\n`;
    if (learningPath.modules?.length > 0) {
      context += '- Modul:\n';
      learningPath.modules.forEach((module: any) => {
        context += `  * ${module.title} (Status: ${module.status})\n`;
      });
    }
  } else {
    context += '\nLEARNING PATH: Belum ada learning path\n';
  }

  // Job Matches
  if (employee.jobMatches?.length > 0) {
    context += '\nANALISIS KECOCOKAN JABATAN (3 Terakhir):\n';
    employee.jobMatches.forEach((match: any) => {
      context += `- ${match.jobPosition.title}: ${match.matchScore}% match\n`;
      if (match.analysis) {
        context += `  Analisis: ${match.analysis.substring(0, 200)}...\n`;
      }
    });
  }

  // Available job positions
  if (jobPositions.length > 0) {
    context += '\nJABATAN YANG TERSEDIA:\n';
    jobPositions.slice(0, 5).forEach((job: any) => {
      context += `- ${job.title} (${job.unit}) - Level: ${job.level || 'N/A'}\n`;
      if (job.competencies?.length > 0) {
        const topComps = job.competencies.slice(0, 3);
        context += `  Kompetensi: ${topComps.map((jc: any) => jc.competency.name).join(', ')}\n`;
      }
    });
  }

  return context;
}

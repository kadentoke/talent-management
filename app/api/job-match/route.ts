import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, jobPositionId } = await req.json();

    // Check authorization: OSDM can analyze anyone, PEGAWAI can only analyze themselves
    if (session.user.role === 'PEGAWAI' && session.user.employeeId !== employeeId) {
      return NextResponse.json({ error: 'You can only analyze your own profile' }, { status: 403 });
    }

    // Fetch employee data
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        certifications: true,
        assignments: true,
        positionHistories: true,
        educationHistories: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Fetch job position with competencies
    const jobPosition = await prisma.jobPosition.findUnique({
      where: { id: jobPositionId },
      include: {
        competencies: {
          include: {
            competency: true,
          },
        },
      },
    });

    if (!jobPosition) {
      return NextResponse.json({ error: 'Job position not found' }, { status: 404 });
    }

    // Prepare data for AI analysis
    const employeeProfile = {
      name: employee.fullName,
      currentPosition: employee.currentPosition,
      unit: employee.unit,
      golongan: employee.golongan,
      certifications: employee.certifications.map((c: any) => ({
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate,
      })),
      assignments: employee.assignments.map((a: any) => ({
        title: a.title,
        description: a.description,
        duration: a.endDate ? 
          `${a.startDate.toISOString().split('T')[0]} - ${a.endDate.toISOString().split('T')[0]}` :
          `${a.startDate.toISOString().split('T')[0]} - Present`,
      })),
      positionHistories: employee.positionHistories.map((p: any) => ({
        position: p.position,
        unit: p.unit,
        duration: p.endDate ?
          `${p.startDate.toISOString().split('T')[0]} - ${p.endDate.toISOString().split('T')[0]}` :
          `${p.startDate.toISOString().split('T')[0]} - Present`,
      })),
      educationHistories: employee.educationHistories.map((e: any) => ({
        degree: e.degree,
        institution: e.institution,
        major: e.major,
        years: `${e.startYear} - ${e.endYear || 'Present'}`,
        gpa: e.gpa,
      })),
    };

    const jobRequirements = {
      title: jobPosition.title,
      unit: jobPosition.unit,
      level: jobPosition.level,
      description: jobPosition.description,
      requiredCompetencies: jobPosition.competencies.map((jc: any) => ({
        name: jc.competency.name,
        category: jc.competency.category,
        description: jc.competency.description,
        requiredLevel: jc.requiredLevel,
        priority: jc.priority,
      })),
    };

    // Call OpenAI API for matching analysis
    const prompt = `Anda adalah sistem analisis kesesuaian kandidat untuk jabatan ASN di BSSN (Badan Siber dan Sandi Negara).

Analisis kesesuaian kandidat berikut dengan jabatan yang tersedia:

PROFIL KANDIDAT:
${JSON.stringify(employeeProfile, null, 2)}

JABATAN YANG DIANALISIS:
${JSON.stringify(jobRequirements, null, 2)}

Berikan analisis dalam format JSON dengan struktur berikut:
{
  "matchScore": <angka 0-100>,
  "summary": "<ringkasan kesesuaian dalam 2-3 kalimat>",
  "strengths": [
    "<kekuatan 1>",
    "<kekuatan 2>",
    ...
  ],
  "gaps": [
    "<gap 1>",
    "<gap 2>",
    ...
  ],
  "recommendation": "<rekomendasi apakah kandidat cocok untuk jabatan ini>"
}

Pertimbangkan:
1. Pengalaman kerja dan jabatan sebelumnya
2. Sertifikasi yang dimiliki
3. Pendidikan formal
4. Penugasan yang pernah dilakukan
5. Kompetensi yang dibutuhkan untuk jabatan

Berikan skor yang objektif dan realistis.`;

    if (!process.env.OPENAI_API_KEY) {
      // Fallback if no API key
      const mockAnalysis = {
        matchScore: 75,
        summary: `${employee.fullName} memiliki kualifikasi yang baik untuk jabatan ${jobPosition.title}. Dengan pengalaman di ${employee.unit} dan sertifikasi yang relevan, kandidat menunjukkan potensi yang kuat.`,
        strengths: [
          `Pengalaman ${employee.positionHistories.length} posisi sebelumnya`,
          `Memiliki ${employee.certifications.length} sertifikasi profesional`,
          `Pendidikan ${employee.educationHistories[0]?.degree || 'formal'} yang relevan`,
        ],
        gaps: [
          'Perlu pengalaman lebih di level strategis',
          'Dapat ditingkatkan dengan pelatihan kepemimpinan',
        ],
        recommendation: 'Direkomendasikan dengan catatan perlu pengembangan kompetensi strategis',
      };

      const jobMatch = await prisma.jobMatch.upsert({
        where: {
          employeeId_jobPositionId: {
            employeeId,
            jobPositionId,
          },
        },
        update: {
          matchScore: mockAnalysis.matchScore,
          analysis: mockAnalysis.summary,
          strengths: JSON.stringify(mockAnalysis.strengths),
          gaps: JSON.stringify(mockAnalysis.gaps),
        },
        create: {
          employeeId,
          jobPositionId,
          matchScore: mockAnalysis.matchScore,
          analysis: mockAnalysis.summary,
          strengths: JSON.stringify(mockAnalysis.strengths),
          gaps: JSON.stringify(mockAnalysis.gaps),
        },
      });

      return NextResponse.json({
        matchScore: mockAnalysis.matchScore,
        summary: mockAnalysis.summary,
        strengths: mockAnalysis.strengths,
        gaps: mockAnalysis.gaps,
        recommendation: mockAnalysis.recommendation,
        jobMatch,
        note: 'Using mock analysis (OpenAI API key not configured)',
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst for government positions in Indonesia, specializing in cybersecurity and encryption fields.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      console.log('OpenAI Analysis Result:', analysis);

      // Save job match to database
      const jobMatch = await prisma.jobMatch.upsert({
        where: {
          employeeId_jobPositionId: {
            employeeId,
            jobPositionId,
          },
        },
        update: {
          matchScore: analysis.matchScore,
          analysis: analysis.summary,
          strengths: JSON.stringify(analysis.strengths),
          gaps: JSON.stringify(analysis.gaps),
        },
        create: {
          employeeId,
          jobPositionId,
          matchScore: analysis.matchScore,
          analysis: analysis.summary,
          strengths: JSON.stringify(analysis.strengths),
          gaps: JSON.stringify(analysis.gaps),
        },
        include: {
          employee: true,
          jobPosition: true,
        },
      });

      return NextResponse.json({
        matchScore: analysis.matchScore,
        summary: analysis.summary,
        strengths: analysis.strengths,
        gaps: analysis.gaps,
        recommendation: analysis.recommendation,
        jobMatch,
      });
    } catch (openaiError: any) {
      console.error('OpenAI API Error:', openaiError);
      
      // Fallback to mock analysis if OpenAI fails
      const mockAnalysis = {
        matchScore: Math.floor(Math.random() * 30) + 50, // Random 50-80
        summary: `Analisis untuk ${employee.fullName} pada jabatan ${jobPosition.title}. Berdasarkan data yang tersedia, kandidat memiliki ${employee.certifications.length} sertifikasi dan ${employee.positionHistories.length} pengalaman jabatan.`,
        strengths: [
          employee.certifications.length > 0 ? `Memiliki ${employee.certifications.length} sertifikasi yang relevan` : 'Bersedia mengembangkan kompetensi',
          employee.positionHistories.length > 0 ? `Pengalaman di ${employee.positionHistories.length} posisi berbeda` : 'Potensi untuk berkembang',
          employee.educationHistories.length > 0 ? `Pendidikan ${employee.educationHistories[0]?.degree || 'formal'}` : 'Latar belakang pendidikan',
        ].filter(Boolean),
        gaps: [
          'Perlu menyesuaikan dengan standar kompetensi jabatan',
          'Dapat ditingkatkan melalui pelatihan dan pengembangan',
        ],
        recommendation: `Kandidat memiliki potensi untuk jabatan ini dengan pengembangan kompetensi yang sesuai. (Note: AI analysis failed, using fallback)`,
      };

      const jobMatch = await prisma.jobMatch.upsert({
        where: {
          employeeId_jobPositionId: {
            employeeId,
            jobPositionId,
          },
        },
        update: {
          matchScore: mockAnalysis.matchScore,
          analysis: mockAnalysis.summary,
          strengths: JSON.stringify(mockAnalysis.strengths),
          gaps: JSON.stringify(mockAnalysis.gaps),
        },
        create: {
          employeeId,
          jobPositionId,
          matchScore: mockAnalysis.matchScore,
          analysis: mockAnalysis.summary,
          strengths: JSON.stringify(mockAnalysis.strengths),
          gaps: JSON.stringify(mockAnalysis.gaps),
        },
      });

      return NextResponse.json({
        matchScore: mockAnalysis.matchScore,
        summary: mockAnalysis.summary,
        strengths: mockAnalysis.strengths,
        gaps: mockAnalysis.gaps,
        recommendation: mockAnalysis.recommendation,
        jobMatch,
        note: `Fallback analysis (OpenAI error: ${openaiError.message})`,
      });
    }
  } catch (error) {
    console.error('Error analyzing job match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobPositionId = searchParams.get('jobPositionId');
    const minScore = searchParams.get('minScore');

    let where: any = {};

    // PEGAWAI can only see their own matches, OSDM can see all
    if (session.user.role === 'PEGAWAI') {
      where.employeeId = session.user.employeeId;
    }

    if (jobPositionId) {
      where.jobPositionId = jobPositionId;
    }

    if (minScore) {
      where.matchScore = {
        gte: parseFloat(minScore),
      };
    }

    const jobMatches = await prisma.jobMatch.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        jobPosition: true,
      },
      orderBy: {
        matchScore: 'desc',
      },
    });

    return NextResponse.json(jobMatches);
  } catch (error) {
    console.error('Error fetching job matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

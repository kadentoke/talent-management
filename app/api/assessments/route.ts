import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch assessments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year');

    let where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (year) {
      where.year = parseInt(year);
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        assessmentItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            nip: true,
            currentPosition: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      employeeId,
      year,
      period,
      totalKinerja,
      totalPotensial,
      overallScore,
      boxNumber,
      boxDescription,
      recommendations,
      assessmentItems,
    } = body;

    // Create assessment with items
    const assessment = await prisma.assessment.create({
      data: {
        employeeId,
        year,
        period: period || null,
        totalKinerja,
        totalPotensial,
        overallScore,
        boxNumber,
        boxDescription: boxDescription || null,
        recommendations: recommendations ? JSON.stringify(recommendations) : null,
        createdBy: session.user.id,
        assessmentItems: {
          create: assessmentItems.map((item: any, index: number) => ({
            type: item.type,
            parameter: item.parameter,
            komponen: item.komponen,
            bobotKomponen: item.bobotKomponen,
            indikator: item.indikator,
            bobotIndikator: item.bobotIndikator,
            nilai: item.nilai,
            overallPct: item.overallPct,
            contribValue: item.contribValue,
          })),
        },
      },
      include: {
        assessmentItems: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            nip: true,
          },
        },
      },
    });

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Assessment sudah ada untuk pegawai ini di periode yang sama' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}

// PUT - Update assessment
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      totalKinerja,
      totalPotensial,
      overallScore,
      boxNumber,
      boxDescription,
      recommendations,
      assessmentItems,
    } = body;

    // Delete existing items and create new ones
    await prisma.assessmentItem.deleteMany({
      where: { assessmentId: id },
    });

    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        totalKinerja,
        totalPotensial,
        overallScore,
        boxNumber,
        boxDescription: boxDescription || null,
        recommendations: recommendations ? JSON.stringify(recommendations) : null,
        assessmentItems: {
          create: assessmentItems.map((item: any) => ({
            type: item.type,
            parameter: item.parameter,
            komponen: item.komponen,
            bobotKomponen: item.bobotKomponen,
            indikator: item.indikator,
            bobotIndikator: item.bobotIndikator,
            nilai: item.nilai,
            overallPct: item.overallPct,
            contribValue: item.contribValue,
          })),
        },
      },
      include: {
        assessmentItems: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            nip: true,
          },
        },
      },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete assessment
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only OSDM can delete
    if (session.user.role !== 'OSDM') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    await prisma.assessment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}

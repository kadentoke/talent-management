import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const available = searchParams.get('available');

    let where: any = {};
    if (available === 'true') {
      where.isAvailable = true;
    }

    if (id) {
      const jobPosition = await prisma.jobPosition.findUnique({
        where: { id },
        include: {
          competencies: {
            include: {
              competency: true,
            },
          },
        },
      });

      return NextResponse.json(jobPosition);
    }

    const jobPositions = await prisma.jobPosition.findMany({
      where,
      include: {
        competencies: {
          include: {
            competency: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return NextResponse.json(jobPositions);
  } catch (error) {
    console.error('Error fetching job positions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OSDM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { competencies, ...jobData } = data;

    const jobPosition = await prisma.jobPosition.create({
      data: {
        ...jobData,
        competencies: {
          create: competencies?.map((c: any) => ({
            competencyId: c.competencyId,
            requiredLevel: c.requiredLevel,
            priority: c.priority,
          })) || [],
        },
      },
      include: {
        competencies: {
          include: {
            competency: true,
          },
        },
      },
    });

    return NextResponse.json(jobPosition);
  } catch (error) {
    console.error('Error creating job position:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OSDM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { id, competencies, ...jobData } = data;

    // Delete existing competencies
    await prisma.jobPositionCompetency.deleteMany({
      where: { jobPositionId: id },
    });

    // Update job position with new competencies
    const jobPosition = await prisma.jobPosition.update({
      where: { id },
      data: {
        ...jobData,
        competencies: {
          create: competencies?.map((c: any) => ({
            competencyId: c.competencyId,
            requiredLevel: c.requiredLevel,
            priority: c.priority,
          })) || [],
        },
      },
      include: {
        competencies: {
          include: {
            competency: true,
          },
        },
      },
    });

    return NextResponse.json(jobPosition);
  } catch (error) {
    console.error('Error updating job position:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OSDM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.jobPosition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job position:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

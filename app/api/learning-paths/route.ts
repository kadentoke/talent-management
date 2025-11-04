import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch learning paths
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const id = searchParams.get('id');

    if (id) {
      // Get specific learning path
      const learningPath = await prisma.learningPath.findUnique({
        where: { id },
        include: {
          modules: {
            orderBy: {
              order: 'asc',
            },
          },
          employee: {
            select: {
              id: true,
              fullName: true,
              nip: true,
            },
          },
        },
      });

      return NextResponse.json(learningPath);
    }

    // Get all learning paths for employee
    let where: any = {};
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const learningPaths = await prisma.learningPath.findMany({
      where,
      include: {
        modules: {
          orderBy: {
            order: 'asc',
          },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            nip: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(learningPaths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    );
  }
}

// POST - Create new learning path
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      employeeId,
      title,
      description,
      basedOnBox,
      year,
      modules,
    } = body;

    const learningPath = await prisma.learningPath.create({
      data: {
        employeeId,
        title,
        description: description || null,
        basedOnBox: basedOnBox || null,
        year: year || new Date().getFullYear(),
        modules: {
          create: modules?.map((module: any, index: number) => ({
            title: module.title,
            description: module.description || null,
            status: module.status || 'not-started',
            notes: module.notes || null,
            targetDate: module.targetDate ? new Date(module.targetDate) : null,
            order: module.order ?? index,
          })) || [],
        },
      },
      include: {
        modules: {
          orderBy: {
            order: 'asc',
          },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            nip: true,
          },
        },
      },
    });

    return NextResponse.json(learningPath);
  } catch (error) {
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path' },
      { status: 500 }
    );
  }
}

// PUT - Update learning path
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      modules,
    } = body;

    // Delete existing modules and create new ones
    await prisma.learningModule.deleteMany({
      where: { learningPathId: id },
    });

    const learningPath = await prisma.learningPath.update({
      where: { id },
      data: {
        title,
        description: description || null,
        modules: {
          create: modules?.map((module: any, index: number) => ({
            title: module.title,
            description: module.description || null,
            status: module.status || 'not-started',
            notes: module.notes || null,
            targetDate: module.targetDate ? new Date(module.targetDate) : null,
            completedDate: module.completedDate ? new Date(module.completedDate) : null,
            order: module.order ?? index,
          })) || [],
        },
      },
      include: {
        modules: {
          orderBy: {
            order: 'asc',
          },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            nip: true,
          },
        },
      },
    });

    return NextResponse.json(learningPath);
  } catch (error) {
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to update learning path' },
      { status: 500 }
    );
  }
}

// PATCH - Update specific module status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      moduleId,
      status,
      notes,
      targetDate,
      completedDate,
    } = body;

    const module = await prisma.learningModule.update({
      where: { id: moduleId },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(completedDate !== undefined && { completedDate: completedDate ? new Date(completedDate) : null }),
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: 'Failed to update module' },
      { status: 500 }
    );
  }
}

// DELETE - Delete learning path
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Learning path ID required' }, { status: 400 });
    }

    await prisma.learningPath.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    return NextResponse.json(
      { error: 'Failed to delete learning path' },
      { status: 500 }
    );
  }
}

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

    if (id) {
      // Get specific employee
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              role: true,
            },
          },
          certifications: {
            orderBy: { issueDate: 'desc' },
          },
          assignments: {
            orderBy: { startDate: 'desc' },
          },
          positionHistories: {
            orderBy: { startDate: 'desc' },
          },
          educationHistories: {
            orderBy: { startYear: 'desc' },
          },
        },
      });

      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }

      // Pegawai can only see their own data
      if (session.user.role === 'PEGAWAI' && employee.id !== session.user.employeeId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(employee);
    } else {
      // Get all employees (OSDM only)
      if (session.user.role !== 'OSDM') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const employees = await prisma.employee.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          certifications: true,
          assignments: true,
          positionHistories: true,
          educationHistories: true,
        },
        orderBy: {
          fullName: 'asc',
        },
      });

      return NextResponse.json(employees);
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    // If the database is unavailable during development, return an empty list
    // so the frontend doesn't crash on employees.map. This makes the UI
    // degrade gracefully while the DB is down. For real outages, consider
    // surfacing a proper error message to OSDM users.
    const e: any = error;
    if (e && (e.name === 'PrismaClientInitializationError' || (e.message && String(e.message).includes("Can't reach database server")))) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { id, ...updateData } = data;

    // Pegawai can only update their own data via change request
    if (session.user.role === 'PEGAWAI') {
      return NextResponse.json({ error: 'Use change request API' }, { status: 403 });
    }

    // OSDM can update directly
    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        certifications: true,
        assignments: true,
        positionHistories: true,
        educationHistories: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

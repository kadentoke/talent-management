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
    const status = searchParams.get('status');

    let where: any = {};

    if (session.user.role === 'PEGAWAI') {
      where.employeeId = session.user.employeeId;
    }

    if (status) {
      where.status = status;
    }

    const changeRequests = await prisma.changeRequest.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(changeRequests);
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'PEGAWAI') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { type, newData, oldData, reason } = data;

    const changeRequest = await prisma.changeRequest.create({
      data: {
        employeeId: session.user.employeeId!,
        type,
        newData: JSON.stringify(newData),
        oldData: oldData ? JSON.stringify(oldData) : null,
        reason,
        status: 'PENDING',
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(changeRequest);
  } catch (error) {
    console.error('Error creating change request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'OSDM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { id, status, reviewNote } = data;

    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!changeRequest) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }

    // Update change request
    const updatedRequest = await prisma.changeRequest.update({
      where: { id },
      data: {
        status,
        reviewNote,
        reviewedBy: session.user.name,
        reviewedAt: new Date(),
      },
    });

    // If approved, apply the changes
    if (status === 'APPROVED') {
      const newData = JSON.parse(changeRequest.newData);

      switch (changeRequest.type) {
        case 'PROFILE':
          await prisma.employee.update({
            where: { id: changeRequest.employeeId },
            data: newData,
          });
          break;

        case 'CERTIFICATION':
          if (newData.id) {
            // Update existing
            await prisma.certification.update({
              where: { id: newData.id },
              data: newData,
            });
          } else {
            // Create new
            await prisma.certification.create({
              data: {
                ...newData,
                employeeId: changeRequest.employeeId,
              },
            });
          }
          break;

        case 'ASSIGNMENT':
          if (newData.id) {
            await prisma.assignment.update({
              where: { id: newData.id },
              data: newData,
            });
          } else {
            await prisma.assignment.create({
              data: {
                ...newData,
                employeeId: changeRequest.employeeId,
              },
            });
          }
          break;

        case 'POSITION_HISTORY':
          if (newData.id) {
            await prisma.positionHistory.update({
              where: { id: newData.id },
              data: newData,
            });
          } else {
            await prisma.positionHistory.create({
              data: {
                ...newData,
                employeeId: changeRequest.employeeId,
              },
            });
          }
          break;

        case 'EDUCATION':
          if (newData.id) {
            await prisma.educationHistory.update({
              where: { id: newData.id },
              data: newData,
            });
          } else {
            await prisma.educationHistory.create({
              data: {
                ...newData,
                employeeId: changeRequest.employeeId,
              },
            });
          }
          break;
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating change request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

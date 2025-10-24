import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          organizationName: 'Diskominfo Tanah Bumbu',
          pageTitle: 'Diskominfo Kabupaten Tanah Bumbu',
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal memuat pengaturan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    const adminToken = request.cookies.get('admin_token')?.value;
    const token = sessionToken || adminToken;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifySession(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { logoUrl, organizationName, pageTitle, welcomeText } = body;

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        ...(logoUrl !== undefined && { logoUrl }),
        ...(organizationName && { organizationName }),
        ...(pageTitle && { pageTitle }),
        ...(welcomeText !== undefined && { welcomeText }),
      },
      create: {
        id: 1,
        logoUrl: logoUrl || null,
        organizationName: organizationName || 'Diskominfo Tanah Bumbu',
        pageTitle: pageTitle || 'Diskominfo Kabupaten Tanah Bumbu',
        welcomeText: welcomeText || null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan',
      data: settings
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan pengaturan' },
      { status: 500 }
    );
  }
}

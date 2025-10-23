import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

// GET - Get settings (public access)
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          organizationName: 'Diskominfo Tanah Bumbu',
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error: any) {
    console.error('[ERROR] Get settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifySession(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { logoUrl, organizationName, welcomeText } = body;

    // Update or create settings
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        ...(logoUrl !== undefined && { logoUrl }),
        ...(organizationName && { organizationName }),
        ...(welcomeText !== undefined && { welcomeText }),
      },
      create: {
        id: 1,
        logoUrl: logoUrl || null,
        organizationName: organizationName || 'Diskominfo Tanah Bumbu',
        welcomeText: welcomeText || null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });

  } catch (error: any) {
    console.error('[ERROR] Update settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

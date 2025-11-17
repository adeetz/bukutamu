import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { validateBukuTamuInput } from '@/lib/security';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const entryId = parseInt(id);

    if (isNaN(entryId)) {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validasi dan sanitasi input
    const validation = validateBukuTamuInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Data tidak valid', errors: validation.errors },
        { status: 400 }
      );
    }

    const sanitizedData = validation.sanitized!;

    // Check if entry exists
    const entry = await prisma.bukuTamu.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check for duplicate (excluding current entry)
    const existingEntry = await prisma.bukuTamu.findFirst({
      where: {
        id: { not: entryId },
        nama: sanitizedData.nama,
        instansi: sanitizedData.instansi,
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { 
          error: 'Data duplikat',
          detail: 'Sudah ada tamu dengan nama dan instansi yang sama'
        },
        { status: 409 }
      );
    }

    // Update entry
    const updatedEntry = await prisma.bukuTamu.update({
      where: { id: entryId },
      data: {
        nama: sanitizedData.nama,
        alamat: sanitizedData.alamat,
        instansi: sanitizedData.instansi,
        keperluan: sanitizedData.keperluan,
        fotoUrl: sanitizedData.fotoUrl,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate data' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const entryId = parseInt(id);

    if (isNaN(entryId)) {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, diarahkanKe, catatanBupati } = body;
    
    // Validasi status
    const validStatuses = ['MENUNGGU', 'DIARAHKAN', 'SELESAI', 'DITOLAK'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Check if entry exists
    const entry = await prisma.bukuTamu.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update data
    const updatedEntry = await prisma.bukuTamu.update({
      where: { id: entryId },
      data: {
        status,
        diarahkanKe: diarahkanKe || null,
        catatanBupati: catatanBupati || null,
      }
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const entryId = parseInt(id);

    if (isNaN(entryId)) {
      return NextResponse.json(
        { error: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Check if entry exists
    const entry = await prisma.bukuTamu.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete entry
    await prisma.bukuTamu.delete({
      where: { id: entryId },
    });

    return NextResponse.json({
      success: true,
      message: 'Data berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}

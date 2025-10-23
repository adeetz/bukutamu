import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Gagal logout' },
      { status: 500 }
    );
  }
}

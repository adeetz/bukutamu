export interface BukuTamu {
  id: number;
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  whatsapp: string;
  tempatKunjungan: string;
  tanggalKunjungan: string;
  jamKunjungan: string;
  status: StatusTamu;
  catatanBupati: string | null;
  diarahkanKe: string | null;
  fotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN_BUPATI = 'ADMIN_BUPATI',
  BUPATI = 'BUPATI',
  STAFF = 'STAFF',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum StatusTamu {
  DAFTAR_BARU = 'DAFTAR_BARU',
  SEDANG_KONTAK = 'SEDANG_KONTAK',
  DIKONFIRMASI = 'DIKONFIRMASI',
  DIJADWALKAN = 'DIJADWALKAN',
  SEDANG_BERKUNJUNG = 'SEDANG_BERKUNJUNG',
  DIARAHKAN = 'DIARAHKAN',
  SELESAI = 'SELESAI',
  DIBATALKAN = 'DIBATALKAN'
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FormData {
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  whatsapp: string;
  tempatKunjungan: string;
  tanggalKunjungan: string;
  jamKunjungan: string;
  fotoUrl: string;
}

export enum KeperluanCategory {
  BUPATI_ONLY = 'BUPATI_ONLY',
  DAPAT_DIDELEGASI = 'DAPAT_DIDELEGASI',
  INFORMASI_SAJA = 'INFORMASI_SAJA',
  KOMPLAIN = 'KOMPLAIN',
  INVESTASI = 'INVESTASI',
  RUTIN = 'RUTIN'
}

export enum PriorityLevel {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}

export interface BukuTamuEnhanced extends BukuTamu {
  category?: KeperluanCategory;
  priority?: PriorityLevel;
  estimatedDuration?: number; // in minutes
  adminNotes?: string;
  scheduledAt?: string;
  contactedAt?: string;
  confirmedAt?: string;
  lastContactMethod?: 'whatsapp' | 'phone' | 'email';
}

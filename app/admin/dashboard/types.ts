// Types untuk Dashboard
export enum StatusTamu {
  MENUNGGU = 'MENUNGGU',
  DIARAHKAN = 'DIARAHKAN',
  SELESAI = 'SELESAI',
  DITOLAK = 'DITOLAK'
}

export enum UserRole {
  ADMIN_BUPATI = 'ADMIN_BUPATI',
  BUPATI = 'BUPATI'
}

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

export interface FormData {
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  fotoUrl?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

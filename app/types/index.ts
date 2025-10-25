export interface BukuTamu {
  id: number;
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  fotoUrl: string | null;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
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
  fotoUrl: string;
}

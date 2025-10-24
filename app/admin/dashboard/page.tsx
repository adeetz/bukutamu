'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface BukuTamu {
  id: number;
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  fotoUrl: string | null;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  name: string;
}

interface FormData {
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  fotoUrl?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<BukuTamu[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    alamat: '',
    instansi: '',
    keperluan: '',
    fotoUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchData();
  }, [pagination.page, search]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/buku-tamu?${params}`);
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading('Mengekspor data...');
      
      // Fetch all data without pagination
      const response = await fetch('/api/buku-tamu?limit=10000');
      const result = await response.json();
      const allData = result.data;

      // Format data untuk export
      const exportData = allData.map((item: BukuTamu, index: number) => ({
        No: index + 1,
        Nama: item.nama,
        Alamat: item.alamat,
        Instansi: item.instansi,
        Keperluan: item.keperluan,
        'Tanggal Kunjungan': new Date(item.createdAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      // Create workbook dan worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Buku Tamu');

      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `buku-tamu-${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      toast.dismiss();
      toast.success(`Data berhasil diekspor ke ${filename}`);
    } catch (error) {
      toast.dismiss();
      toast.error('Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenModal = (item?: BukuTamu) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nama: item.nama,
        alamat: item.alamat,
        instansi: item.instansi,
        keperluan: item.keperluan,
        fotoUrl: item.fotoUrl || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: '',
        alamat: '',
        instansi: '',
        keperluan: '',
        fotoUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nama: '',
      alamat: '',
      instansi: '',
      keperluan: '',
      fotoUrl: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/buku-tamu/${editingId}`
        : '/api/buku-tamu';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan data');
      }

      if (editingId) {
        toast.success('Data berhasil diupdate!');
      } else {
        toast.success('Data berhasil ditambahkan!');
      }

      handleCloseModal();
      fetchData();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/buku-tamu/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus data');
      }

      setData(data.filter((item) => item.id !== id));
      toast.success('Data berhasil dihapus!');
    } catch (error) {
      toast.error('Gagal menghapus data. Silakan coba lagi.');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const renderSkeleton = () => (
    <div className="glass-effect rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Foto</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Nama</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Instansi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Alamat</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Keperluan</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-56"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8 animate-fade-in">
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-2">
              🎯 Admin Dashboard
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Selamat datang, <span className="font-semibold">{user.name}</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {pagination.total} Total Pengunjung
              </span>
            </div>
          </div>

          {/* Action Buttons - Mobile Friendly Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <button
              onClick={() => handleOpenModal()}
              className="w-full px-4 py-3 sm:py-3.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
            >
              <span className="block sm:inline">➕</span>
              <span className="block sm:inline sm:ml-1">Tambah Data</span>
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full px-4 py-3 sm:py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="block sm:inline">{exporting ? '⏳' : '📥'}</span>
              <span className="block sm:inline sm:ml-1">{exporting ? 'Export...' : 'Export Excel'}</span>
            </button>
            <button
              onClick={() => window.open('/display', '_blank')}
              className="w-full px-4 py-3 sm:py-3.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
              title="Buka tampilan TV/Monitor untuk tamu"
            >
              <span className="block sm:inline">📺</span>
              <span className="block sm:inline sm:ml-1">Tampilan TV</span>
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="w-full px-4 py-3 sm:py-3.5 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
            >
              <span className="block sm:inline">⚙️</span>
              <span className="block sm:inline sm:ml-1">Pengaturan</span>
            </button>
            <a
              href="/"
              className="w-full px-4 py-3 sm:py-3.5 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl text-center text-sm sm:text-base"
            >
              <span className="block sm:inline">🏠</span>
              <span className="block sm:inline sm:ml-1">Beranda</span>
            </a>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 sm:py-3.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl col-span-2 sm:col-span-1 text-sm sm:text-base"
            >
              <span className="block sm:inline">🚪</span>
              <span className="block sm:inline sm:ml-1">Logout</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-effect rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="🔍 Cari berdasarkan nama, instansi, alamat, atau keperluan..."
                className="w-full px-4 sm:px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
              >
                Cari
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSearchInput('');
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </form>
          {search && (
            <p className="mt-3 text-xs sm:text-sm text-gray-600">
              Menampilkan hasil pencarian untuk: <span className="font-semibold">&quot;{search}&quot;</span> ({pagination.total} hasil)
            </p>
          )}
        </div>

        {/* Data Table */}
        {loading ? (
          renderSkeleton()
        ) : data.length === 0 ? (
          <div className="glass-effect rounded-2xl text-center py-20 px-8">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-xl font-medium mb-2">
              Belum ada data buku tamu
            </p>
          </div>
        ) : (
          <div className="glass-effect rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Foto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nama</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Instansi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Alamat</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Keperluan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                          {item.fotoUrl ? (
                            <Image
                              src={item.fotoUrl}
                              alt={item.nama}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl">👤</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {item.nama}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{item.instansi}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">
                          {item.alamat}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">
                          {item.keperluan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 text-xs">
                          {formatDate(item.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-center">
                        <div className="flex gap-1 sm:gap-2 justify-center flex-col sm:flex-row">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap"
                          >
                            <span className="inline sm:hidden">✏️</span>
                            <span className="hidden sm:inline">✏️ Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-lg transition-colors shadow-md disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
                          >
                            {deleting === item.id ? (
                              <span className="flex items-center gap-2 justify-center">
                                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="hidden sm:inline">...</span>
                              </span>
                            ) : (
                              <>
                                <span className="inline sm:hidden">🗑️</span>
                                <span className="hidden sm:inline">🗑️ Hapus</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total data)
                </div>
                <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className="px-2 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">⏮️ First</span>
                    <span className="sm:hidden">⏮️</span>
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-2 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">◀️ Prev</span>
                    <span className="sm:hidden">◀️</span>
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem] ${
                            pagination.page === pageNum
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-2 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next ▶️</span>
                    <span className="sm:hidden">▶️</span>
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-2 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Last ⏭️</span>
                    <span className="sm:hidden">⏭️</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 sm:p-6 rounded-t-2xl">
              <h2 className="text-xl sm:text-2xl font-bold">
                {editingId ? '✏️ Edit Data Tamu' : '➕ Tambah Data Tamu'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Alamat *
                </label>
                <textarea
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Instansi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Masukkan nama instansi"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Keperluan *
                </label>
                <textarea
                  required
                  value={formData.keperluan}
                  onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Masukkan keperluan kunjungan"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  URL Foto (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="https://example.com/foto.jpg"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors shadow-md disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Menyimpan...</span>
                    </span>
                  ) : (
                    editingId ? '💾 Update Data' : '➕ Tambah Data'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors shadow-md disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  ❌ Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

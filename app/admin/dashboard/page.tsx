'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { BukuTamu, User, FormData, Pagination, StatusTamu, UserRole } from './types';
import { formatDate, closeModal } from './helpers';
import StatusBadge from './StatusBadge';

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
  const [statusFilter, setStatusFilter] = useState<StatusTamu | 'ALL'>('ALL');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 1000, // Load semua data
    total: 0,
    totalPages: 0,
  });
  const [exporting, setExporting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directingId, setDirectingId] = useState<number | null>(null);
  const [directData, setDirectData] = useState({ diarahkanKe: '', catatanBupati: '' });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completeNote, setCompleteNote] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: number; nama: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearch(searchInput);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  useEffect(() => {
    if (user && pagination) {
      fetchData();
      
      // Auto refresh setiap 30 detik
      const interval = setInterval(() => {
        fetchData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [search, statusFilter, user]);

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        limit: (pagination?.limit || 10).toString(),
        ...(search && { search }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      });
      const response = await fetch(`/api/buku-tamu?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Gagal memuat data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination, search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading('Mengekspor data...');
      
      const params = new URLSearchParams({
        limit: '1000',
        skipCount: 'true',
        ...(search && { search }),
      });
      const response = await fetch(`/api/buku-tamu?${params}`);
      const result = await response.json();
      const allData = result.data;

      // Format data untuk export
      const exportData = allData.map((item: BukuTamu, index: number) => ({
        No: index + 1,
        Nama: item.nama,
        Alamat: item.alamat,
        Instansi: item.instansi,
        Keperluan: item.keperluan,
        'Tanggal Kunjungan': (() => {
          const isoString = item.createdAt.includes('Z') || item.createdAt.includes('+') ? item.createdAt : item.createdAt + 'Z';
          const date = new Date(isoString);
          return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        })(),
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

  // Admin workflow handlers
  const [updating, setUpdating] = useState<number | null>(null);

  const handleWhatsAppContact = (whatsappNumber: string) => {
    if (!whatsappNumber) {
      toast.error('Nomor WhatsApp tidak tersedia');
      return;
    }
    
    const message = encodeURIComponent(
      `Halo! Terima kasih telah mendaftar di buku tamu digital. Admin akan segera mengatur jadwal kunjungan Anda. Mohon konfirmasi ketersediaan Anda.`
    );
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    toast.success('Membuka WhatsApp...');
  };

  const handleScheduleAppointment = async (id: number) => {
    const scheduledDate = prompt('Masukkan tanggal appointment (YYYY-MM-DD):');
    if (!scheduledDate) return;
    
    const scheduledTime = prompt('Masukkan waktu appointment (HH:MM):');
    if (!scheduledTime) return;
    
    try {
      setUpdating(id);
      
      const scheduledAt = `${scheduledDate} ${scheduledTime}`;
      
      const response = await fetch(`/api/buku-tamu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'DIJADWALKAN',
          scheduledAt: scheduledAt,
        }),
      });

      if (!response.ok) throw new Error('Gagal menjadwalkan appointment');

      toast.success(`Appointment dijadwalkan untuk ${scheduledDate} jam ${scheduledTime}`);
      fetchData();
    } catch (error) {
      toast.error('Gagal menjadwalkan appointment');
    } finally {
      setUpdating(null);
    }
  };

  const handleBupatiAction = async (id: number, newStatus: StatusTamu) => {
    if (newStatus === StatusTamu.DIARAHKAN) {
      // Buka modal untuk input pengarahan
      setDirectingId(id);
      setDirectData({ diarahkanKe: '', catatanBupati: '' });
      setShowDirectModal(true);
    } else if (newStatus === StatusTamu.SELESAI) {
      // Buka modal untuk konfirmasi selesai
      setCompletingId(id);
      setCompleteNote('');
      setShowCompleteModal(true);
    }
  };

  const handleCompleteSubmit = async (approved: boolean) => {
    if (!completingId) return;
    
    if (approved) {
      await submitBupatiAction(completingId, StatusTamu.SELESAI, '', completeNote);
    } else {
      await submitBupatiAction(completingId, StatusTamu.DITOLAK, '', completeNote || 'Kunjungan ditolak');
    }
    
    setShowCompleteModal(false);
    setCompletingId(null);
    setCompleteNote('');
  };

  // Shortcut: Langsung arahkan ke Bupati dan setujui
  const handleBupatiDirect = async (id: number) => {
    try {
      // Step 1: Arahkan ke Bupati
      await submitBupatiAction(id, StatusTamu.DIARAHKAN, 'Bupati', 'Langsung diarahkan ke Bupati');
      
      // Step 2: Auto-approve setelah 1 detik
      setTimeout(async () => {
        await submitBupatiAction(id, StatusTamu.SELESAI, '', 'Disetujui langsung oleh Bupati');
      }, 1000);
    } catch (error) {
      console.error('Error in Bupati direct:', error);
      toast.error('Gagal memproses shortcut Bupati');
    }
  };

  const submitBupatiAction = async (id: number, newStatus: StatusTamu, diarahkanKe: string = '', catatanBupati: string = '') => {
    try {
      const response = await fetch(`/api/buku-tamu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          diarahkanKe: newStatus === StatusTamu.DIARAHKAN ? diarahkanKe : null,
          catatanBupati
        })
      });

      if (response.ok) {
        toast.success(
          newStatus === StatusTamu.DIARAHKAN 
            ? `Tamu berhasil diarahkan ke ${diarahkanKe}` 
            : 'Status berhasil diperbarui'
        );
        setShowDirectModal(false);
        setDirectingId(null);
        setDirectData({ diarahkanKe: '', catatanBupati: '' });
        fetchData();
      } else {
        throw new Error('Gagal memperbarui status');
      }
    } catch (error) {
      toast.error('Gagal memperbarui status tamu');
    }
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directData.diarahkanKe.trim()) {
      toast.error('Silakan isi tujuan pengarahan tamu');
      return;
    }
    if (directingId) {
      submitBupatiAction(directingId, StatusTamu.DIARAHKAN, directData.diarahkanKe, directData.catatanBupati);
    }
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

  const handleDeleteClick = (id: number, nama: string) => {
    setDeletingItem({ id, nama });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setDeleting(deletingItem.id);
    try {
      const response = await fetch(`/api/buku-tamu/${deletingItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus data');
      }

      setData(data.filter((item) => item.id !== deletingItem.id));
      toast.success('Data berhasil dihapus!');
      setShowDeleteModal(false);
      setDeletingItem(null);
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
              <th className="px-6 py-4 text-left text-sm font-semibold">Status & Pengarahan</th>
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
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
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
            {user?.role !== 'BUPATI' && (
              <button
                onClick={() => handleOpenModal()}
                className="w-full px-4 py-3 sm:py-3.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
              >
                <span className="block sm:inline">➕</span>
                <span className="block sm:inline sm:ml-1">Tambah Data</span>
              </button>
            )}
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
              {/* Filter Status akan diaktifkan setelah database migration
              {user?.role === UserRole.ADMIN_BUPATI && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusTamu | 'ALL')}
                  className="px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
                >
                  <option value="ALL">📋 Semua Status</option>
                  <option value={StatusTamu.MENUNGGU}>🕐 Menunggu</option>
                  <option value={StatusTamu.DIARAHKAN}>👥 Diarahkan</option>
                  <option value={StatusTamu.SELESAI}>✅ Selesai</option>
                </select>
              )}
              */}
              
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
                    setPagination(prev => ({ ...prev, page: 1 }));
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
              <table className="w-full min-w-max">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                  <tr>
                    <th className="px-4 py-4 text-center text-sm font-bold whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">📸</span>
                        <span>FOTO</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <span>DATA PENGUNJUNG</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📝</span>
                        <span>KEPERLUAN</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span>STATUS</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🕐</span>
                        <span>WAKTU</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span>AKSI</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {data.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      {/* Foto */}
                      <td className="px-4 py-3">
                        <div 
                          className="w-14 h-14 relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 cursor-pointer hover:scale-110 hover:shadow-xl transition-all ring-2 ring-white"
                          onClick={() => item.fotoUrl && setSelectedPhoto(item.fotoUrl)}
                        >
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

                      {/* Data Pengunjung */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="font-bold text-gray-900 text-sm">{item.nama}</div>
                          <div className="text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <span>🏢</span>
                              <span className="font-medium">{item.instansi}</span>
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <span>📍</span>
                              <span>{item.alamat}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Keperluan */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {item.keperluan}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={item.status}
                          diarahkanKe={item.diarahkanKe}
                          catatanBupati={item.catatanBupati}
                        />
                      </td>

                      {/* Waktu */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          {formatDate(item.createdAt)}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 sm:gap-2 justify-center flex-col sm:flex-row">
                          {user?.role === 'BUPATI' ? (
                            /* Actions untuk Bupati - workflow management */
                            <>
                              {item.status === 'MENUNGGU' && (
                                <>
                                  <button
                                    onClick={() => handleWhatsAppContact(item.whatsapp)}
                                    className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap"
                                  >
                                    <span className="inline sm:hidden">📞</span>
                                    <span className="hidden sm:inline">📞 Hubungi</span>
                                  </button>
                                  <button
                                    onClick={() => handleBupatiAction(item.id, StatusTamu.DIARAHKAN)}
                                    className="px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap"
                                  >
                                    <span className="inline sm:hidden">📍</span>
                                    <span className="hidden sm:inline">📍 Arahkan</span>
                                  </button>
                                  <button
                                    onClick={() => handleBupatiDirect(item.id)}
                                    className="px-3 sm:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap"
                                    title="Shortcut: Langsung arahkan ke Bupati dan setujui"
                                  >
                                    <span className="inline sm:hidden">👑</span>
                                    <span className="hidden sm:inline">👑 Bupati Langsung</span>
                                  </button>
                                </>
                              )}
                              {item.status === StatusTamu.DIARAHKAN && (
                                <button
                                  onClick={() => handleBupatiAction(item.id, StatusTamu.SELESAI)}
                                  className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap"
                                >
                                  <span className="inline sm:hidden">✅</span>
                                  <span className="hidden sm:inline">✅ Setujui</span>
                                </button>
                              )}
                              {item.status === StatusTamu.SELESAI && (
                                <span className="px-3 sm:px-4 py-2 bg-gray-100 text-green-600 font-semibold rounded-lg text-xs sm:text-sm">
                                  ✅ Selesai
                                </span>
                              )}
                              {item.status === StatusTamu.DITOLAK && (
                                <span className="px-3 sm:px-4 py-2 bg-gray-100 text-red-600 font-semibold rounded-lg text-xs sm:text-sm">
                                  ❌ Ditolak
                                </span>
                              )}
                            </>
                          ) : (
                            /* Actions untuk Admin Bupati - full management */
                            <>
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap"
                              >
                                <span className="inline sm:hidden">✏️</span>
                                <span className="hidden sm:inline">✏️ Edit</span>
                              </button>
                              
                              <button
                                onClick={() => handleDeleteClick(item.id, item.nama)}
                                disabled={deleting === item.id}
                                className="px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-lg transition-colors shadow-md disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap"
                              >
                                {deleting === item.id ? (
                                  <span className="flex items-center gap-2 justify-center">
                                    <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Info Total Data */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 font-medium">
                  📊 Total: <span className="font-bold text-blue-600">{pagination.total}</span> pengunjung
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Auto-refresh setiap 30 detik
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div 
          className="fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{editingId ? '✏️' : '➕'}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {editingId ? 'Edit Data Tamu' : 'Tambah Data Tamu'}
                    </h3>
                    <p className="text-sm text-white text-opacity-90">
                      {editingId ? 'Perbarui informasi tamu' : 'Tambahkan tamu baru'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base resize-none"
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Instansi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                  placeholder="Masukkan nama instansi"
                />
              </div>

              {/* Field baru akan diaktifkan setelah database migration
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value=""
                  onChange={() => {}}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Contoh: 081234567890"
                  pattern="[0-9]{10,15}"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Tempat Kunjungan *
                </label>
                <select
                  required
                  value=""
                  onChange={() => {}}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Pilih tempat kunjungan</option>
                  <option value="Kantor Bupati">Kantor Bupati</option>
                  <option value="Rumah Jabatan">Rumah Jabatan</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Tanggal Kunjungan *
                  </label>
                  <input
                    type="date"
                    required
                    value=""
                    onChange={() => {}}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Jam Kunjungan *
                  </label>
                  <input
                    type="time"
                    required
                    value=""
                    onChange={() => {}}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
              */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keperluan <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.keperluan}
                  onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base resize-none"
                  placeholder="Masukkan keperluan kunjungan"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Foto <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <input
                  type="url"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
                  placeholder="https://example.com/foto.jpg"
                />
              </div>
            </form>
            </div>

            {/* Footer - Sticky Buttons */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                type="submit"
                form="editForm"
                disabled={saving}
                onClick={handleSubmit}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>{editingId ? '💾' : '➕'}</span>
                    <span>{editingId ? 'Update Data' : 'Tambah Data'}</span>
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="px-6 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Full Size Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold transition-colors"
            >
              ✕ Tutup
            </button>
            <img
              src={selectedPhoto}
              alt="Full size photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal Pengarahan Tamu - Modern UI */}
      {showDirectModal && (
        <div 
          className="fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowDirectModal(false);
            setDirectingId(null);
            setDirectData({ diarahkanKe: '', catatanBupati: '' });
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Arahkan Tamu</h3>
                    <p className="text-sm text-white text-opacity-90">Tentukan tujuan pengarahan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDirectModal(false);
                    setDirectingId(null);
                    setDirectData({ diarahkanKe: '', catatanBupati: '' });
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleDirectSubmit} className="p-6 space-y-5">
              {/* Tujuan Pengarahan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Arahkan ke mana? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={directData.diarahkanKe}
                  onChange={(e) => setDirectData({ ...directData, diarahkanKe: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base"
                  placeholder="Contoh: Bagian Keuangan, Sekretaris Daerah..."
                  autoFocus
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Bagian Keuangan', 'Sekretaris Daerah', 'Dinas Pendidikan', 'Dinas Kesehatan'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDirectData({ ...directData, diarahkanKe: suggestion })}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-lg text-sm transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <textarea
                  value={directData.catatanBupati}
                  onChange={(e) => setDirectData({ ...directData, catatanBupati: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base resize-none"
                  placeholder="Tambahkan catatan untuk tamu..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Arahkan Tamu</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDirectModal(false);
                    setDirectingId(null);
                    setDirectData({ diarahkanKe: '', catatanBupati: '' });
                  }}
                  className="px-6 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Selesai Kunjungan - Setujui/Tolak */}
      {showCompleteModal && (
        <div 
          className="fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowCompleteModal(false);
            setCompletingId(null);
            setCompleteNote('');
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Selesaikan Kunjungan</h3>
                    <p className="text-sm text-white text-opacity-90">Konfirmasi status kunjungan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setCompletingId(null);
                    setCompleteNote('');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700">
                  Apakah Anda yakin ingin menyelesaikan kunjungan ini?
                </p>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <textarea
                  value={completeNote}
                  onChange={(e) => setCompleteNote(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-base resize-none"
                  placeholder="Tambahkan catatan selesai kunjungan..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleCompleteSubmit(true)}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Setujui</span>
                  </span>
                </button>
                <button
                  onClick={() => handleCompleteSubmit(false)}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✗</span>
                    <span>Tolak</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && deletingItem && (
        <div 
          className="fixed inset-0 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setShowDeleteModal(false);
            setDeletingItem(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Konfirmasi Hapus</h3>
                    <p className="text-sm text-white text-opacity-90">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingItem(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-gray-700 mb-2">
                  Apakah Anda yakin ingin menghapus data tamu berikut?
                </p>
                <p className="font-bold text-gray-900">
                  {deletingItem.nama}
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-xs text-gray-600">
                  ⚠️ Data yang sudah dihapus tidak dapat dikembalikan lagi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting === deletingItem.id}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting === deletingItem.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menghapus...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>🗑️</span>
                      <span>Ya, Hapus</span>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingItem(null);
                  }}
                  disabled={deleting === deletingItem.id}
                  className="flex-1 px-6 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

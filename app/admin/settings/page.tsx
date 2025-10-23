'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    welcomeText: '',
    logoUrl: ''
  });

  // Check authentication
  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.data);
        setFormData({
          organizationName: data.data.organizationName || '',
          welcomeText: data.data.welcomeText || '',
          logoUrl: data.data.logoUrl || ''
        });
      }
    } catch (error) {
      toast.error('Gagal memuat pengaturan');
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Mengupload logo...');

    try {
      // Compress image
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true
      });

      // Create form data
      const uploadData = new FormData();
      uploadData.append('file', compressed);

      // Upload to R2
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      
      // Update form data with new logo URL
      setFormData(prev => ({ ...prev, logoUrl: data.url }));
      toast.success('Logo berhasil diupload', { id: loadingToast });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Gagal upload logo', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Update failed');
      }

      toast.success('Pengaturan berhasil disimpan');
      loadSettings(); // Reload settings

    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Aplikasi</h1>
            <p className="text-sm text-gray-600 mt-1">Kelola logo dan informasi organisasi</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ← Kembali
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Organisasi
              </label>
              
              {/* Preview */}
              {formData.logoUrl && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <Image
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">Preview Logo</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengupload...
                      </>
                    ) : (
                      <>📤 Pilih & Upload Logo</>
                    )}
                  </span>
                </label>
                
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                    className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Format: PNG, JPG, atau GIF. Maksimal 1MB. Ukuran rekomendasi: 500x500px
              </p>
            </div>

            {/* Organization Name */}
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Organisasi
              </label>
              <input
                id="orgName"
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Diskominfo Tanah Bumbu"
                required
              />
            </div>

            {/* Welcome Text */}
            <div>
              <label htmlFor="welcomeText" className="block text-sm font-medium text-gray-700 mb-2">
                Teks Sambutan (Opsional)
              </label>
              <textarea
                id="welcomeText"
                value={formData.welcomeText}
                onChange={(e) => setFormData(prev => ({ ...prev, welcomeText: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Selamat datang di Buku Tamu Digital..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Teks ini akan ditampilkan di halaman utama
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

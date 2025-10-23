'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setRemainingAttempts(null);
    setIsLocked(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Cek jika akun terkunci
        if (data.locked) {
          setIsLocked(true);
        }
        
        // Simpan remaining attempts jika ada
        if (typeof data.remainingAttempts === 'number') {
          setRemainingAttempts(data.remainingAttempts);
        }
        
        throw new Error(data.error || 'Login gagal');
      }

      // Login berhasil
      toast.success('Login berhasil! Redirecting...');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 500);
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">
              Masuk untuk mengelola data buku tamu
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-xl border-2 ${
              isLocked 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {isLocked ? '🔒' : '⚠️'}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm mb-1 ${
                    isLocked ? 'text-orange-700' : 'text-red-600'
                  }`}>
                    {isLocked ? 'Akun Terkunci' : 'Login Gagal'}
                  </p>
                  <p className={`text-sm ${
                    isLocked ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {error}
                  </p>
                  
                  {remainingAttempts !== null && remainingAttempts > 0 && !isLocked && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-xs text-red-500 font-medium">
                        💡 Tip: Pastikan username dan password sudah benar
                      </p>
                    </div>
                  )}
                  
                  {isLocked && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <p className="text-xs text-orange-600">
                        ⏰ Tunggu beberapa menit sebelum mencoba lagi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <span>👤</span>
                Username
              </label>
              <input
                type="text"
                id="username"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="input-field"
                placeholder="Masukkan username"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <span>🔒</span>
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field"
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                '🚀 Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

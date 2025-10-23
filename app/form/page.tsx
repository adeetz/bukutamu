'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { loadRecaptchaScript, executeRecaptcha } from '@/lib/recaptcha';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export default function FormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    instansi: '',
    keperluan: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(mediaStream);
      setShowCamera(true);
      setPreview(null);
      setFile(null);
    } catch (error) {
      toast.error('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            let file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            
            // Compress image jika ukuran > 500KB
            if (file.size > 500 * 1024) {
              try {
                const compressedBlob = await imageCompression(file, {
                  maxSizeMB: 0.5,
                  maxWidthOrHeight: 1280,
                  useWebWorker: true,
                });
                file = new File([compressedBlob], 'camera-photo.jpg', { type: 'image/jpeg' });
                toast.success('Foto berhasil dikompresi');
              } catch (error) {
                // Silent fail for compression
              }
            }
            
            setFile(file);
            setPreview(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Load reCAPTCHA script
  useEffect(() => {
    if (RECAPTCHA_SITE_KEY) {
      loadRecaptchaScript(RECAPTCHA_SITE_KEY)
        .then(() => {
          setRecaptchaLoaded(true);
        })
        .catch(() => {
          // Fail silently, user will see error on submit
        });
    }
  }, []);

  useEffect(() => {
    // Set video stream saat showCamera true dan stream tersedia
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [showCamera, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate reCAPTCHA token
      let recaptchaToken = '';
      if (RECAPTCHA_SITE_KEY && recaptchaLoaded) {
        try {
          recaptchaToken = await executeRecaptcha(RECAPTCHA_SITE_KEY, 'submit_form');
        } catch (error) {
          toast.error('Gagal memverifikasi CAPTCHA. Silakan refresh halaman dan coba lagi.');
          setLoading(false);
          return;
        }
      }

      let fotoUrl = null;

      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Gagal mengupload foto');
        }

        const uploadResult = await uploadResponse.json();
        fotoUrl = uploadResult.url;
      }

      const response = await fetch('/api/buku-tamu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fotoUrl,
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Tampilkan detail error jika ada
        let errorMessage = errorData.error || 'Gagal menyimpan data';
        
        // Jika ada errors array (dari validasi), tampilkan detail
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage += ':\n' + errorData.errors.join('\n');
        }
        
        throw new Error(errorMessage);
      }

      toast.success('Data berhasil disimpan!');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-all hover:gap-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        <div className="glass-effect rounded-2xl p-6 md:p-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✍️</div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
              Isi Buku Tamu
            </h1>
            <p className="text-gray-600">
              Silakan lengkapi form di bawah ini untuk mendaftar sebagai pengunjung
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="nama"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <span className="text-blue-600">👤</span>
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                required
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="input-field"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="alamat"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <span className="text-indigo-600">📍</span>
                Alamat <span className="text-red-500">*</span>
              </label>
              <textarea
                id="alamat"
                required
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                rows={3}
                className="input-field resize-none"
                placeholder="Masukkan alamat lengkap Anda"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="instansi"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <span className="text-purple-600">🏢</span>
                Instansi/Organisasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="instansi"
                required
                value={formData.instansi}
                onChange={(e) =>
                  setFormData({ ...formData, instansi: e.target.value })
                }
                className="input-field"
                placeholder="Masukkan nama instansi/organisasi"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="keperluan"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <span className="text-pink-600">📝</span>
                Keperluan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="keperluan"
                required
                value={formData.keperluan}
                onChange={(e) =>
                  setFormData({ ...formData, keperluan: e.target.value })
                }
                rows={4}
                className="input-field resize-none"
                placeholder="Jelaskan keperluan kunjungan Anda"
              />
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <span className="text-green-600">📷</span>
                Foto (Opsional)
              </label>
              
              {/* Tombol Buka Kamera */}
              {!preview && (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={showCamera}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-md disabled:cursor-not-allowed"
                >
                  📸 Buka Kamera
                </button>
              )}

              {/* Camera Preview */}
              {showCamera && (
                <div className="mt-4 animate-fade-in">
                  <div className="relative bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-full shadow-lg transition-all"
                      >
                        📸 Ambil Foto
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg transition-all"
                      >
                        ✕ Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Canvas tersembunyi untuk capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Preview hasil foto */}
              {preview && !showCamera && (
                <div className="mt-4 animate-fade-in">
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-w-xs h-64 object-cover rounded-xl border-4 border-white shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      ✓ Siap
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setFile(null);
                      }}
                      className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full shadow-lg transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || (RECAPTCHA_SITE_KEY && !recaptchaLoaded)}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan Data...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    💾 Simpan Data
                  </span>
                )}
              </button>

              {/* reCAPTCHA Badge */}
              {RECAPTCHA_SITE_KEY && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Situs ini dilindungi oleh reCAPTCHA dan{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>{' '}
                    serta{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    Google berlaku.
                  </p>
                  {!recaptchaLoaded && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⏳ Memuat sistem keamanan...
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

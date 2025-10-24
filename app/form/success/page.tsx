'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '../../contexts/SettingsContext';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const [countdown, setCountdown] = useState(10);
  const [guestName, setGuestName] = useState<string>('');

  useEffect(() => {
    // Get guest name from URL params
    const name = searchParams.get('nama');
    if (name) {
      setGuestName(decodeURIComponent(name));
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="glass-effect rounded-2xl p-8 md:p-12 text-center animate-fade-in">
          {/* Logo */}
          {settings?.logoUrl && (
            <div className="flex justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <img
                src={settings.logoUrl}
                alt={settings.organizationName}
                className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl"
              />
            </div>
          )}

          {/* Success Icon */}
          <div className="mb-6 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <svg
                className="w-12 h-12 md:w-16 md:h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              🎉 Registrasi Berhasil!
            </h1>
            {guestName && (
              <p className="text-xl md:text-2xl text-gray-700 mb-3">
                Selamat datang, <span className="font-bold text-blue-600">{guestName}</span>!
              </p>
            )}
            <p className="text-gray-600 text-base md:text-lg">
              Terima kasih telah mengisi buku tamu digital.
            </p>
            <p className="text-gray-600 text-base md:text-lg">
              Data Anda telah berhasil tersimpan dalam sistem kami.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start gap-3 text-left">
              <div className="flex-shrink-0 text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Informasi:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Data Anda telah tersimpan dengan aman</li>
                  <li>✅ Admin akan meninjau informasi Anda</li>
                  <li>✅ Jika ada pertanyaan, hubungi admin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Link
              href="/"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              🏠 Kembali ke Beranda
            </Link>
            <Link
              href="/form"
              className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-gray-200"
            >
              📝 Daftar Lagi
            </Link>
          </div>

          {/* Auto Redirect Info */}
          <div className="text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p>
              Otomatis kembali ke beranda dalam{' '}
              <span className="font-bold text-blue-600">{countdown}</span> detik
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 underline mt-2"
            >
              Kembali sekarang
            </button>
          </div>
        </div>

        {/* Organization Info */}
        {settings?.organizationName && (
          <div className="text-center mt-6 text-gray-500 text-sm animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <p>{settings.organizationName}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc)
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-effect rounded-2xl p-8 text-center animate-fade-in">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold gradient-text mb-4">
            Oops! Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-6">
            Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-xs font-mono text-red-700 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
            >
              🔄 Coba Lagi
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
            >
              🏠 Ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

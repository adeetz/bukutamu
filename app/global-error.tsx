'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-6">💥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Kesalahan Sistem
            </h2>
            <p className="text-gray-600 mb-6">
              Terjadi kesalahan sistem yang serius. Silakan refresh halaman atau hubungi administrator.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              >
                🔄 Coba Lagi
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              >
                🏠 Ke Beranda
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

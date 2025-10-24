'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface Settings {
  logoUrl: string | null;
  organizationName: string;
  welcomeText: string | null;
}

interface Guest {
  id: number;
  nama: string;
  instansi: string;
  fotoUrl: string | null;
  createdAt: string;
}

export default function TVDisplayPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // QR Code URL - form URL
  const formUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/form` 
    : 'https://yourdomain.com/form';

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Fetch latest guests
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch('/api/buku-tamu?limit=10&page=1');
        const result = await response.json();
        if (result.data) {
          setGuests(result.data);
        }
      } catch (error) {
        console.error('Error fetching guests:', error);
      }
    };

    fetchGuests();
    // Auto refresh setiap 10 detik
    const interval = setInterval(fetchGuests, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update clock setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 mb-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {settings?.logoUrl && (
              <img
                src={settings.logoUrl}
                alt={settings.organizationName}
                className="w-20 h-20 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">
                {settings?.organizationName || 'Sistem Informasi Buku Tamu'}
              </h1>
              {settings?.welcomeText && (
                <p className="text-gray-600">{settings.welcomeText}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-2xl p-8 text-center sticky top-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                📱 Scan untuk Daftar
              </h2>
              <p className="text-gray-600 text-sm">
                Scan QR Code di bawah untuk mengisi buku tamu
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
              <QRCodeSVG
                value={formUrl}
                size={280}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: settings?.logoUrl || '',
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Atau kunjungi:</p>
              <p className="text-sm font-semibold text-blue-600 break-all">
                {formUrl}
              </p>
            </div>

            <div className="mt-6 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-xl">1️⃣</span>
                <span>Scan QR Code dengan smartphone</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-xl">2️⃣</span>
                <span>Isi form buku tamu</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-xl">3️⃣</span>
                <span>Ambil foto dan submit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest List Section */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ✅ Tamu Terdaftar Hari Ini
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Update</span>
              </div>
            </div>

            {guests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-500 text-lg">
                  Belum ada tamu yang terdaftar
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Scan QR Code untuk menjadi tamu pertama!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                {guests.map((guest, index) => (
                  <div
                    key={guest.id}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Foto */}
                      <div className="flex-shrink-0">
                        {guest.fotoUrl ? (
                          <img
                            src={guest.fotoUrl}
                            alt={guest.nama}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                            {guest.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800 text-lg truncate">
                            {guest.nama}
                          </h3>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              Baru
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            🏢 {guest.instansi}
                          </span>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-gray-500">
                          {formatDate(guest.createdAt)}
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {formatTime(guest.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {guests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Total tamu hari ini: <span className="font-bold text-blue-600">{guests.length}</span>
                  </span>
                  <span className="text-gray-400 text-xs">
                    Update otomatis setiap 10 detik
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

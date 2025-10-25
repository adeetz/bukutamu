'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSettings } from '../contexts/SettingsContext';

interface Guest {
  id: number;
  nama: string;
  instansi: string;
  keperluan: string;
  fotoUrl: string | null;
  createdAt: string;
}

export default function TVDisplayPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState(10);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set form URL on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormUrl(`${window.location.origin}/form`);
    }
  }, []);

  // Fetch latest guests
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await fetch(`/api/buku-tamu?limit=100&page=1&date=${selectedDate}`);
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
  }, [selectedDate]);

  // Update clock setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev === 0 ? 10 : prev - 1));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 relative">
      {/* Sasirangan Background Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.04] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='sasirang' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 20 L40 60 L80 20 L120 60 L160 20 L200 60' stroke='%23854d0e' stroke-width='2' fill='none'/%3E%3Cpath d='M0 80 L40 40 L80 80 L120 40 L160 80 L200 40' stroke='%23854d0e' stroke-width='2' fill='none'/%3E%3Cpath d='M0 100 Q20 90 40 100 T80 100 T120 100 T160 100 T200 100' stroke='%23854d0e' stroke-width='1.5' fill='none'/%3E%3Cpath d='M0 140 L40 180 L80 140 L120 180 L160 140 L200 180' stroke='%23854d0e' stroke-width='2' fill='none'/%3E%3Cpath d='M0 200 L40 160 L80 200 L120 160 L160 200 L200 160' stroke='%23854d0e' stroke-width='2' fill='none'/%3E%3Cpath d='M20 0 L60 40 L20 80 L60 120 L20 160 L60 200' stroke='%23b45309' stroke-width='1.5' fill='none'/%3E%3Cpath d='M80 0 L120 40 L80 80 L120 120 L80 160 L120 200' stroke='%23b45309' stroke-width='1.5' fill='none'/%3E%3Cpath d='M140 0 L180 40 L140 80 L180 120 L140 160 L180 200' stroke='%23b45309' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='40' cy='60' r='3' fill='%23854d0e'/%3E%3Ccircle cx='120' cy='60' r='3' fill='%23854d0e'/%3E%3Ccircle cx='40' cy='180' r='3' fill='%23854d0e'/%3E%3Ccircle cx='120' cy='180' r='3' fill='%23854d0e'/%3E%3Cpath d='M100 0 Q100 20 120 20 T140 40 T160 60' stroke='%23a16207' stroke-width='1' fill='none'/%3E%3Cpath d='M100 100 Q100 120 120 120 T140 140 T160 160' stroke='%23a16207' stroke-width='1' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23sasirang)'/%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Back Button - Fixed Position Bottom Left */}
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="fixed bottom-6 left-6 z-40 px-4 py-3 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-gray-200"
        title="Kembali ke Dashboard"
      >
        <span className="text-xl">←</span>
        <span className="text-sm font-semibold">Dashboard</span>
      </button>

      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 mb-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
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
                {settings?.pageTitle || settings?.organizationName || 'Sistem Informasi Buku Tamu'}
              </h1>
              {settings?.welcomeText && (
                <p className="text-gray-600">{settings.welcomeText}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Real-time Clock */}
            <div className="px-5 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-white tabular-nums">
                  {currentTime.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    timeZone: 'Asia/Makassar',
                  })}
                </div>
                <div className="text-xs text-blue-100 mt-0.5 font-medium">
                  {currentTime.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'Asia/Makassar',
                  })} WITA
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium text-gray-700 shadow-sm"
              >
                📅 {new Date(selectedDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </button>
              {showDatePicker && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[200px]">
                  <input
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setShowDatePicker(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                    <button
                      onClick={() => {
                        const today = new Date();
                        setSelectedDate(today.toISOString().split('T')[0]);
                        setShowDatePicker(false);
                      }}
                      className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      📅 Hari Ini
                    </button>
                    <button
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setSelectedDate(yesterday.toISOString().split('T')[0]);
                        setShowDatePicker(false);
                      }}
                      className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    >
                      ⏮️ Kemarin
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Refresh dalam</div>
              <div className="text-5xl font-bold text-blue-600">
                {countdown}
              </div>
              <div className="text-xs text-gray-400 mt-1">detik</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-2xl p-6 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                📱 Scan untuk Daftar
              </h2>
              <p className="text-gray-600 text-sm">
                Scan QR Code di bawah untuk mengisi buku tamu
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
              {formUrl && (
                <QRCodeSVG
                  value={formUrl}
                  size={280}
                  level="H"
                  includeMargin={true}
                  {...(settings?.logoUrl && {
                    imageSettings: {
                      src: settings.logoUrl,
                      height: 40,
                      width: 40,
                      excavate: true,
                    },
                  })}
                />
              )}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-sm text-gray-700 font-medium text-center">
                📱 Gunakan HP untuk scan QR Code
              </p>
            </div>
          </div>
        </div>

        {/* Guest List Section */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-2xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  ✅ Tamu Terdaftar {
                    selectedDate === new Date().toISOString().split('T')[0] 
                      ? 'Hari Ini' 
                      : new Date(selectedDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                  }
                </h2>
                <p className="text-sm text-gray-500">
                  📅 {new Date(selectedDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
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
                  {selectedDate === new Date().toISOString().split('T')[0] 
                    ? 'Scan QR Code untuk menjadi tamu pertama!' 
                    : `Tidak ada data tamu pada tanggal ${new Date(selectedDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                {guests.map((guest, index) => (
                  <div
                    key={guest.id}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in border-2 border-gray-100"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-6">
                      {/* Foto */}
                      <div className="flex-shrink-0">
                        {guest.fotoUrl ? (
                          <img
                            src={guest.fotoUrl}
                            alt={guest.nama}
                            className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-100 cursor-pointer hover:border-blue-400 transition-all shadow-md"
                            onClick={() => setSelectedPhoto(guest.fotoUrl)}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                            {guest.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 text-2xl truncate">
                            {guest.nama}
                          </h3>
                          {index === 0 && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full flex items-center gap-1">
                              ✨ Baru
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-base text-gray-700">
                            <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                              🏢 <span className="font-medium">{guest.instansi}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-base text-gray-700">
                            <span className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                              📋 <span className="font-medium">{guest.keperluan}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex-shrink-0 text-right bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 rounded-xl">
                        <div className="text-base font-bold text-blue-600 mb-1">
                          ⏰ {formatTime(guest.createdAt)}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate(guest.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {guests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      Total tamu: <span className="font-bold text-blue-600">{guests.length}</span>
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      📅 {selectedDate === new Date().toISOString().split('T')[0] ? 'Hari Ini' : new Date(selectedDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    Update otomatis setiap 10 detik
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Full Size Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-scale-in">
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
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
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

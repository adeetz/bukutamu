'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BukuTamu {
  id: number;
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  fotoUrl: string | null;
  createdAt: string;
}

interface Settings {
  logoUrl: string | null;
  organizationName: string;
  welcomeText: string | null;
}

export default function Home() {
  const [data, setData] = useState<BukuTamu[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchSettings();

    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/buku-tamu?limit=20');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="glass-effect rounded-2xl p-8 md:p-10 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-4">

                {settingsLoading ? (
                  <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                ) : settings?.logoUrl && typeof settings.logoUrl === 'string' ? (
                  <div className="flex-shrink-0 animate-fade-in">
                    <img
                      src={settings.logoUrl}
                      alt={settings.organizationName || 'Logo'}
                      className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg animate-fade-in">
                    📖
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-3xl md:text-5xl font-bold gradient-text leading-tight">
                    Buku Tamu Digital
                  </h1>
                  {settingsLoading ? (
                    <div className="h-7 md:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mt-2 w-48 animate-pulse"></div>
                  ) : settings?.organizationName ? (
                    <p className="text-base md:text-xl font-semibold text-gray-700 mt-2 animate-fade-in">
                      {settings.organizationName}
                    </p>
                  ) : null}
                </div>
              </div>

              {settingsLoading ? (
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4 ml-1 w-full max-w-md animate-pulse"></div>
              ) : settings?.welcomeText ? (
                <p className="text-gray-600 text-lg mb-4 ml-1 animate-fade-in">
                  {settings.welcomeText}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3 ml-1">
                <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-semibold text-gray-700">
                      {data.length} {data.length === 1 ? 'Pengunjung' : 'Total Pengunjung'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/form"
                className="btn-primary whitespace-nowrap text-center"
              >
                ✨ Isi Buku Tamu
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-500">Memuat data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="glass-effect rounded-2xl text-center py-20 px-8">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-xl font-medium mb-2">
              Belum ada data buku tamu
            </p>
            <p className="text-gray-500">
              Jadilah yang pertama mengisi buku tamu!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >

                <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                  {item.fotoUrl ? (
                    <Image
                      src={item.fotoUrl}
                      alt={item.nama}
                      fill
                      className="object-cover"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {item.nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>


                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-bold text-gray-800 truncate">
                    {item.nama}
                  </h2>
                  
                  <div className="text-sm space-y-1.5 text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="truncate font-medium">{item.instansi}</span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="line-clamp-2">{item.keperluan}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

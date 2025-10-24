'use client';

import { useSettings } from './contexts/SettingsContext';
import './electro-animation.css';

export default function Home() {
  const { settings, loading: settingsLoading } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Electro Animation Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Electric Lines */}
        <div className="electro-bg">
          <div className="electric-line line-1"></div>
          <div className="electric-line line-2"></div>
          <div className="electric-line line-3"></div>
          <div className="electric-line line-4"></div>
          <div className="electric-particle particle-1"></div>
          <div className="electric-particle particle-2"></div>
          <div className="electric-particle particle-3"></div>
          <div className="electric-particle particle-4"></div>
          <div className="electric-particle particle-5"></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Logo & Info */}
          <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
            {settingsLoading ? (
              <div className="w-32 h-32 rounded-2xl bg-gray-700 animate-pulse mx-auto lg:mx-0"></div>
            ) : settings?.logoUrl ? (
              <div className="flex justify-center lg:justify-start">
                <img
                  src={settings.logoUrl}
                  alt={settings.organizationName || 'Logo'}
                  className="w-32 h-32 object-contain drop-shadow-2xl"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-6xl shadow-2xl mx-auto lg:mx-0">
                🏛️
              </div>
            )}
            <div className="space-y-3">
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
                Sistem Informasi Digital
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {settings?.pageTitle || 'Diskominfo Kabupaten Tanah Bumbu'}
              </h1>
            </div>
          </div>
          
          {/* Right Side - Card */}
          <div className="order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl p-8 md:p-12 border border-slate-600/50 backdrop-blur-xl">
                <div className="space-y-6">
                  {/* Welcome Badge */}
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-full text-white text-sm font-semibold">
                    ✨ Selamat Datang
                  </div>
                  
                  {/* Card Content */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-white">
                      {settings?.organizationName || 'Diskominfo'}
                    </h2>
                    
                    {!settingsLoading && settings?.welcomeText && (
                      <p className="text-gray-300 leading-relaxed text-lg">
                        {settings.welcomeText}
                      </p>
                    )}
                    
                    {!settings?.welcomeText && (
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Sistem Buku Tamu Digital untuk mencatat kunjungan Anda dengan mudah dan efisien.
                      </p>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Support Text */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Butuh bantuan? Hubungi petugas di meja informasi</p>
        </div>
      </div>
    </div>
  );
}

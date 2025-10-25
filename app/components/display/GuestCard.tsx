import Image from 'next/image';
import { BukuTamu } from '@/app/types';
import { formatDate, formatTime } from '@/app/utils/date';

interface GuestCardProps {
  guest: BukuTamu;
  index: number;
  onPhotoClick: (url: string) => void;
}

export function GuestCard({ guest, index, onPhotoClick }: GuestCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in border-2 border-gray-100"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-6">
        {/* Foto */}
        <div className="flex-shrink-0">
          {guest.fotoUrl ? (
            <div 
              className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-4 border-white cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onPhotoClick(guest.fotoUrl!)}
            >
              <Image
                src={guest.fotoUrl}
                alt={guest.nama}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                priority={index < 3}
              />
            </div>
          ) : (
            <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-4xl text-gray-400">👤</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-800 truncate">
              {guest.nama}
            </h3>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold whitespace-nowrap">
              ✨ Baru
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-lg flex-shrink-0">🏢</span>
              <span className="text-gray-700 font-medium text-lg break-words">
                {guest.instansi}
              </span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-purple-600 text-lg flex-shrink-0">📋</span>
              <span className="text-gray-600 text-base break-words line-clamp-2">
                {guest.keperluan}
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
  );
}

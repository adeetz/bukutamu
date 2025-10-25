import Image from 'next/image';

interface PhotoModalProps {
  photoUrl: string | null;
  onClose: () => void;
}

export function PhotoModal({ photoUrl, onClose }: PhotoModalProps) {
  if (!photoUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] animate-zoom-in">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
        <Image
          src={photoUrl}
          alt="Guest photo"
          width={800}
          height={800}
          className="rounded-lg shadow-2xl max-h-[85vh] w-auto h-auto object-contain"
        />
      </div>
    </div>
  );
}

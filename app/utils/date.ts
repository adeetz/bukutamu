export const formatDate = (dateString: string): string => {
  const isoString = dateString.includes('Z') || dateString.includes('+') ? dateString : dateString + 'Z';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const isoString = dateString.includes('Z') || dateString.includes('+') ? dateString : dateString + 'Z';
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDateTime = (dateString: string): string => {
  const isoString = dateString.includes('Z') || dateString.includes('+') ? dateString : dateString + 'Z';
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const getLocalDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateLabel = (dateStr: string): string => {
  const selected = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - selected.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '📅 Hari Ini';
  if (diffDays === 1) return '⏮️ Kemarin';
  if (diffDays <= 7) return `📆 ${diffDays} Hari Lalu`;
  if (diffDays <= 30) return `📆 ${Math.floor(diffDays / 7)} Minggu Lalu`;
  if (diffDays <= 365) return `📆 ${Math.floor(diffDays / 30)} Bulan Lalu`;
  return `📆 ${new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

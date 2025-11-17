// Helper functions untuk Dashboard

export const getStatusConfig = (status: string) => {
  const configs = {
    MENUNGGU: {
      color: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300',
      icon: '⏳',
      label: 'Menunggu'
    },
    DIARAHKAN: {
      color: 'bg-orange-100 text-orange-800 ring-1 ring-orange-300',
      icon: '📍',
      label: 'Diarahkan'
    },
    SELESAI: {
      color: 'bg-green-100 text-green-800 ring-1 ring-green-300',
      icon: '✅',
      label: 'Selesai'
    },
    DITOLAK: {
      color: 'bg-red-100 text-red-800 ring-1 ring-red-300',
      icon: '❌',
      label: 'Ditolak'
    }
  };
  
  return configs[status as keyof typeof configs] || {
    color: 'bg-gray-100 text-gray-800 ring-1 ring-gray-300',
    icon: '❓',
    label: status
  };
};

export const formatDate = (dateString: string): string => {
  const isoString = dateString.includes('Z') || dateString.includes('+') 
    ? dateString 
    : dateString + 'Z';
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const closeModal = (
  setShow: (show: boolean) => void,
  setId: (id: number | null) => void,
  setData: (data: any) => void,
  defaultData: any
) => {
  setShow(false);
  setId(null);
  setData(defaultData);
};

export const exportToExcel = (data: any[], filename: string) => {
  const XLSX = require('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename);
};

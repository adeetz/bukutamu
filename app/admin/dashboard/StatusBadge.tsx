import { getStatusConfig } from './helpers';

interface StatusBadgeProps {
  status: string;
  diarahkanKe?: string | null;
  catatanBupati?: string | null;
}

export default function StatusBadge({ status, diarahkanKe, catatanBupati }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  
  return (
    <div className="space-y-1.5">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${config.color}`}>
        {config.icon} {config.label}
      </span>
      
      {diarahkanKe && (
        <div className="text-xs text-gray-600 bg-orange-50 px-2 py-1 rounded">
          <strong>→</strong> {diarahkanKe}
        </div>
      )}
      
      {catatanBupati && (
        <div className="text-xs text-gray-500 italic bg-blue-50 px-2 py-1 rounded">
          💬 {catatanBupati}
        </div>
      )}
    </div>
  );
}

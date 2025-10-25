import { getLocalDateString } from '@/app/utils/date';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  showDatePicker: boolean;
  onTogglePicker: () => void;
}

export function DatePicker({ selectedDate, onDateChange, showDatePicker, onTogglePicker }: DatePickerProps) {
  const handleTodayClick = () => {
    onDateChange(getLocalDateString());
    onTogglePicker();
  };

  const handleYesterdayClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
    onTogglePicker();
  };

  return (
    <div className="relative">
      <button
        onClick={onTogglePicker}
        className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-md border border-gray-200 transition-all flex items-center gap-2 font-medium"
      >
        <span>📅</span>
        <span>Hari Ini</span>
      </button>

      {showDatePicker && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[200px]">
          <div className="space-y-2">
            <input
              type="date"
              value={selectedDate}
              max={getLocalDateString()}
              onChange={(e) => {
                onDateChange(e.target.value);
                onTogglePicker();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            
            <div className="border-t border-gray-200 pt-2 space-y-1">
              <button
                onClick={handleTodayClick}
                className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                📅 Hari Ini
              </button>
              <button
                onClick={handleYesterdayClick}
                className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
              >
                ⏮️ Kemarin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

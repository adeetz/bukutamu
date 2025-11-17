// Constants untuk Dashboard
export const REFRESH_INTERVAL = 30000; // 30 detik
export const DEBOUNCE_DELAY = 500; // 500ms
export const DEFAULT_LIMIT = 1000; // Load semua data
export const EXPORT_LIMIT = 1000; // Limit untuk export

export const QUICK_SUGGESTIONS = [
  'Bagian Keuangan',
  'Sekretaris Daerah',
  'Dinas Pendidikan',
  'Dinas Kesehatan'
];

export const BUTTON_STYLES = {
  primary: 'px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95',
  success: 'px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95',
  danger: 'px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95',
  warning: 'px-6 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95',
  secondary: 'px-6 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all'
};

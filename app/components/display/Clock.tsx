interface ClockProps {
  currentTime: Date;
}

export function Clock({ currentTime }: ClockProps) {
  return (
    <div className="px-5 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
      <div className="text-center">
        <div className="text-3xl font-bold text-white tabular-nums">
          {new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(currentTime)}
        </div>
        <div className="text-xs text-blue-100 mt-0.5 font-medium">
          {new Intl.DateTimeFormat('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }).format(currentTime)}
        </div>
      </div>
    </div>
  );
}

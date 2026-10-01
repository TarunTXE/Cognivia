import { cn } from '../utils/helpers';

export default function ProgressBar({ value = 0, max = 100, className = '', showLabel = true, color = 'indigo' }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const colors = {
    indigo: 'bg-indigo-600',
    green:  'bg-emerald-500',
    yellow: 'bg-amber-500',
    red:    'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-slate-500 font-medium">Progress</span>
          <span className="text-xs font-semibold text-slate-700">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className={cn('h-1.5 rounded-full transition-all duration-700', colors[color] ?? colors.indigo)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

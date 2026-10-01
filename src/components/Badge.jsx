import { cn } from '../utils/helpers';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600 border border-slate-200',
    indigo:  'bg-indigo-50 text-indigo-700 border border-indigo-100',
    green:   'bg-emerald-50 text-emerald-700 border border-emerald-100',
    yellow:  'bg-amber-50 text-amber-700 border border-amber-100',
    red:     'bg-red-50 text-red-600 border border-red-100',
    blue:    'bg-sky-50 text-sky-700 border border-sky-100',
    purple:  'bg-violet-50 text-violet-700 border border-violet-100',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
        variants[variant] ?? variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

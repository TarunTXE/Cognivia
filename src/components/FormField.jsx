import { cn } from '../utils/helpers';

export default function FormField({
  label,
  id,
  error,
  required = false,
  hint,
  children,
  className = '',
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-slate-400 -mt-0.5">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow',
        'hover:border-slate-300',
        'disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={cn(
        'w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow',
        'hover:border-slate-300',
        'disabled:bg-slate-50 disabled:text-slate-500',
        'appearance-none',
        className,
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', paddingRight: '2.5rem' }}
      {...props}
    >
      {children}
    </select>
  );
}

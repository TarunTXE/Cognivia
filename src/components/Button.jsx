import { cn } from '../utils/helpers';

const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-sm hover:shadow-md',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 shadow-sm',
  outline:
    'bg-transparent text-indigo-600 border border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 active:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 shadow-sm',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-2.5 text-sm font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-150',
        'focus:outline-none',
        variants[variant],
        sizes[size],
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

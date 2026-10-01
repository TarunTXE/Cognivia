import { cn } from '../utils/helpers';

export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-xl card-shadow',
        padding && 'p-6',
        hover && 'card-shadow-hover transition-shadow duration-200 cursor-default',
        className,
      )}
    >
      {children}
    </div>
  );
}

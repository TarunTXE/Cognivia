export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-slate-500 text-sm sm:text-base leading-relaxed">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

export function SummaryCard({ title, value, unit }: { title: string; value: string | number; unit?: string; }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white/72 p-4 shadow-[0_12px_36px_rgba(80,48,24,0.08)] sm:p-5">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a4b28]">{title}</h4>
      <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#1d140d] sm:text-4xl">
        {value}
        {unit && <span className="ml-1 text-sm font-semibold tracking-normal text-[#5f5145]">{unit}</span>}
      </p>
    </div>
  );
}

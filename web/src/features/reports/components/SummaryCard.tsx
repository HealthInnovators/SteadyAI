export function SummaryCard({ title, value, unit }: { title: string; value: string | number; unit?: string; }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 text-center shadow-sm">
      <h4 className="text-sm font-medium uppercase tracking-wider text-[#7a4b28]">{title}</h4>
      <p className="mt-2 text-4xl font-bold text-[#1d140d]">
        {value}
        {unit && <span className="text-base font-medium ml-1 text-[#5f5145]">{unit}</span>}
      </p>
    </div>
  );
}

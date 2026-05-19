'use client';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 w-full items-center justify-between gap-4 rounded-[24px] border px-4 py-4 text-left text-base font-semibold shadow-[0_10px_34px_rgba(80,48,24,0.06)] transition active:scale-[0.99] ${
        selected
          ? 'border-[#1d140d] bg-[#1d140d] text-white dark:border-[#f3c99f] dark:bg-[#fff7ed] dark:text-[#1d140d]'
          : 'border-white/80 bg-[#fffaf5]/86 text-[#1d140d] hover:border-[#d8c4b3] hover:bg-white dark:border-[#4a372b] dark:bg-[#231914]/86 dark:text-[#fff7ed] dark:hover:border-[#f3c99f] dark:hover:bg-[#2b2018]'
      }`}
      aria-pressed={selected}
    >
      <span>{label}</span>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-white bg-white dark:border-[#1d140d]' : 'border-[#bca994] bg-white/60 dark:border-[#7b604d] dark:bg-[#15100c]'
        }`}
        aria-hidden="true"
      >
        {selected ? <span className="h-3 w-3 rounded-full bg-[#1d140d]" /> : null}
      </span>
    </button>
  );
}

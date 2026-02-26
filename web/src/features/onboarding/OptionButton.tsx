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
      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
        selected ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-black'
      }`}
    >
      {label}
    </button>
  );
}

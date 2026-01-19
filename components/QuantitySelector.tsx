"use client";

export default function QuantitySelector({
  value,
  setValue,
}: {
  value: number;
  setValue: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => value > 1 && setValue(value - 1)}
        className="w-10 h-10 rounded-full border text-lg"
      >
        −
      </button>
      <span className="text-lg font-medium">{value}</span>
      <button
        onClick={() => setValue(value + 1)}
        className="w-10 h-10 rounded-full border text-lg"
      >
        +
      </button>
    </div>
  );
}

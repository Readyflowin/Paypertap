import { Search } from "lucide-react";

export function OrderSearch({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">Search orders</span>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search customer, phone, order ID, product"
        className="min-h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950"
      />
    </label>
  );
}

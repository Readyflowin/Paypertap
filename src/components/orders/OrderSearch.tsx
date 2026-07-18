import { Search } from "lucide-react";

export function OrderSearch({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="ppt-dashboard-search relative block min-w-0">
      <span className="sr-only">Search orders</span>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -translate-y-1/2"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search customer, phone, order ID, product"
        className="w-full border bg-white text-sm outline-none"
      />
    </label>
  );
}

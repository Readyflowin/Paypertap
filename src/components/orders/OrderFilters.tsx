import {
  ORDER_STATUS_OPTIONS,
  type OrderLifecycleStatus,
  type OrderPaymentFilter,
  type OrderSortMode,
} from "./orderUtils";

export function OrderFilters({
  onPaymentChange,
  onSortChange,
  onStatusChange,
  payment,
  sort,
  status,
}: {
  onPaymentChange: (value: OrderPaymentFilter) => void;
  onSortChange: (value: OrderSortMode) => void;
  onStatusChange: (value: "all" | OrderLifecycleStatus) => void;
  payment: OrderPaymentFilter;
  sort: OrderSortMode;
  status: "all" | OrderLifecycleStatus;
}) {
  return (
    <div className="ppt-dashboard-filter-grid">
      <SelectControl
        label="Status"
        value={status}
        onChange={(value) => onStatusChange(value as "all" | OrderLifecycleStatus)}
        options={ORDER_STATUS_OPTIONS}
      />
      <SelectControl
        label="Payment"
        value={payment}
        onChange={(value) => onPaymentChange(value as OrderPaymentFilter)}
        options={[
          { label: "All payments", value: "all" },
          { label: "COD", value: "cod" },
          { label: "Partial Advance", value: "partial_advance" },
        ]}
      />
      <SelectControl
        label="Sort"
        value={sort}
        onChange={(value) => onSortChange(value as OrderSortMode)}
        options={[
          { label: "Newest first", value: "newest" },
          { label: "Oldest first", value: "oldest" },
        ]}
      />
    </div>
  );
}

function SelectControl({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="ppt-dashboard-filter-control">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border bg-white text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

import { useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";

import type { CheckoutSession, Product, Store } from "../../types/firestore";
import { PptEmptyState } from "../ui";
import { OrderCard } from "./OrderCard";
import { OrderFilters } from "./OrderFilters";
import { OrderSearch } from "./OrderSearch";
import {
  buildOrderSearchText,
  getOrderPaymentMode,
  getTimeValue,
  normalizeOrderStatus,
  type OrderLifecycleStatus,
  type OrderPaymentFilter,
  type OrderSortMode,
} from "./orderUtils";

type OrderManagementDashboardProps = {
  onOrderChanged: () => Promise<void>;
  orders: CheckoutSession[];
  products: Product[];
  store: Store | null;
};

export function OrderManagementDashboard({
  onOrderChanged,
  orders,
}: OrderManagementDashboardProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderLifecycleStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<OrderPaymentFilter>("all");
  const [sort, setSort] = useState<OrderSortMode>("newest");

  const counters = useMemo(() => {
    const initial = {
      cancelled: 0,
      completed: 0,
      pending_confirmation: 0,
      pending_payment: 0,
      processing: 0,
      total: orders.length,
    };

    return orders.reduce((count, order) => {
      const status = normalizeOrderStatus(order.status);

      if (status in count) {
        count[status as keyof typeof count] += 1;
      }

      return count;
    }, initial);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return [...orders]
      .filter((order) => {
        if (statusFilter !== "all" && normalizeOrderStatus(order.status) !== statusFilter) {
          return false;
        }

        if (paymentFilter !== "all" && getOrderPaymentMode(order) !== paymentFilter) {
          return false;
        }

        if (normalizedSearch && !buildOrderSearchText(order).includes(normalizedSearch)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const difference = getTimeValue(b.createdAt) - getTimeValue(a.createdAt);

        return sort === "newest" ? difference : -difference;
      });
  }, [orders, paymentFilter, search, sort, statusFilter]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Manage Orders</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
              Orders
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Track customer orders, payment return status, fulfilment progress, notes, and WhatsApp follow-up from one place.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <OrderCounter label="Total Orders" value={counters.total} />
          <OrderCounter label="Pending Payment" value={counters.pending_payment} />
          <OrderCounter label="Pending Confirmation" value={counters.pending_confirmation} />
          <OrderCounter label="Processing" value={counters.processing} />
          <OrderCounter label="Completed" value={counters.completed} />
          <OrderCounter label="Cancelled" value={counters.cancelled} />
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
        <OrderSearch value={search} onChange={setSearch} />
        <OrderFilters
          payment={paymentFilter}
          sort={sort}
          status={statusFilter}
          onPaymentChange={setPaymentFilter}
          onSortChange={setSort}
          onStatusChange={setStatusFilter}
        />
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white">
            <PptEmptyState
              title="No orders yet."
              description="New customer orders will appear here."
              icon={<PackageCheck size={24} aria-hidden="true" />}
            />
          </section>
        ) : filteredOrders.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white">
            <PptEmptyState
              title={statusFilter === "pending_payment" ? "You're all caught up." : "No matching orders"}
              description={
                statusFilter === "pending_payment"
                  ? "No pending payments need attention right now."
                  : "Try another search, status, payment method, or sort."
              }
              icon={<PackageCheck size={24} aria-hidden="true" />}
            />
          </section>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.checkoutId}
              order={order}
              onOrderChanged={onOrderChanged}
            />
          ))
        )}
      </div>
    </section>
  );
}

function OrderCounter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <strong className="mt-2 block text-2xl font-semibold tracking-tight text-gray-950">
        {value}
      </strong>
    </div>
  );
}

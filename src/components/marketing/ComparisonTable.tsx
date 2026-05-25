export function ComparisonTable() {
  const rows = [
    ["Product discovery", "Scattered posts and chats", "Clean public storefront link"],
    ["Buyer intent", "Holds without commitment", "Fixed Rs. 20 verified booking"],
    ["Order details", "Repeated manual questions", "Prefilled WhatsApp flow"],
    ["Remaining payment", "Seller handles directly", "Seller still handles directly"],
  ];

  return (
    <div className="overflow-hidden rounded-[24px] border border-violet-100 bg-white/76 shadow-[0_18px_48px_rgba(124,58,237,0.08)] backdrop-blur-xl">
      <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-violet-100 bg-violet-50/80 text-xs font-bold uppercase tracking-[0.12em] text-violet-500">
        <div className="min-w-0 p-4">Workflow</div>
        <div className="min-w-0 p-4">DM selling</div>
        <div className="min-w-0 p-4">PayPerTap</div>
      </div>
      {rows.map(([label, before, after]) => (
        <div
          key={label}
          className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-violet-50 last:border-b-0"
        >
          <div className="min-w-0 break-words p-4 text-sm font-bold text-neutral-950">
            {label}
          </div>
          <div className="min-w-0 break-words p-4 text-sm leading-6 text-[#777792]">
            {before}
          </div>
          <div className="min-w-0 break-words p-4 text-sm font-semibold leading-6 text-neutral-800">
            {after}
          </div>
        </div>
      ))}
    </div>
  );
}

export const ComparisonTableBlock = ComparisonTable;
export const MarketingComparisonTable = ComparisonTable;

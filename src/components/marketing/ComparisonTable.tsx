export function ComparisonTable() {
  const rows = [
    ["Product discovery", "Scattered posts and chats", "Clean public storefront link"],
    ["Buyer intent", "Holds without commitment", "order via PayPerTap"],
    ["order details", "Repeated manual questions", "Prefilled WhatsApp flow"],
    ["Remaining payment", "Seller handles directly", "Seller still handles directly"],
  ];

  return (
    <div className="ppt-core-comparison overflow-hidden rounded-[24px] border backdrop-blur-xl">
      <div className="ppt-core-comparison-head grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)] border-b text-xs font-bold uppercase tracking-[0.12em]">
        <div className="min-w-0 p-4">Workflow</div>
        <div className="min-w-0 p-4">DM selling</div>
        <div className="min-w-0 p-4">PayPerTap</div>
      </div>
      {rows.map(([label, before, after]) => (
        <div
          key={label}
          className="ppt-core-comparison-row grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)] border-b last:border-b-0"
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

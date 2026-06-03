import { Monitor, Smartphone } from "lucide-react";

import type { PreviewThemeId } from "./types";

export type PreviewDevice = "desktop" | "mobile";

const themeOptions: Array<{ id: PreviewThemeId; label: string; description: string }> = [
  {
    id: "editorial",
    label: "Editorial Thrift",
    description: "Premium thrift / streetwear",
  },
  {
    id: "boutique",
    label: "Boutique",
    description: "Clean D2C / Shopify-like",
  },
  {
    id: "instagram",
    label: "Instagram Store",
    description: "Youthful mobile-first drop",
  },
];

export function ThemePreviewControls({
  device,
  onDeviceChange,
  onThemeChange,
  selectedTheme,
}: {
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onThemeChange: (theme: PreviewThemeId) => void;
  selectedTheme: PreviewThemeId;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-4 shadow-[0_16px_44px_rgba(17,24,39,0.08)]">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A2E2E]">
            Internal preview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-4xl">
            PayPerTap Theme Preview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Preview only. No checkout, no payment, no Firestore reads, and no data writes.
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3 lg:w-auto lg:items-end">
          <div className="grid min-w-0 gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-1 sm:grid-cols-3">
            {themeOptions.map((theme) => {
              const isSelected = theme.id === selectedTheme;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onThemeChange(theme.id)}
                  className={`min-w-0 rounded-xl px-3 py-2 text-left transition ${
                    isSelected
                      ? "bg-neutral-950 text-white shadow-[0_10px_26px_rgba(17,24,39,0.18)]"
                      : "text-neutral-600 hover:bg-white hover:text-neutral-950"
                  }`}
                >
                  <span className="block truncate text-sm font-semibold">{theme.label}</span>
                  <span className={`mt-0.5 block truncate text-xs ${isSelected ? "text-white/66" : "text-neutral-400"}`}>
                    {theme.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid w-full min-w-0 grid-cols-2 gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-1 sm:w-[260px]">
            {([
              { id: "desktop" as const, label: "Desktop", icon: Monitor },
              { id: "mobile" as const, label: "Mobile", icon: Smartphone },
            ]).map((option) => {
              const Icon = option.icon;
              const isSelected = option.id === device;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onDeviceChange(option.id)}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                    isSelected
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

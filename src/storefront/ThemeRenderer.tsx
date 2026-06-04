import { Suspense } from "react";
import { getStorefrontThemeDefinition } from "./themes/registry";
import type { StorefrontThemeProps } from "./themes/types";

type ThemeRendererProps = StorefrontThemeProps & {
  selectedThemeId?: string | null;
};

function ThemeFallback() {
  return (
    <main className="pds-page grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-sm rounded-[28px] border border-[var(--pds-border)] bg-white/92 p-6 text-center shadow-[var(--pds-shadow-soft)]">
        <p className="text-sm font-medium text-[var(--pds-muted)]">
          Loading storefront...
        </p>
      </div>
    </main>
  );
}

export function ThemeRenderer({
  selectedThemeId,
  ...themeProps
}: ThemeRendererProps) {
  const theme = getStorefrontThemeDefinition(selectedThemeId);
  const ThemeComponent = theme.component;

  return (
    <Suspense fallback={<ThemeFallback />}>
      <ThemeComponent {...themeProps} />
    </Suspense>
  );
}

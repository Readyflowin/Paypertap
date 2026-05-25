import { getStorefrontThemeDefinition } from "./themes/registry";
import type { StorefrontThemeProps } from "./themes/types";

type ThemeRendererProps = StorefrontThemeProps & {
  selectedThemeId?: string | null;
};

export function ThemeRenderer({
  selectedThemeId,
  ...themeProps
}: ThemeRendererProps) {
  const theme = getStorefrontThemeDefinition(selectedThemeId);
  const ThemeComponent = theme.component;

  if (!ThemeComponent) {
    return (
      <main className="pds-page grid min-h-screen place-items-center px-4 py-10">
        <section className="w-full max-w-md rounded-[28px] border border-[var(--pds-border)] bg-white/92 p-6 text-center shadow-[var(--pds-shadow-soft)] sm:p-8">
          <h1 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-[var(--pds-text)]">
            Storefront upgrade in progress
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--pds-muted)]">
            This store will soon use one of PayPerTap&apos;s new premium themes.
          </p>
          <p className="mt-8 text-xs font-medium text-[var(--pds-muted)]">
            Powered by PayPerTap
          </p>
        </section>
      </main>
    );
  }

  return <ThemeComponent {...themeProps} />;
}

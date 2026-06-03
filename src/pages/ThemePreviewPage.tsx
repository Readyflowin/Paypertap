import { useState } from "react";

import { demoStorefrontData } from "@/storefront/themePreview/demoStorefrontData";
import {
  ThemePreviewControls,
  type PreviewDevice,
} from "@/storefront/themePreview/ThemePreviewControls";
import { ThemePreviewShell } from "@/storefront/themePreview/ThemePreviewShell";
import type { PreviewThemeId } from "@/storefront/themePreview/types";

export default function ThemePreviewPage() {
  const [selectedTheme, setSelectedTheme] = useState<PreviewThemeId>("editorial");
  const [device, setDevice] = useState<PreviewDevice>("desktop");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F6F1E8_0%,#f7f4ee_42%,#ffffff_100%)] px-3 py-4 text-neutral-950 sm:px-5 sm:py-6">
      <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-4">
        <ThemePreviewControls
          device={device}
          selectedTheme={selectedTheme}
          onDeviceChange={setDevice}
          onThemeChange={setSelectedTheme}
        />
        <ThemePreviewShell
          data={demoStorefrontData}
          device={device}
          themeId={selectedTheme}
        />
      </div>
    </main>
  );
}

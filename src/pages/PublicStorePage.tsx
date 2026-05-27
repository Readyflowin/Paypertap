import { useParams } from "react-router-dom";
import { Store as StoreIcon } from "lucide-react";

import {
  PptEmptyState,
  PptTapLoader,
} from "@/components/ui";
import { usePublicStore } from "@/hooks/usePublicStore";
import { ThemeRenderer } from "@/storefront/ThemeRenderer";

function StorefrontLoadingState() {
  return (
    <main className="pds-page grid min-h-screen place-items-center px-4 py-8">
      <PptTapLoader
        title="Loading storefront..."
        
      />
    </main>
  );
}

function StorefrontErrorState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <main className="pds-page grid min-h-screen place-items-center px-4 py-8">
      <PptEmptyState
        title={title}
        description={description}
        icon={<StoreIcon size={22} />}
      />
    </main>
  );
}

export default function PublicStorePage() {
  const { storeSlug = "" } = useParams();
  const { data, loading, error } = usePublicStore(storeSlug);

  if (loading) {
    return <StorefrontLoadingState />;
  }

  if (!data) {
    const isNotFound = error === "Store not found";

    return (
      <StorefrontErrorState
        title={isNotFound ? "Store not found" : "Unable to load this storefront right now"}
        description={
          isNotFound
            ? "This store may be unavailable or not published yet."
            : "Please try again in a little while."
        }
      />
    );
  }

  return (
    <ThemeRenderer
      store={data.store}
      collections={data.collections}
      products={data.products}
      storeSlug={storeSlug}
      isOwnerPreview={data.isOwnerPreview}
      selectedThemeId={data.store.themeId || data.store.selectedThemeId}
    />
  );
}

import type { PreviewThemeProps } from "../../types";
import { Theme2Footer } from "./Theme2Footer";
import { Theme2Header } from "./Theme2Header";
import { Theme2Hero } from "./Theme2Hero";
import { Theme2Sections } from "./Theme2Sections";

export function Theme2Preview({
  faqs,
  onProductSelect,
  products,
  store,
  testimonials,
}: PreviewThemeProps) {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#231812]">
      <Theme2Header store={store} />
      <Theme2Hero featureProducts={products.slice(1, 5)} store={store} />
      <Theme2Sections
        faqs={faqs}
        onProductSelect={onProductSelect}
        products={products}
        store={store}
        testimonials={testimonials}
      />
      <Theme2Footer store={store} />
    </main>
  );
}

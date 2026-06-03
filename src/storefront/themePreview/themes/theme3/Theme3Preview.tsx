import type { PreviewThemeProps } from "../../types";
import { Theme3Footer } from "./Theme3Footer";
import { Theme3Header } from "./Theme3Header";
import { Theme3Hero } from "./Theme3Hero";
import { Theme3Sections } from "./Theme3Sections";

export function Theme3Preview({
  faqs,
  onProductSelect,
  products,
  store,
  testimonials,
}: PreviewThemeProps) {
  return (
    <main className="min-h-screen bg-[#08080a] text-white">
      <Theme3Header store={store} />
      <Theme3Hero product={products[3]} store={store} />
      <Theme3Sections
        faqs={faqs}
        onProductSelect={onProductSelect}
        products={products}
        store={store}
        testimonials={testimonials}
      />
      <Theme3Footer store={store} />
    </main>
  );
}

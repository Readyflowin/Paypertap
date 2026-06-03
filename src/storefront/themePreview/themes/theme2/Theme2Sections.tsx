import { MessageCircle, ShieldCheck, Star } from "lucide-react";

import type {
  PreviewFaq,
  PreviewProduct,
  PreviewStore,
  PreviewTestimonial,
} from "../../types";
import { Theme2ProductCard } from "./Theme2ProductCard";

export function Theme2Sections({
  faqs,
  onProductSelect,
  products,
  store,
  testimonials,
}: {
  faqs: PreviewFaq[];
  onProductSelect: (product: PreviewProduct) => void;
  products: PreviewProduct[];
  store: PreviewStore;
  testimonials: PreviewTestimonial[];
}) {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-3 md:grid-cols-4">
          {store.trustBadges.map((badge) => (
            <div key={badge} className="rounded-[22px] border border-[#eadfd4] bg-white p-4">
              <ShieldCheck size={19} className="text-[#7a5a43]" />
              <p className="mt-3 text-sm font-semibold text-[#3b2b22]">{badge}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8370]">
              Curated collections
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-0.055em] text-[#231812]">
              Shop by mood
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#715d4c]">
            Built to feel like a polished D2C store while keeping PayPerTap booking clear.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {store.collections.map((collection, index) => (
            <a
              key={collection}
              href="#products"
              className={`min-h-32 rounded-[24px] border border-[#eadfd4] p-4 text-[#231812] ${
                index % 2 === 0 ? "bg-[#fff8f0]" : "bg-white"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8370]">
                Collection
              </span>
              <strong className="mt-8 block text-xl tracking-[-0.04em]">{collection}</strong>
            </a>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-7">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8370]">
              Bestsellers
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-0.055em] text-[#231812]">
              Clean product grid
            </h2>
          </div>
          <span className="rounded-full bg-[#3b2b22] px-4 py-2 text-xs font-semibold text-white">
            Preview only
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <Theme2ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7">
        <div className="grid gap-3 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.name} className="rounded-[26px] bg-[#fff8f0] p-5">
              <div className="flex gap-1 text-[#9f6b28]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-[#5f4b3d]">"{testimonial.quote}"</p>
              <footer className="mt-5 text-sm font-semibold text-[#231812]">
                {testimonial.name}
                <span className="block text-xs font-medium text-[#9a8370]">
                  {testimonial.meta}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7">
        <div className="grid gap-4 rounded-[30px] bg-[#3b2b22] p-5 text-white md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <MessageCircle size={24} />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">
              How booking works
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Buyer pays Rs. 20 to reserve, then confirms details with the seller on WhatsApp.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[22px] bg-white/10 p-4">
                <strong className="text-sm">{faq.question}</strong>
                <p className="mt-3 text-xs leading-6 text-white/62">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

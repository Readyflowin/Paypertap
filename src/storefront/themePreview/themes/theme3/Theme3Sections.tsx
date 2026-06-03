import { MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import type {
  PreviewFaq,
  PreviewProduct,
  PreviewStore,
  PreviewTestimonial,
} from "../../types";
import { Theme3ProductCard } from "./Theme3ProductCard";

export function Theme3Sections({
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
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {store.collections.map((collection) => (
            <a
              key={collection}
              href="#products"
              className="shrink-0 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/72"
            >
              {collection}
            </a>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
              Drop grid
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.07em] text-white">
              Tap-worthy products
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/54">
            Designed for fast mobile browsing, social proof, and clear booking intent.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <Theme3ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-6 md:grid-cols-3">
        {store.trustBadges.slice(0, 3).map((badge, index) => (
          <div
            key={badge}
            className={`rounded-[28px] p-5 ${
              index === 0 ? "bg-lime-300 text-neutral-950" : "border border-white/10 bg-white/8 text-white"
            }`}
          >
            <ShieldCheck size={22} />
            <p className="mt-5 text-xl font-black tracking-[-0.04em]">{badge}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 text-white">
          <Sparkles size={24} className="text-lime-300" />
          <h2 className="mt-5 text-4xl font-black leading-none tracking-[-0.07em]">
            Why buyers trust this store
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/58">{store.story}</p>
        </div>
        <div className="grid gap-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.name} className="rounded-[26px] border border-white/10 bg-white/8 p-5 text-white">
              <p className="text-sm leading-7 text-white/68">"{testimonial.quote}"</p>
              <footer className="mt-4 text-sm font-black">
                {testimonial.name}
                <span className="block text-xs font-bold text-white/38">{testimonial.meta}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-[32px] bg-white p-5 text-neutral-950">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-950 text-white">
              <MessageCircle size={20} />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.05em]">
                WhatsApp booking explained
              </h2>
              <p className="text-sm text-neutral-500">Preview-only FAQ blocks below.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[22px] bg-neutral-100 p-4">
                <strong className="text-sm">{faq.question}</strong>
                <p className="mt-3 text-xs leading-6 text-neutral-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

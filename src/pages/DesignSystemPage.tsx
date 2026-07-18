import React from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  Check,
  Copy,
  Eye,
  ImageIcon,
  Info,
  Mail,
  MessageCircle,
  Package,
  Palette,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  UploadCloud,
  WalletCards,
} from "lucide-react";
import {
  PptBadge as Badge,
  PptBrandIcon as BrandIcon,
  PptButton as Button,
  PptEmptyState as EmptyState,
  PptField as Field,
  PptIconButton as IconButton,
  PptNotice as Notice,
  PptSelectField as SelectField,
  PptSkeletonProductGrid as SkeletonSet,
  PptStatCard as StatCard,
  PptTapLoader,
  type PptTone,
} from "../components/ui";

const colorTokens = [
  ["Background", "#F7F7FA"],
  ["Surface", "#FFFFFF"],
  ["Soft Surface", "#F3F0FF"],
  ["Text", "#111217"],
  ["Muted", "#737783"],
  ["Border", "#E6E7EC"],
  ["Primary", "#5B35F5"],
  ["Primary Dark", "#2E1A79"],
  ["Success", "#079455"],
  ["Warning", "#DC6803"],
  ["Danger", "#D92D20"],
  ["WhatsApp", "#16A34A"],
];

const badgeSamples: Array<[string, PptTone, React.ReactNode]> = [
  ["Live", "success", <ShieldCheck size={13} />],
  ["Open", "success", null],
  ["1 left", "warning", null],
  ["Hot", "hot", null],
  ["Reserved", "reserved", null],
  ["Sold", "sold", null],
  ["Order Sucesfull", "success", null],
  ["Processing", "info", null],
  ["Failed", "danger", null],
  ["Draft", "neutral", null],
  ["Private", "dark", null],
];

function Section({
  index,
  label,
  title,
  description,
  children,
}: {
  index: string;
  label: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pds-section">
      <div className="pds-section-head">
        <p>
          {index} {label}
        </p>
        <h2>{title}</h2>
        {description ? <span>{description}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Toggle({ label, checked = true }: { label: string; checked?: boolean }) {
  return (
    <div className="pds-toggle-row">
      <span>{label}</span>
      <button type="button" className={["pds-toggle", checked ? "is-on" : ""].join(" ")}>
        <i />
      </button>
    </div>
  );
}

function ProductCard() {
  return (
    <article className="pds-product-card">
      <div className="pds-product-image">
        <div className="pds-product-floating">
          <Badge tone="warning">1 left</Badge>
        </div>
        <div className="pds-product-object">
          <span>Vintage</span>
          <strong>Denim</strong>
        </div>
      </div>

      <div className="pds-product-body">
        <div className="pds-product-meta">
          <span>Fresh drop</span>
          <Badge tone="success">Open</Badge>
        </div>

        <h3>Vintage Denim Jacket</h3>
        <p>Clean oversized fit, limited piece, ready to order.</p>

        <div className="pds-product-price">
          <strong>Rs 899</strong>
          <span>Place order</span>
        </div>

        <Button variant="primary" fullWidth rightIcon={<ArrowRight size={17} />}>
          View product
        </Button>
      </div>
    </article>
  );
}

function StoreHeaderPreview() {
  return (
    <div className="pds-store-preview">
      <div className="pds-store-top">
        <div className="pds-store-logo">
          <Store size={22} />
        </div>
        <div className="pds-store-copy">
          <strong>Urban Vault</strong>
          <span>Fresh drops, limited pieces.</span>
        </div>
        <div className="pds-store-actions">
          <IconButton label="Instagram" tone="instagram">
            <BrandIcon type="instagram" />
          </IconButton>
          <Badge tone="success">Live</Badge>
        </div>
      </div>

      <div className="pds-store-hero-card">
        <Badge tone="reserved">Limited stock</Badge>
        <h3>Shop limited pieces before they sell out.</h3>
        <p>Place an order. Pay the seller directly if required.</p>
      </div>
    </div>
  );
}

function CheckoutPreview() {
  return (
    <div className="pds-checkout-card">
      <div className="pds-checkout-head">
        <WalletCards size={20} />
        <div>
          <strong>Place your order</strong>
          <span>Seller receives the order. Customer payments stay direct.</span>
        </div>
      </div>
      <Button variant="primary" fullWidth rightIcon={<ArrowRight size={17} />}>
        Create order
      </Button>
    </div>
  );
}

function OrderSuccessPreview() {
  return (
    <div className="pds-success-card">
      <div className="pds-success-icon">
        <Check size={22} />
      </div>
      <h3>order submitted</h3>
      <p>Your order has been sent to the seller. Continue on WhatsApp for delivery and payment coordination.</p>
      <Button variant="whatsapp" fullWidth icon={<BrandIcon type="whatsapp" />}>
        Message seller on WhatsApp
      </Button>
      <span className="pds-success-note">WhatsApp is the primary follow-up action.</span>
    </div>
  );
}

function UploadPreview() {
  return (
    <div className="pds-upload-card">
      <div className="pds-upload-icon">
        <UploadCloud size={22} />
      </div>
      <strong>Upload product image</strong>
      <p>JPEG, PNG, WebP or GIF up to 5MB.</p>
      <Button variant="secondary" icon={<ImageIcon size={16} />}>
        Choose image
      </Button>
    </div>
  );
}

function CustomizationPreview() {
  return (
    <div className="pds-custom-card">
      <div className="pds-custom-head">
        <div>
          <Badge tone="primary" icon={<Palette size={13} />}>
            Store customization
          </Badge>
          <h3>Make each seller store feel personal.</h3>
          <p>Sellers can tune colors, header copy, logo, Instagram, and store visibility.</p>
        </div>
      </div>

      <div className="pds-custom-grid">
        <Field label="Store heading" placeholder="Streetwear collection" icon={<Store size={17} />} />
        <SelectField
          label="Theme style"
          value="Soft boutique"
          onChange={() => undefined}
          options={["Soft boutique", "Minimal", "Bold drop"]}
        />
        <Field label="Instagram link" placeholder="@urbanvault.in" icon={<BrandIcon type="instagram" size={17} />} />
        <Field label="Hero subtitle" placeholder="Limited pieces. First come, first served." />
      </div>

      <div className="pds-color-row">
        {["#5B35F5", "#111217", "#16A34A", "#F97316", "#EC4899"].map((color) => (
          <button
            key={color}
            type="button"
            className="pds-color-dot"
            style={{ backgroundColor: color }}
            aria-label={`Select ${color}`}
          />
        ))}
      </div>

      <div className="pds-toggle-stack">
        <Toggle label="Show Instagram button" />
        <Toggle label="Store is published" />
        <Toggle label="Show first-come-first-served badge" checked={false} />
      </div>
    </div>
  );
}

function ChartPreview() {
  return (
    <div className="pds-chart-card">
      <div className="pds-chart-head">
        <div>
          <strong>Order trend</strong>
          <span>Last 7 days</span>
        </div>
        <Badge tone="success">+18%</Badge>
      </div>
      <svg viewBox="0 0 560 170" className="pds-chart" role="img" aria-label="Order trend chart">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5B35F5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#5B35F5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M20 135 C85 115, 95 74, 152 92 C212 112, 228 42, 296 64 C350 82, 374 34, 430 52 C486 70, 498 38, 540 28"
          fill="none"
          stroke="#5B35F5"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M20 135 C85 115, 95 74, 152 92 C212 112, 228 42, 296 64 C350 82, 374 34, 430 52 C486 70, 498 38, 540 28 L540 160 L20 160 Z"
          fill="url(#chartFill)"
        />
        <path
          d="M20 145 C92 138, 132 128, 180 134 C238 142, 270 110, 322 120 C392 135, 428 105, 540 112"
          fill="none"
          stroke="#16A34A"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

function ProductManagerPreview() {
  return (
    <div className="pds-manager-card">
      <div className="pds-manager-row">
        <div className="pds-manager-img">
          <Package size={20} />
        </div>
        <div className="pds-manager-copy">
          <strong>Vintage Denim Jacket</strong>
          <span>Rs 899 - partial advance optional</span>
        </div>
        <Badge tone="success">Open</Badge>
        <Button variant="secondary" icon={<Eye size={16} />}>
          View
        </Button>
        <Button variant="dark" icon={<Settings size={16} />}>
          Edit
        </Button>
      </div>

      <div className="pds-manager-row">
        <div className="pds-manager-img muted">
          <ShoppingBag size={20} />
        </div>
        <div className="pds-manager-copy">
          <strong>Boxy Hoodie</strong>
          <span>Rs 749 - reserved by buyer</span>
        </div>
        <Badge tone="reserved">Reserved</Badge>
        <Button variant="whatsapp" icon={<BrandIcon type="whatsapp" size={17} />}>
          Follow up
        </Button>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <>
<main className="pds-page">
        <div className="pds-container">
          <section className="pds-hero">
            <div className="pds-hero-copy">
              <div className="pds-kicker">
                <ShieldCheck size={16} />
                PayPerTap design system
              </div>
              <h1>Reusable UI for storefronts, orders and seller dashboards.</h1>
              <p>
                A refined component kit for Instagram-first sellers: lighter typography,
                real icons, polished controls, store customization, clear order states,
                and conversion-focused buyer flows.
              </p>
              <div className="pds-hero-actions">
                <Button variant="primary" icon={<ShieldCheck size={17} />}>
                  Place order
                </Button>
                <Button variant="secondary" icon={<Eye size={17} />}>
                  Preview store
                </Button>
              </div>
            </div>

            <div className="pds-hero-card">
              <StoreHeaderPreview />
            </div>
          </section>

          <Section
            index="01"
            label="Tokens"
            title="Color foundation"
            description="Calm surfaces, restrained violet accents, readable text and separate social/trust colors."
          >
            <div className="pds-token-grid">
              {colorTokens.map(([name, value]) => (
                <div className="pds-token" key={name}>
                  <div className="pds-token-color" style={{ backgroundColor: value }} />
                  <div>
                    <strong>{name}</strong>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            index="02"
            label="Actions"
            title="Buttons"
            description="Primary, secondary, social, loading, success, disabled, sizes and full-width states."
          >
            <div className="pds-panel">
              <div className="pds-row">
                <Button variant="primary" icon={<ShieldCheck size={17} />}>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger" icon={<AlertCircle size={17} />}>Danger</Button>
                <Button variant="success" icon={<Check size={17} />}>Success</Button>
                <Button variant="whatsapp" icon={<BrandIcon type="whatsapp" />}>WhatsApp</Button>
                <Button variant="instagram" icon={<BrandIcon type="instagram" />}>Instagram</Button>
                <Button variant="dark">Dark</Button>
              </div>

              <div className="pds-row">
                <Button variant="primary" loading>Saving product</Button>
                <Button variant="success" success>Saved</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" rounded="pill" fullWidth rightIcon={<ArrowRight size={17} />}>
                  Full width pill
                </Button>
              </div>

              <div className="pds-row">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="xl">Extra large</Button>
              </div>
            </div>
          </Section>

          <Section
            index="03"
            label="Icon actions"
            title="Icon buttons"
            description="Compact tap targets for store socials, dashboard tools, copy actions, uploads and favorites."
          >
            <div className="pds-panel">
              <div className="pds-icon-row">
                <IconButton label="Search"><Search size={20} /></IconButton>
                <IconButton label="Copy" tone="primary"><Copy size={20} /></IconButton>
                <IconButton label="Favorite"><Eye size={20} /></IconButton>
                <IconButton label="Instagram" tone="instagram"><BrandIcon type="instagram" size={20} /></IconButton>
                <IconButton label="WhatsApp" tone="whatsapp"><BrandIcon type="whatsapp" size={20} /></IconButton>
                <IconButton label="Settings" tone="dark"><Settings size={20} /></IconButton>
              </div>
            </div>
          </Section>

          <Section
            index="04"
            label="Forms"
            title="Inputs, selects and toggles"
            description="Seller onboarding, product forms, checkout forms and store customization controls."
          >
            <div className="pds-panel">
              <div className="pds-form-grid">
                <Field label="Store name" placeholder="Urban Vault" icon={<Store size={17} />} />
                <Field label="Instagram profile" placeholder="@urbanvault.in" icon={<BrandIcon type="instagram" size={17} />} />
                <Field label="Email" placeholder="seller@example.com" icon={<Mail size={17} />} helper="Used for order and wallet notifications." />
                <Field label="WhatsApp number" placeholder="Enter 10-digit WhatsApp number" icon={<BrandIcon type="whatsapp" size={17} />} error="Please enter a valid 10-digit Indian WhatsApp number." />
                <SelectField
                  label="Store theme"
                  value="Soft boutique"
                  onChange={() => undefined}
                  options={["Soft boutique", "Minimal", "Bold drop"]}
                />
                <Field label="Product description" placeholder="Describe fit, condition and delivery notes." textarea />
              </div>
            </div>
          </Section>

          <Section
            index="05"
            label="Commerce"
            title="Storefront, checkout and order components"
            description="Reusable cards for public store, product detail, checkout and order success pages."
          >
            <div className="pds-commerce-grid">
              <ProductCard />
              <div className="pds-stack">
                <div className="pds-flow-grid">
                  <CheckoutPreview />
                  <OrderSuccessPreview />
                  <UploadPreview />
                </div>
              </div>
            </div>
          </Section>

          <Section
            index="06"
            label="Customization"
            title="Store customization panel"
            description="This should become the seller-facing dashboard section for colors, heading text, logo and social settings."
          >
            <CustomizationPreview />
          </Section>

          <Section
            index="07"
            label="Status"
            title="Badges"
            description="Readable pill statuses for products, orders, stores and payment moments."
          >
            <div className="pds-panel">
              <div className="pds-row">
                {badgeSamples.map(([label, tone, icon]) => (
                  <Badge key={label} tone={tone} icon={icon}>
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </Section>

          <Section
            index="08"
            label="Feedback"
            title="Loading and skeletons"
            description="Custom tap pulse loaders and shimmer placeholders for storefront and dashboard loading states."
          >
            <div className="pds-loading-grid">
              <PptTapLoader />
              <SkeletonSet />
            </div>
          </Section>

          <Section
            index="09"
            label="Empty"
            title="Empty states"
            description="Seller-friendly states when products, orders, customers or store content is missing."
          >
            <div className="pds-empty-grid">
              <EmptyState
                title="No products yet"
                description="Add your first product and share your PayPerTap link instead of taking manual DM orders."
                icon={<Package size={22} />}
                action={<Button variant="primary" icon={<Plus size={17} />}>Add product</Button>}
              />
              <EmptyState
                title="No orders yet"
                description="When buyers place orders, their details will show up here."
                icon={<CalendarCheck size={22} />}
                action={<Button variant="secondary" icon={<Store size={17} />}>View store</Button>}
              />
            </div>
          </Section>

          <Section
            index="10"
            label="Notices"
            title="Inline notices"
            description="Soft feedback blocks for saved states, upload failures, low stock and wallet/order explanations."
          >
            <div className="pds-notice-grid">
              <Notice tone="success" title="Store link copied" icon={<Check size={19} />}>
                Paste it in your Instagram bio or WhatsApp broadcast.
              </Notice>
              <Notice tone="danger" title="Upload failed" icon={<AlertCircle size={19} />}>
                Try a smaller JPG, PNG, WebP or GIF image.
              </Notice>
              <Notice tone="warning" title="Low stock" icon={<AlertCircle size={19} />}>
                Only one piece is left. Buyers will see an urgency badge.
              </Notice>
              <Notice tone="info" title="order flow" icon={<Info size={19} />}>
                Buyers place orders, sellers receive them, and PayPerTap charges the seller wallet.
              </Notice>
            </div>
          </Section>

          <Section
            index="11"
            label="Dashboard"
            title="Seller dashboard cards, chart and product rows"
            description="Shopify-lite dashboard pieces tailored to PayPerTap sellers."
          >
            <div className="pds-dashboard-grid">
              <StatCard icon={<ShoppingBag size={20} />} label="Open products" value="24" detail="+6 this week" />
              <StatCard icon={<WalletCards size={20} />} label="Wallet balance" value="Rs 950" detail="50 paid orders" tone="success" />
              <StatCard icon={<MessageCircle size={20} />} label="WhatsApp leads" value="86" detail="+12 new leads" tone="info" />
            </div>

            <div style={{ height: 18 }} />

            <ChartPreview />

            <div style={{ height: 18 }} />

            <ProductManagerPreview />
          </Section>

          <p className="pds-footer-note">
            This route is for internal visual review. It is not linked from public navigation.
          </p>
        </div>
      </main>
    </>
  );
}

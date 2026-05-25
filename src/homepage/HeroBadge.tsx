const INSTAGRAM_LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/f/f2/Instagram-Logo-Round-Color.png";

const WHATSAPP_LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/WhatsApp_Logo_green.svg/500px-WhatsApp_Logo_green.svg.png";

function LogoImg({
  src,
  alt,
  size = 20,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  );
}

export function InstagramIcon({ size = 20 }: { size?: number }) {
  return <LogoImg src={INSTAGRAM_LOGO_URL} alt="Instagram" size={size} />;
}

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return <LogoImg src={WHATSAPP_LOGO_URL} alt="WhatsApp" size={size} />;
}

export function HeroBadge() {
  return (
    <>
      <InstagramIcon size={18} />
      <WhatsAppIcon size={18} />
      <span>Built for Instagram &amp; WhatsApp Sellers</span>
    </>
  );
}

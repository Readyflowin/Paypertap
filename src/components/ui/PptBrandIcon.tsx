export type PptBrandIconProps = {
  type: "instagram" | "whatsapp";
  size?: number;
};

export function PptBrandIcon({ type, size = 18 }: PptBrandIconProps) {
  if (type === "whatsapp") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="pds-brand-icon pds-brand-whatsapp"
      >
        <path
          fill="currentColor"
          d="M16.02 3.2C9 3.2 3.3 8.87 3.3 15.85c0 2.24.59 4.42 1.72 6.35L3.2 28.8l6.78-1.78a12.78 12.78 0 0 0 6.04 1.53h.01c7.01 0 12.72-5.68 12.72-12.66S23.04 3.2 16.02 3.2Zm0 23.18h-.01a10.58 10.58 0 0 1-5.38-1.47l-.39-.23-4.02 1.06 1.07-3.9-.25-.4a10.45 10.45 0 0 1-1.6-5.59c0-5.78 4.75-10.48 10.58-10.48 2.83 0 5.49 1.1 7.49 3.08a10.4 10.4 0 0 1 3.1 7.4c0 5.78-4.75 10.53-10.59 10.53Zm5.8-7.86c-.32-.16-1.88-.92-2.17-1.03-.29-.1-.5-.16-.72.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.56-.94-.84-1.58-1.87-1.77-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.72-.98-2.35-.26-.62-.52-.53-.72-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.07 1.3 3.28c.16.21 2.24 3.4 5.42 4.76.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="pds-brand-icon pds-brand-instagram"
    >
      <rect width="32" height="32" rx="9" fill="url(#ppt-instagram-gradient)" />
      <path
        fill="#fff"
        d="M16 10.1a5.9 5.9 0 1 0 0 11.8 5.9 5.9 0 0 0 0-11.8Zm0 9.7a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6Zm7.55-9.95a1.38 1.38 0 1 1-2.75 0 1.38 1.38 0 0 1 2.75 0Z"
      />
      <path
        fill="#fff"
        d="M21.06 5.6H10.94A5.35 5.35 0 0 0 5.6 10.94v10.12a5.35 5.35 0 0 0 5.34 5.34h10.12a5.35 5.35 0 0 0 5.34-5.34V10.94a5.35 5.35 0 0 0-5.34-5.34Zm3.25 15.46a3.25 3.25 0 0 1-3.25 3.25H10.94a3.25 3.25 0 0 1-3.25-3.25V10.94a3.25 3.25 0 0 1 3.25-3.25h10.12a3.25 3.25 0 0 1 3.25 3.25v10.12Z"
      />
      <defs>
        <linearGradient id="ppt-instagram-gradient" x1="5" x2="28" y1="28" y2="4">
          <stop stopColor="#FEDA75" />
          <stop offset=".3" stopColor="#FA7E1E" />
          <stop offset=".55" stopColor="#D62976" />
          <stop offset=".78" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

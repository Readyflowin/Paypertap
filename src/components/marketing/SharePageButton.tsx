import { useState } from "react";
import { Share2 } from "lucide-react";

type SharePageButtonProps = {
  label?: string;
};

export function SharePageButton({ label = "Share PayPerTap" }: SharePageButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof window === "undefined") return;

    const shareData = {
      title: document.title || "PayPerTap",
      text: "PayPerTap helps sellers create verified booking storefronts.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="ppt-share-page-button"
      aria-label={copied ? "Page link copied" : label}
      onClick={handleShare}
    >
      <Share2 size={15} aria-hidden="true" />
      <span>{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

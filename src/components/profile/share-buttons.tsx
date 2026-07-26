"use client";

import * as React from "react";
import { Share2, Copy, Check, QrCode } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { IconButton } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ShareButtons({ url, qrDataUrl }: { url: string; qrDataUrl: string }) {
  const { push } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [qrOpen, setQrOpen] = React.useState(false);

  async function onShare() {
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "Liderlar.uz profili" });
        return;
      } catch {
        // user cancelled — fall through to clipboard copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    push({ title: "Havola nusxalandi", variant: "success" });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Ulashish" onClick={onShare} variant="secondary">
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
      </IconButton>
      <IconButton aria-label="Nusxalash" onClick={() => { navigator.clipboard.writeText(url); push({ title: "Havola nusxalandi", variant: "success" }); }} variant="secondary">
        <Copy className="h-4 w-4" aria-hidden />
      </IconButton>
      <IconButton aria-label="QR-kod" onClick={() => setQrOpen(true)} variant="secondary">
        <QrCode className="h-4 w-4" aria-hidden />
      </IconButton>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Profil QR-kodi" className="max-w-xs text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Profil QR kodi" className="mx-auto h-56 w-56" />
        <p className="mt-3 break-all text-xs text-ink-soft">{url}</p>
      </Modal>
    </div>
  );
}

"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { requestEdit } from "@/app/kabinet/actions";

export function EditRequestButton() {
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit() {
    if (note.trim().length < 10) {
      push({ title: "Iltimos, batafsilroq yozing", variant: "error" });
      return;
    }
    setSubmitting(true);
    const result = await requestEdit(note.trim());
    setSubmitting(false);
    if (result.ok) {
      push({ title: "So'rov yuborildi", description: "Tahririyat tez orada ko'rib chiqadi.", variant: "success" });
      setOpen(false);
      setNote("");
    } else {
      push({ title: "Xatolik", description: result.error, variant: "error" });
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Tahrir so&apos;rovi yuborish
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Tahrir so'rovi">
        <p className="mb-3 text-sm text-ink-soft">
          Tasdiqlangan biografiyangizni to&apos;g&apos;ridan-to&apos;g&apos;ri o&apos;zgartira olmaysiz — nimani
          o&apos;zgartirishni xohlaganingizni yozing, tahririyat ko&apos;rib chiqadi.
        </p>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Masalan: hudud noto'g'ri ko'rsatilgan, ..." />
        <Button className="mt-4 w-full" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Yuborilmoqda..." : "Yuborish"}
        </Button>
      </Modal>
    </>
  );
}

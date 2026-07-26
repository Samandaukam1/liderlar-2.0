"use client";

import * as React from "react";
import { useForm, useFieldArray, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, CheckCircle2, UploadCloud } from "lucide-react";
import {
  monthlyUpdatePayloadSchema,
  type MonthlyUpdatePayload,
  type MonthlyUpdateFormValues,
} from "@/lib/validation/monthly-update";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/input";
import { Button, IconButton } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { value, label: d.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" }) };
  });
}

const SECTIONS = [
  { key: "books", label: "O'qigan kitoblar", tone: "bg-gradient-blue" },
  { key: "achievements", label: "Yutuqlar", tone: "bg-gradient-coral" },
  { key: "events", label: "Tadbirlar", tone: "bg-gradient-violet" },
  { key: "projects", label: "Loyihalar", tone: "bg-gradient-mint" },
  { key: "other", label: "Boshqa ma'lumot", tone: "bg-gradient-peach" },
  { key: "files", label: "Fayllar", tone: "bg-gradient-blue" },
] as const;

function draftKey(token: string) {
  return `liderlar_monthly_update_draft_${token}`;
}

export function MonthlyUpdateForm({ token }: { token: string }) {
  const { push } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [autosaveNote, setAutosaveNote] = React.useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MonthlyUpdateFormValues, unknown, MonthlyUpdatePayload>({
    resolver: zodResolver(monthlyUpdatePayloadSchema),
    defaultValues: {
      periodMonth: monthOptions()[0].value,
      booksRead: [],
      achievements: [],
      events: [],
      projects: [],
      videoLinks: [],
    },
  });

  const books = useFieldArray({ control, name: "booksRead" });
  const achievements = useFieldArray({ control, name: "achievements" });
  const events = useFieldArray({ control, name: "events" });
  const projects = useFieldArray({ control, name: "projects" });
  const videoLinks = useFieldArray({ control, name: "videoLinks" });

  const watchedValues = useWatch({ control });

  // Restore autosaved draft on mount.
  React.useEffect(() => {
    const raw = window.localStorage.getItem(draftKey(token));
    if (raw) {
      try {
        reset(JSON.parse(raw));
      } catch {
        // ignore corrupt draft
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Debounced autosave.
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      window.localStorage.setItem(draftKey(token), JSON.stringify(watchedValues));
      setAutosaveNote(`Avtomatik saqlandi — ${new Date().toLocaleTimeString("uz-UZ")}`);
    }, 800);
    return () => clearTimeout(timeout);
  }, [watchedValues, token]);

  const filledCount = [
    watchedValues.booksRead?.length,
    watchedValues.achievements?.length,
    watchedValues.events?.length,
    watchedValues.projects?.length,
    watchedValues.volunteering || watchedValues.newRolesOrEducation || watchedValues.mediaAppearances,
    files.length,
  ].filter(Boolean).length;
  const progress = Math.round((filledCount / SECTIONS.length) * 100);

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected]);
  }

  async function onSubmit(values: MonthlyUpdatePayload) {
    const formData = new FormData();
    formData.set("token", token);
    formData.set("payload", JSON.stringify(values));
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/monthly-update/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Xatolik yuz berdi.");
      window.localStorage.removeItem(draftKey(token));
      setSubmitted(true);
    } catch (err) {
      push({
        title: "Yuborishda xatolik",
        description: err instanceof Error ? err.message : "Qayta urinib ko'ring.",
        variant: "error",
      });
    }
  }

  if (submitted) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-brand-soft bg-mint/10 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-mint text-white">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </span>
        <h2 className="font-display text-2xl font-bold text-navy">Rahmat! Ma&apos;lumotlaringiz yuborildi</h2>
        <p className="max-w-md text-ink-soft">
          Yuborilgan ma&apos;lumot avval tahririyat tomonidan ko&apos;rib chiqiladi, so&apos;ngra profilingizga
          qo&apos;shiladi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="sticky top-16 z-10 rounded-full border border-brand-soft bg-paper/95 p-3 shadow-card backdrop-blur">
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-ink-soft">
          <span>To&apos;ldirilgan qismlar</span>
          <span>{autosaveNote}</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-navy/8 px-2">
          <div className="h-full rounded-full bg-gradient-blue transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
        <label className="mb-1.5 block text-sm font-medium text-navy">Qaysi oy uchun yuborilmoqda?</label>
        <Select {...register("periodMonth")} className="max-w-xs">
          {monthOptions().map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </section>

      <DynamicListSection
        tone="bg-gradient-blue"
        title="O'qigan kitoblaringiz"
        addLabel="Kitob qo'shish"
        fields={books.fields}
        onAdd={() => books.append({ title: "", detail: "" })}
        onRemove={books.remove}
        titlePlaceholder="Kitob nomi"
        detailPlaceholder="Muallif"
        registerTitle={(i) => register(`booksRead.${i}.title` as const)}
        registerDetail={(i) => register(`booksRead.${i}.detail` as const)}
        error={errors.booksRead}
      />

      <DynamicListSection
        tone="bg-gradient-coral"
        title="Erishgan yutuqlaringiz"
        addLabel="Yutuq qo'shish"
        fields={achievements.fields}
        onAdd={() => achievements.append({ title: "", detail: "" })}
        onRemove={achievements.remove}
        titlePlaceholder="Yutuq nomi"
        detailPlaceholder="Qisqacha tavsif"
        registerTitle={(i) => register(`achievements.${i}.title` as const)}
        registerDetail={(i) => register(`achievements.${i}.detail` as const)}
        error={errors.achievements}
      />

      <DynamicListSection
        tone="bg-gradient-violet"
        title="Qatnashgan tadbirlaringiz"
        addLabel="Tadbir qo'shish"
        fields={events.fields}
        onAdd={() => events.append({ title: "", detail: "" })}
        onRemove={events.remove}
        titlePlaceholder="Tadbir nomi"
        detailPlaceholder="Sana / joy"
        registerTitle={(i) => register(`events.${i}.title` as const)}
        registerDetail={(i) => register(`events.${i}.detail` as const)}
        error={errors.events}
      />

      <DynamicListSection
        tone="bg-gradient-mint"
        title="Boshlagan loyihalaringiz"
        addLabel="Loyiha qo'shish"
        fields={projects.fields}
        onAdd={() => projects.append({ title: "", detail: "" })}
        onRemove={projects.remove}
        titlePlaceholder="Loyiha nomi"
        detailPlaceholder="Qisqacha tavsif"
        registerTitle={(i) => register(`projects.${i}.title` as const)}
        registerDetail={(i) => register(`projects.${i}.detail` as const)}
        error={errors.projects}
      />

      <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
        <span className="mb-4 inline-flex h-8 items-center rounded-full bg-gradient-peach px-3 text-xs font-bold text-white">
          Boshqa ma&apos;lumot
        </span>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Volontyorlik ishlari</label>
            <Textarea {...register("volunteering")} rows={3} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Yangi ish yoki ta&apos;lim ma&apos;lumotlari</label>
            <Textarea {...register("newRolesOrEducation")} rows={3} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Podcast yoki intervyular</label>
            <Textarea {...register("mediaAppearances")} rows={3} placeholder="Havola yoki qisqacha ma'lumot" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Liderlar Online jurnali uchun material</label>
            <Textarea {...register("journalSubmission")} rows={4} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy">Alohida sarlavha</label>
              <Input {...register("freeformTitle")} placeholder="Erkin sarlavha" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Erkin ma&apos;lumot</label>
            <Textarea {...register("freeformContent")} rows={4} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">YouTube yoki boshqa video havolalari</label>
            <div className="space-y-2">
              {videoLinks.fields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <Input {...register(`videoLinks.${i}.url` as const)} placeholder="https://youtube.com/..." />
                  <IconButton aria-label="O'chirish" variant="ghost" onClick={() => videoLinks.remove(i)}>
                    <Trash2 className="h-4 w-4 text-coral" aria-hidden />
                  </IconButton>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => videoLinks.append({ url: "" })}>
                <Plus className="h-3.5 w-3.5" aria-hidden /> Havola qo&apos;shish
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
        <span className="mb-4 inline-flex h-8 items-center rounded-full bg-gradient-blue px-3 text-xs font-bold text-white">
          Suratlar va fayllar
        </span>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-brand-soft p-8 text-center hover:border-liderlar-blue">
          <UploadCloud className="h-8 w-8 text-liderlar-blue" aria-hidden />
          <span className="text-sm font-semibold text-navy">Fayllarni tanlash uchun bosing</span>
          <span className="text-xs text-ink-soft">JPG, PNG, WEBP yoki PDF — har biri maks. 20 MB</span>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={onFilesSelected} />
        </label>
        {files.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md bg-navy/[0.03] px-3 py-2 text-sm">
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-coral"
                  aria-label="Faylni olib tashlash"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <Checkbox {...register("consentToPublish")} className="mt-0.5" />
        Yuborilgan materiallarni qayta ishlash va e&apos;lon qilishga roziman.
      </label>
      {errors.consentToPublish && <p className="text-xs text-coral">{errors.consentToPublish.message}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
      </Button>
    </form>
  );
}

function DynamicListSection({
  tone,
  title,
  addLabel,
  fields,
  onAdd,
  onRemove,
  titlePlaceholder,
  detailPlaceholder,
  registerTitle,
  registerDetail,
}: {
  tone: string;
  title: string;
  addLabel: string;
  fields: { id: string }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  titlePlaceholder: string;
  detailPlaceholder: string;
  registerTitle: (index: number) => UseFormRegisterReturn;
  registerDetail: (index: number) => UseFormRegisterReturn;
  error?: unknown;
}) {
  return (
    <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
      <span className={cn("mb-4 inline-flex h-8 items-center rounded-full px-3 text-xs font-bold text-white", tone)}>
        {title}
      </span>
      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-brand-soft/70 p-3 sm:flex-row">
            <Input {...registerTitle(i)} placeholder={titlePlaceholder} />
            <Input {...registerDetail(i)} placeholder={detailPlaceholder} />
            <IconButton aria-label="O'chirish" variant="ghost" onClick={() => onRemove(i)} className="shrink-0">
              <Trash2 className="h-4 w-4 text-coral" aria-hidden />
            </IconButton>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}
      </Button>
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { saveFields } from "@/app/kabinet/profil/actions";

export interface BasicsValues {
  fullName: string;
  shortBio: string;
  phone: string;
  email: string;
  birthDate: string;
  birthYear: string;
  birthPlace: string;
  currentLocation: string;
  activityField: string;
  educationSummary: string;
  /** Ro'yxatlar — har biri yangi qatordan. */
  descriptionItems: string;
  languages: string;
}

export interface PendingLabel {
  label: string;
  afterValue: string | null;
}

/**
 * ASOSIY MA'LUMOTLAR.
 *
 * Bu bo'limda IKKI XIL maydon bor va bu foydalanuvchiga AYTILADI:
 * ba'zilari darhol profilga joylanadi, ba'zilari tekshiruvdan o'tadi.
 * Aytmasak, odam tug'ilgan sanasini o'zgartirib, profilda eski
 * qiymatni ko'rib "saqlanmadi" deb o'ylardi.
 */
export function BasicsSection({
  initial,
  pending: pendingEdits,
}: {
  initial: BasicsValues;
  /** Tekshiruvda turgan o'zgarishlar. */
  pending: PendingLabel[];
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const [values, setValues] = useState<BasicsValues>(initial);
  const set = (key: keyof BasicsValues) => (value: string) => setValues((v) => ({ ...v, [key]: value }));
  const { shortBio, phone, email, birthDate } = values;
  const setShortBio = set("shortBio");
  const setPhone = set("phone");
  const setEmail = set("email");
  const setBirthDate = set("birthDate");

  function submit() {
    startTransition(async () => {
      setMessage(null);
      setFailed(false);

      const result = await saveFields({
        full_name: values.fullName,
        short_bio: shortBio,
        phone,
        email,
        birth_date: birthDate,
        birth_year: values.birthYear,
        birth_place: values.birthPlace,
        current_location: values.currentLocation,
        activity_field: values.activityField,
        education_summary: values.educationSummary,
        description_items: values.descriptionItems,
        languages: values.languages,
      });

      setMessage(result.message);
      setFailed(!result.ok);
      if (result.ok) setEditing(false);
    });
  }

  return (
    <section className="rounded-lg border border-brand-soft bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block font-semibold text-navy">Asosiy ma&apos;lumotlar</span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            Ism, qisqa ma&apos;lumot, soha, tillar, aloqa va tug&apos;ilgan ma&apos;lumotlar
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-brand-soft px-4 py-3">
          {pendingEdits.length > 0 && (
            /*
             * TEKSHIRUVDA TURGANLARI ENG TEPADA.
             *
             * Aks holda odam o'zgarish yuborganini bilmay, qayta-qayta
             * yuborardi va har safar "nega hali ham eski" deb
             * o'ylardi.
             */
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-semibold text-amber-900">
                Tekshiruvda turgan o&apos;zgarishlar
              </p>
              <ul className="mt-1 space-y-0.5">
                {pendingEdits.map((item) => (
                  <li key={item.label} className="text-xs text-amber-900">
                    {item.label}: {item.afterValue ?? "o'chirish"}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-[11px] text-amber-800">
                Tasdiqlangandan keyin profilingizda ko&apos;rinadi.
              </p>
            </div>
          )}

          {!editing ? (
            <>
              <Row label="To'liq ism" value={initial.fullName} />
              <Row label="Qisqa ma'lumot" value={initial.shortBio} />
              <Row label="Kim sifatida tanilgan (teglar)" value={initial.descriptionItems} />
              <Row label="Faoliyat sohasi" value={initial.activityField} />
              <Row label="Hozirgi manzil" value={initial.currentLocation} />
              <Row label="Tillar" value={initial.languages} />
              <Row label="Ta'lim (qisqacha)" value={initial.educationSummary} />
              <Row label="Tug'ilgan sana" value={initial.birthDate} />
              <Row label="Tug'ilgan yil" value={initial.birthYear} />
              <Row label="Tug'ilgan joy" value={initial.birthPlace} />
              <Row label="Telefon" value={initial.phone} />
              <Row label="Email" value={initial.email} />

              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMessage(null);
                }}
                className="mt-3 rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-liderlar-blue transition hover:bg-ice/50"
              >
                Tahrirlash
              </button>
            </>
          ) : (
            <>
              <Field label="To'liq ism" hint="Tahririyat tekshiruvidan o'tadi">
                <input
                  value={values.fullName}
                  onChange={(e) => set("fullName")(e.target.value)}
                  maxLength={200}
                  className={inputClass}
                />
              </Field>

              <Field label="Qisqa ma'lumot" hint="Darhol profilga joylanadi">
                <textarea
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  rows={4}
                  maxLength={600}
                  className={inputClass}
                  placeholder="O'zingiz haqida qisqacha"
                />
                <span className="mt-1 block text-right text-[11px] text-ink-soft">
                  {shortBio.length}/600
                </span>
              </Field>

              <Field label="Kim sifatida tanilgan" hint="Darhol · har birini yangi qatordan, ko'pi bilan 8 ta">
                <textarea
                  value={values.descriptionItems}
                  onChange={(e) => set("descriptionItems")(e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder={"Jurnalistika talabasi\nTadbirkorlik tashabbuskori"}
                />
              </Field>

              <Field label="Faoliyat sohasi" hint="Darhol profilga joylanadi">
                <input
                  value={values.activityField}
                  onChange={(e) => set("activityField")(e.target.value)}
                  maxLength={300}
                  className={inputClass}
                  placeholder="Media va raqamli kommunikatsiya"
                />
              </Field>

              <Field label="Hozirgi manzil" hint="Darhol profilga joylanadi">
                <input
                  value={values.currentLocation}
                  onChange={(e) => set("currentLocation")(e.target.value)}
                  maxLength={200}
                  className={inputClass}
                  placeholder="Toshkent shahri"
                />
              </Field>

              <Field label="Tillar" hint="Darhol · har birini yangi qatordan">
                <textarea
                  value={values.languages}
                  onChange={(e) => set("languages")(e.target.value)}
                  rows={2}
                  className={inputClass}
                  placeholder={"O'zbek\nIngliz"}
                />
              </Field>

              <Field label="Ta'lim (qisqacha)" hint="Tahririyat tekshiruvidan o'tadi">
                <textarea
                  value={values.educationSummary}
                  onChange={(e) => set("educationSummary")(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className={inputClass}
                />
              </Field>

              <Field label="Tug'ilgan yil" hint="Tahririyat tekshiruvidan o'tadi">
                <input
                  value={values.birthYear}
                  onChange={(e) => set("birthYear")(e.target.value)}
                  maxLength={20}
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="2001"
                />
              </Field>

              <Field label="Tug'ilgan joy" hint="Tahririyat tekshiruvidan o'tadi">
                <input
                  value={values.birthPlace}
                  onChange={(e) => set("birthPlace")(e.target.value)}
                  maxLength={200}
                  className={inputClass}
                  placeholder="Samarqand viloyati, Paxtachi tumani"
                />
              </Field>

              <Field label="Telefon" hint="Darhol saqlanadi">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+998 90 123 45 67"
                />
              </Field>

              <Field label="Email" hint="Darhol saqlanadi">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="siz@example.com"
                />
              </Field>

              <Field label="Tug'ilgan sana" hint="Tahririyat tekshiruvidan o'tadi">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={inputClass}
                />
              </Field>

              {message && (
                <p
                  className={`mb-2 text-xs font-semibold ${failed ? "text-rose-600" : "text-emerald-700"}`}
                >
                  {message}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={submit}
                  className="rounded-md bg-liderlar-blue px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
                >
                  {saving ? "Saqlanmoqda…" : "Saqlash"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    // Bekor qilishda kiritilganlar tashlab yuboriladi.
                    setValues(initial);
                    setEditing(false);
                    setMessage(null);
                  }}
                  className="rounded-md border border-brand-soft px-3 py-2 text-xs font-semibold text-ink-soft"
                >
                  Bekor qilish
                </button>
              </div>
            </>
          )}

          {!editing && message && (
            <p
              className={`mt-2 text-xs font-semibold ${failed ? "text-rose-600" : "text-emerald-700"}`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-brand-soft/60 py-2 last:border-0">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
        {value.trim() === "" ? (
          <span className="italic text-ink-soft">to&apos;ldirilmagan</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-brand-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold text-navy">
        {label}
        {/* Maydon qachon ko'rinishini OLDINDAN aytamiz. */}
        <span className="ml-1.5 font-normal text-ink-soft">· {hint}</span>
      </span>
      {children}
    </label>
  );
}

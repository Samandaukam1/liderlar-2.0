"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  activateWithNewAccount,
  activateWithExistingAccount,
  checkUsernameAction,
  type ActivateResult,
} from "../actions";

/**
 * Faollashtirish formasi.
 *
 * IKKI YO'L:
 *
 *   1. Hisobi YO'Q — LOGIN va parol tanlaydi, hisob ochiladi.
 *      Email so'ralmaydi: nomzodda u bo'lmasligi mumkin va uni
 *      majburlash faollashtirishni to'xtatib qo'yardi.
 *   2. Hisobi BOR — tizimga kirgan holda havolani ochadi va
 *      mavjud hisobi bog'lanadi. Ikkinchi hisob YARATILMAYDI.
 *
 * Ikkinchi yo'lda shaxs ikki tomondan tasdiqlanadi: odam
 * tizimga kirgan va havolani ushlab turibdi.
 */
export function ActivationForm({
  token,
  signedIn,
  signedInEmail,
}: {
  token: string;
  signedIn: boolean;
  signedInEmail: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  /*
   * LOGIN BO'SHLIGI — JONLI, LEKIN HAR HARFDA EMAS.
   *
   * Har bosilgan tugma uchun so'rov yuborish serverni ham
   * yuklaydi, loginlarni tergib ko'rish uchun qulay vosita ham
   * bo'lardi. Shuning uchun yozish to'xtagandan keyin tekshiriladi.
   */
  const [availability, setAvailability] = useState<
    { state: "idle" | "checking" } | { state: "free" } | { state: "taken"; error: string }
  >({ state: "idle" });
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestCheck = useRef(0);

  function onUsernameChange(value: string) {
    setUsername(value);
    setAvailability({ state: "idle" });
    if (checkTimer.current) clearTimeout(checkTimer.current);

    const trimmed = value.trim();
    if (trimmed.length < 4) return;

    checkTimer.current = setTimeout(() => {
      const ticket = ++latestCheck.current;
      setAvailability({ state: "checking" });
      void checkUsernameAction(trimmed).then((result) => {
        /*
         * Kech kelgan javob yangisini bosib ketmasin: odam
         * yozishni davom ettirgan bo'lishi mumkin.
         */
        if (ticket !== latestCheck.current) return;
        setAvailability(
          result.ok ? { state: "free" } : { state: "taken", error: result.error ?? "" },
        );
      });
    }, 450);
  }

  function finish(result: ActivateResult) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setDone(result.candidateSlug);

    /*
     * Tokenli manzil brauzer tarixidan olib tashlanadi.
     *
     * Aks holda u "orqaga" tugmasi, tarix va referrer orqali
     * qolib ketardi — holbuki u bir martalik kalit edi.
     */
    router.replace("/kabinet");
  }

  if (done !== null) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden />
        <p className="mt-2 font-semibold text-emerald-800">Akkaunt faollashtirildi</p>
        <p className="mt-1 text-sm text-emerald-700">Shaxsiy kabinetingizga yo&apos;naltirilmoqda…</p>
      </div>
    );
  }

  if (signedIn) {
    return (
      <div>
        <div className="rounded-lg border border-brand-soft bg-ice/50 p-4 text-sm">
          <p className="text-ink">
            Siz{signedInEmail ? ` ${signedInEmail}` : ""} hisobi bilan tizimdasiz.
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Shu hisob ensiklopediyadagi profilingizga bog&apos;lanadi. Yangi hisob
            yaratilmaydi.
          </p>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => finish(await activateWithExistingAccount({ token })))
          }
          className="mt-4 w-full rounded-md bg-liderlar-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-electric-blue disabled:opacity-50"
        >
          {pending ? "Bog'lanmoqda…" : "Shu hisobni profilimga bog'lash"}
        </button>
      </div>
    );
  }

  const canSubmit =
    username.trim().length >= 4 &&
    availability.state !== "taken" &&
    password.length >= 8 &&
    password === confirm &&
    !pending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        startTransition(async () =>
          finish(await activateWithNewAccount({ token, username: username.trim(), password })),
        );
      }}
    >
      <Field label="Login">
        <input
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          className={inputClass}
          placeholder="asadbekazamov"
          required
        />
      </Field>

      <p className="-mt-2 mb-3 text-xs text-ink-soft">
        Liderlar.uz tizimiga kirish uchun o&apos;zingizga maxsus login tanlang.
        {availability.state === "checking" && " Tekshirilmoqda…"}
        {availability.state === "free" && (
          <span className="font-semibold text-emerald-600"> ✓ Login bo&apos;sh</span>
        )}
        {availability.state === "taken" && (
          <span className="font-semibold text-rose-600"> ✕ {availability.error}</span>
        )}
      </p>

      <Field label="Parol">
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="Kamida 8 belgi"
          minLength={8}
          required
        />
      </Field>

      <Field label="Parolni takrorlang">
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          required
        />
      </Field>

      {confirm.length > 0 && password !== confirm && (
        <p className="mb-2 text-xs font-semibold text-rose-600">Parollar mos kelmadi.</p>
      )}

      {error && <p className="mb-2 text-sm font-semibold text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-liderlar-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-electric-blue disabled:opacity-50"
      >
        {pending ? "Faollashtirilmoqda…" : "Akkauntni faollashtirish"}
      </button>

      <p className="mt-3 text-center text-xs text-ink-soft">
        Hisobingiz allaqachon bormi?{" "}
        <a href="/kirish" className="font-semibold text-liderlar-blue">
          Avval kiring
        </a>
        , so&apos;ng bu havolani qaytadan oching.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-brand-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}

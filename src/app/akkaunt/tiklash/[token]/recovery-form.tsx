"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordWithRecovery } from "../actions";

/**
 * Yangi parol formasi.
 *
 * Parol faqat shu forma va bitta server so'rovi orasida yashaydi.
 * Muvaffaqiyatdan keyin odam KIRISH sahifasiga yuboriladi (avtomatik
 * kiritilmaydi): yangi parolni bir marta o'zi yozib kirsa, uni eslab
 * qolgani tekshiriladi va boshqa qurilmada ham shu yo'l bilan kiradi.
 */
export function RecoveryForm({ token, loginHint }: { token: string; loginHint: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !pending && password.length >= 8 && password === confirm;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await resetPasswordWithRecovery({ token, password, confirm });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          const params = new URLSearchParams({ tiklandi: "1" });
          if (result.loginHint) params.set("login", result.loginHint);
          router.replace(`/kirish?${params}`);
        });
      }}
    >
      {loginHint && (
        <p className="mb-4 rounded-md bg-liderlar-blue/5 px-3 py-2 text-sm text-ink">
          Kirish uchun loginingiz: <strong className="font-mono">{loginHint}</strong>
        </p>
      )}

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-semibold text-navy">Yangi parol</span>
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Kamida 8 belgi"
            minLength={8}
            maxLength={72}
            required
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft"
          >
            {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </label>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-semibold text-navy">Parolni takrorlang</span>
        <input
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          maxLength={72}
          required
        />
      </label>

      {confirm.length > 0 && password !== confirm && (
        <p className="mb-2 text-xs font-semibold text-rose-600">Parollar mos kelmadi.</p>
      )}
      {error && (
        <p role="alert" className="mb-2 text-sm font-semibold text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-liderlar-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-electric-blue disabled:opacity-50"
      >
        {pending ? "Saqlanmoqda…" : "Yangi parolni saqlash"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-brand-soft bg-white px-3 py-2 pr-9 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none";

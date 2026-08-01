import type { Metadata } from "next";
import { Sparkles, ShieldCheck, Radio, Trophy } from "lucide-react";
import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { getAiAssistantSettings } from "@/lib/data/ai-assistant-settings";

export const metadata: Metadata = {
  title: "Jaxongir AI",
  description:
    "Jaxongir AI — Liderlar.uz platformasining sun'iy intellekt yordamchisi. Nomzodlar, reyting, podcastlar va ariza jarayoni haqida savol bering.",
};

const CAPABILITIES = [
  { icon: Sparkles, text: "Nomzodlarni ism, hudud yoki yo'nalish bo'yicha topadi" },
  { icon: Trophy, text: "Reyting va uning hisoblanish tartibini tushuntiradi" },
  { icon: Radio, text: "Podcast va Liderlar Online jurnali haqida ma'lumot beradi" },
  { icon: ShieldCheck, text: "Faqat bazadagi tasdiqlangan ma'lumotlarga tayanadi" },
];

export default async function AIPage() {
  const settings = await getAiAssistantSettings();
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:py-12">
      <div className="space-y-6">
        <div>
          <span className="mb-3 inline-block font-display text-xs font-semibold uppercase tracking-[0.18em] text-liderlar-blue">
            Sun&apos;iy intellekt
          </span>
          <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{settings.assistantName}</h1>
          <p className="mt-3 text-ink-soft">
            Platformadagi nomzodlar, reyting va media kontenti bo&apos;yicha savollaringizga tasdiqlangan
            ma&apos;lumotlar asosida javob beruvchi yordamchi.
          </p>
        </div>
        <ul className="space-y-3">
          {CAPABILITIES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-lg border border-brand-soft bg-paper p-4 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-blue text-white">
                <Icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span className="text-sm text-ink-soft">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-[70vh] overflow-hidden rounded-xl border border-brand-soft shadow-card-hover lg:h-[75vh]">
        <AIChatPanel
          assistantName={settings.assistantName}
          greeting={settings.greeting}
          quickQuestions={settings.quickQuestions}
          voiceEnabled={settings.voiceEnabled}
          avatarKind={settings.avatarKind}
          avatarImageUrl={settings.avatarImageUrl}
          avatarVideoUrl={settings.avatarVideoUrl}
        />
      </div>
    </div>
  );
}

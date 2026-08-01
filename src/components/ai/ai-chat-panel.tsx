"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Quote, ExternalLink, Mic, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { JaxongirAiMedia } from "@/components/ai/jaxongir-ai-media";

type Source = { label: string; href: string };
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

const DEFAULT_QUESTIONS = [
  "Reyting qanday hisoblanadi?",
  "IT yo'nalishidagi liderlarni ko'rsat",
  "Ariza qanday topshiraman?",
  "Yaqin orada qanday podcastlar bor?",
  "Profilimni qanday yaxshilashim mumkin?",
];

const DEFAULT_GREETING =
  "Salom! Men Jaxongir AI — Liderlar.uz bo'yicha savollaringizga bazadagi tasdiqlangan ma'lumotlar asosida javob beraman: nomzodlar, reyting, podcastlar, jurnal va ariza jarayoni haqida so'rashingiz mumkin.";

function parseSseBuffer(buffer: string, onEvent: (event: Record<string, unknown>) => void) {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";
  for (const part of parts) {
    const line = part.trim();
    if (!line.startsWith("data:")) continue;
    try {
      onEvent(JSON.parse(line.slice(5).trim()));
    } catch {
      // ignore malformed chunk
    }
  }
  return remainder;
}

interface SpeechRecognitionResultLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onend: (() => void) | null;
}

export function AIChatPanel({
  compact = false,
  assistantName = "Jaxongir AI",
  greeting = DEFAULT_GREETING,
  quickQuestions = DEFAULT_QUESTIONS,
  voiceEnabled = false,
  avatarKind = "video",
  avatarImageUrl,
  avatarVideoUrl,
}: {
  compact?: boolean;
  assistantName?: string;
  greeting?: string;
  quickQuestions?: string[];
  voiceEnabled?: boolean;
  avatarKind?: "image" | "video";
  avatarImageUrl?: string | null;
  avatarVideoUrl?: string | null;
}) {
  const { push } = useToast();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [autoSpeak, setAutoSpeak] = React.useState(voiceEnabled);
  const [listening, setListening] = React.useState(false);
  const sessionIdRef = React.useRef<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const speechSupported =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function speak(text: string) {
    if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "uz-UZ";
    window.speechSynthesis.speak(utterance);
  }

  function toggleListening() {
    if (!speechSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = (
      window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }
    ).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "uz-UZ";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    let finalText = "";
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId: sessionIdRef.current }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Xatolik yuz berdi.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseBuffer(buffer, (event) => {
          if (event.type === "session" && typeof event.sessionId === "string") {
            sessionIdRef.current = event.sessionId;
          } else if (event.type === "sources" && Array.isArray(event.sources)) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, sources: event.sources as Source[] } : m))
            );
          } else if (event.type === "delta" && typeof event.text === "string") {
            finalText += event.text;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + event.text } : m))
            );
          } else if (event.type === "error") {
            push({ title: assistantName, description: String(event.message ?? "Xatolik"), variant: "error" });
          }
        });
      }
      if (autoSpeak) speak(finalText);
    } catch (err) {
      push({
        title: "Ulanishda xatolik",
        description: err instanceof Error ? err.message : "Qayta urinib ko'ring.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="bg-gradient-blue px-6 py-6 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/15">
            <JaxongirAiMedia
              avatarKind={avatarKind}
              avatarImageUrl={avatarImageUrl}
              avatarVideoUrl={avatarVideoUrl}
              className="rounded-full"
              iconClassName="h-5 w-5"
            />
          </span>
          <div className="flex-1">
            <p className="font-display text-lg font-bold">{assistantName}</p>
            <p className="text-xs text-white/75">Liderlar.uz rasmiy yordamchisi</p>
          </div>
          {voiceEnabled && (
            <button
              type="button"
              onClick={() => setAutoSpeak((v) => !v)}
              aria-label={autoSpeak ? "Ovozni o'chirish" : "Ovozni yoqish"}
              aria-pressed={autoSpeak}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-brand-soft bg-liderlar-blue/5 p-4">
              <Quote className="mb-2 h-6 w-6 text-liderlar-blue" aria-hidden />
              <p className="text-sm text-ink-soft">{greeting}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5",
                    ["bg-gradient-blue text-white", "bg-gradient-peach", "bg-gradient-violet", "bg-gradient-mint", "bg-gradient-coral"][
                      i % 5
                    ]
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed",
                  m.role === "user" ? "bg-gradient-blue text-white" : "border border-brand-soft bg-ice text-ink"
                )}
              >
                {m.content ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <span className="flex items-center gap-1">
                    <TypingDot delay={0} />
                    <TypingDot delay={0.15} />
                    <TypingDot delay={0.3} />
                  </span>
                )}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-brand-soft/70 pt-2.5">
                    {m.sources.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[0.7rem] font-semibold text-liderlar-blue shadow-sm hover:bg-liderlar-blue/8"
                      >
                        {s.label}
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className={cn("flex items-center gap-2 border-t border-brand-soft p-4", compact && "pb-6")}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Savolingizni yozing..."
          className="h-12 flex-1 rounded-full border border-brand-soft bg-paper px-4 text-sm focus:border-liderlar-blue focus:outline-none focus:ring-2 focus:ring-cyan/30"
        />
        {voiceEnabled && speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            aria-label={listening ? "Ovozli kiritishni to'xtatish" : "Ovozli kiritish"}
            aria-pressed={listening}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors",
              listening
                ? "border-transparent bg-coral text-white animate-pulse"
                : "border-brand-soft text-liderlar-blue hover:bg-liderlar-blue/8"
            )}
          >
            <Mic className="h-4.5 w-4.5" aria-hidden />
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Yuborish"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-blue text-white transition-transform disabled:opacity-50 active:scale-95"
        >
          <Send className="h-4.5 w-4.5" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-liderlar-blue/60"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 1, delay }}
    />
  );
}

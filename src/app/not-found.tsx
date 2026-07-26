import { SearchX } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-liderlar-blue/8 text-liderlar-blue">
        <SearchX className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold text-navy">Sahifa topilmadi</h1>
      <p className="mt-2 text-ink-soft">
        Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin.
      </p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/">Bosh sahifaga qaytish</LinkButton>
        <LinkButton href="/qidiruv" variant="secondary">
          Qidirish
        </LinkButton>
      </div>
    </div>
  );
}

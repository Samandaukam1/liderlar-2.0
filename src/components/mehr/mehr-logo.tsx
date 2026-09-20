import Image from "next/image";
import { MEHR_GRADIENT } from "@/lib/mehr/brand";

/**
 * MEHR 365+ belgisi.
 *
 * RASMIY LOGOTIP REPODA YO'Q.
 *
 * Uni chizib yoki taxminan qayta yaratib qo'yish mumkin edi,
 * lekin bu brendni buzadi: rasmiy belgining o'rnida unga
 * o'xshash, lekin boshqa narsa turgan bo'lardi va u sayt
 * bo'ylab tarqalardi.
 *
 * Shuning uchun:
 *   - logotip manzili sozlamadan (`mehr.logo_url`) olinadi;
 *   - u bo'lmasa, TIPOGRAFIK yozuv ko'rsatiladi — bu logotip
 *     emas va logotipga o'xshamaydi ham.
 *
 * Rasmiy fayl yuklangan zahoti butun sayt bo'ylab o'zi
 * almashadi.
 */
export function MehrLogo({
  logoUrl,
  size = 36,
  showWordmark = true,
}: {
  logoUrl: string | null;
  size?: number;
  showWordmark?: boolean;
}) {
  if (logoUrl) {
    return (
      <span className="inline-flex items-center gap-2.5">
        <Image
          src={logoUrl}
          alt="MEHR 365+"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
        {showWordmark && <Wordmark />}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2.5">
      {/*
        Yurak SHAKLI emas — oddiy doira ichidagi yozuv.
        Rasmiy belgiga o'xshatishga urinilmaydi.
      */}
      <span
        aria-hidden
        className="inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
        style={{ width: size, height: size, background: MEHR_GRADIENT }}
      >
        365
      </span>
      {showWordmark && <Wordmark />}
    </span>
  );
}

function Wordmark() {
  return (
    <span className="font-display text-lg font-bold tracking-tight text-[#0F2B3D]">
      MEHR <span className="font-black">365+</span>
    </span>
  );
}

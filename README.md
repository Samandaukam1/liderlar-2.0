# Liderlar.uz 2.0 — web

O'zbekistonning faol yosh liderlari uchun raqamli ensiklopediya, reyting va
media platformasining ochiq Next.js ilovasi. `liderlar-web` va
`liderlar-admin` alohida Supabase loyihalaridan foydalanadi. Web loyiha
admin ma'lumotlarini bevosita query qilmaydi; integratsion public kontent
faqat admin panelning server API'lari orqali olinadi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Production tekshiruvi:

```bash
npm run lint
npm run build
npm run start
```

## Environment

`.env.local` ichida quyidagi qiymatlar kerak:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ADMIN_URL=
LIDERLAR_ADMIN_API_BASE_URL=https://liderlar-2-0-admin.vercel.app
LIDERLAR_PUBLIC_CONTENT_API_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`,
`LIDERLAR_ADMIN_API_BASE_URL` va ixtiyoriy
`LIDERLAR_PUBLIC_CONTENT_API_KEY` faqat server kodida ishlatiladi. Ularni
public prefiksli o'zgaruvchiga yoki client component'ga joylamang.

## Supabase

User web Supabase migratsiyalari [supabase/README.md](supabase/README.md) da
hujjatlangan. Yangi web loyihasi uchun `0001` dan `0009` gacha tartib bilan,
so'ng `seed.sql` ishga tushiriladi. Admin Supabase schemаsi bu repository
migratsiyalariga kirmaydi.

Cross-project nomzod integratsiyasi uchun user va admin Supabase'dagi ayni
nomzodlarda bir xil, immutable `integration_key uuid` bo'lishi shart.
Projectlarga xos `candidates.id` qiymati integratsion API'larda ishlatilmaydi.

## Asosiy route'lar

- `/liderlar`, `/liderlar/[slug]` — katalog va profil
- `/reyting`, `/top-100` — reyting
- `/podcastlar`, `/podcastlar/taqvim` — media va taqvim
- `/jurnal`, `/maqola/[slug]` — jurnal va maqolalar
- `/ariza`, `/yangilash/[token]` — ariza va xavfsiz oylik yangilanish
- `/kabinet` — autentifikatsiyalangan foydalanuvchi kabineti
- `/ai` — Jaxongir AI

Arxitektura App Router, Server Components, Supabase SSR/RLS, Zod, React Hook
Form, Tailwind CSS va server-only OpenAI integratsiyasiga tayangan.

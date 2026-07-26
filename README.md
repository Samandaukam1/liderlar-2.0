# Liderlar.uz 2.0 — web

O'zbekistonning faol yosh liderlari uchun raqamli ensiklopediya, reyting va
media platformasining ochiq Next.js ilovasi. `liderlar-web` va
`liderlar-admin` bir xil Supabase loyihasi va canonical schema'dan
foydalanadi.

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
```

`SUPABASE_SERVICE_ROLE_KEY` va `OPENAI_API_KEY` faqat server kodida
ishlatiladi. Ularni public prefiksli o'zgaruvchiga yoki client component'ga
joylamang.

## Supabase

Canonical migratsiyalar [supabase/README.md](supabase/README.md) da
hujjatlangan. Yangi loyiha uchun `0001` dan `0009` gacha tartib bilan, so'ng
`seed.sql` ishga tushiriladi. Mavjud shared Supabase loyihasida migratsiyalar
allaqachon qo'llangan bo'lsa, ularni ko'r-ko'rona qayta yaratish shart emas.

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

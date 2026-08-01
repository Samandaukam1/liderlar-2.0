# O‘zbekiston Lider Yoshlari — Logo Assets

## Variantlar
- `logo-dark-transparent.png` — qora/to‘q fon uchun, yozuvi oq.
- `logo-light-transparent.png` — oq/och fon uchun, yozuvi qora.
- `logo-*-1920x1080.png` — 16:9 format.
- `logo-*-square-1080x1080.png` — 1:1 format.
- `favicon.ico` va PNG faviconlar — faqat Humo qushi.
- Humo qushining asl moviy rangi o‘zgartirilmagan.
- Barcha PNG fayllar shaffof fonda.

## Next.js’da avtomatik kun/tun almashishi

Fayllarni `public/assets/logo/` ichiga ko‘chiring.

```tsx
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcSet="/assets/logo/logo-dark-transparent.png"
  />
  <img
    src="/assets/logo/logo-light-transparent.png"
    alt="O‘zbekiston Lider Yoshlari Ensiklopediyasi"
  />
</picture>
```

## CSS bilan

```html
<img class="site-logo logo-light" src="/assets/logo/logo-light-transparent.png" alt="Logo">
<img class="site-logo logo-dark" src="/assets/logo/logo-dark-transparent.png" alt="Logo">
```

```css
.logo-dark { display: none; }
.logo-light { display: block; }

@media (prefers-color-scheme: dark) {
  .logo-light { display: none; }
  .logo-dark { display: block; }
}
```

## Favicon ulash

```html
<link rel="icon" href="/assets/logo/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32x32.png">
<link rel="apple-touch-icon" href="/assets/logo/apple-touch-icon.png">
<link rel="manifest" href="/assets/logo/site.webmanifest">
```

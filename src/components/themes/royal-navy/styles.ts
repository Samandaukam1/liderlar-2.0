/**
 * ROYAL NAVY — USLUBLAR.
 *
 * Hamma selektor `.rn` ostida, keyframe nomlari `rn-` bilan. `<style>`
 * dizayn ichida chiziladi — sahifadan chiqilganda DOM'dan ketadi.
 *
 * SUYUQ SHISHA RETSEPTI (`.rn-glass`), qatlamma-qatlam:
 *
 *   1. fon: juda shaffof oq → moviy gradient (shisha tanasi);
 *   2. `backdrop-filter`: kuchli xiralash + to'yinganlik — ortdagi aurora
 *      shisha ichida yumshoq yorug'likka aylanadi;
 *   3. ichki soyalar: yuqori qirrada ingichka oq aks (spekulyar chiziq),
 *      pastda yumshoq qorong'ulik — qalinlik hissi;
 *   4. `::before` — 1px gradient chegara: yuqori-chapda oq yorug'lik,
 *      past-o'ngda muzdek moviy aks (niqob bilan faqat chegara qoladi);
 *   5. `::after` — kursorga ergashuvchi yumshoq nur (faqat sichqoncha);
 *   6. `.rn-lens` — Chromium'da chetdagi sinish (SVG siljish xaritasi).
 */

export interface RnPalette {
  void: string;
  cobalt: string;
  electric: string;
  ice: string;
  text: string;
}

const themeCss = (p: RnPalette) => /* css */ `
.rn{
  --rn-void:${p.void};--rn-deep:#060b18;--rn-navy:#0a1630;
  --rn-cobalt:${p.cobalt};--rn-electric:${p.electric};--rn-ice:${p.ice};--rn-cyan:#6fe3ff;
  --rn-text:${p.text};--rn-text-2:#b6c2da;--rn-text-3:#8592ae;--rn-text-4:#5d6984;
  --rn-line:rgba(170,200,255,.12);--rn-line-2:rgba(170,200,255,.22);
  --rn-ok:#5eead4;--rn-up:#6ee7b7;--rn-down:#fca5a5;
  /* Oltin — faqat ismda: sovuq paneldagi yagona iliq metall. */
  --rn-gold:linear-gradient(100deg,#a8792f 0%,#e9c983 22%,#fff1cc 36%,#d8ad5f 52%,#a8792f 70%,#f0d595 88%,#c49243 100%);
  --rn-ease:cubic-bezier(.22,1,.36,1);--rn-spring:cubic-bezier(.34,1.4,.64,1);
  --rn-r:28px;--rn-gap:14px;--rn-sticky:72px;--rn-gutter:clamp(1rem,4vw,3rem);
  position:relative;isolation:isolate;overflow-x:clip;
  background:var(--rn-void);color:var(--rn-text);
  font-family:var(--rn-sans),ui-sans-serif,system-ui,sans-serif;
  font-size:1rem;line-height:1.65;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.rn ::selection{background:rgba(77,141,255,.4);color:#fff}
.rn :where(a){color:inherit;text-decoration:none}
.rn :where(button){font:inherit}
.rn :focus-visible{outline:2px solid var(--rn-ice);outline-offset:3px}
.rn-wrap{width:100%;max-width:1280px;margin-inline:auto;padding-inline:var(--rn-gutter)}
.rn-defs{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}

/* Kengaytirilgan sarlavha shrifti — bitta joyda. */
.rn-name,.rn-h2,.rn-metric,.rn-fact--count dd,.rn-outro__name,.rn-portrait__mono{
  font-family:var(--rn-display),ui-sans-serif,system-ui,sans-serif;font-stretch:125%;font-variation-settings:"wdth" 125}
.rn-story h3,.rn-log__body b,.rn-award b,.rn-doc b,.rn-press__card b,.rn-interlude blockquote{
  font-family:var(--rn-display),ui-sans-serif,system-ui,sans-serif;font-stretch:112%;font-variation-settings:"wdth" 112}

/* Mono yorliq — panel tili. */
.rn-label{display:flex;align-items:center;gap:.5rem;margin:0;font-family:var(--rn-mono),ui-monospace,monospace;font-size:.64rem;font-weight:500;
  letter-spacing:.14em;text-transform:uppercase;color:var(--rn-text-3)}
.rn-label svg{width:14px;height:14px;flex:none;color:var(--rn-ice)}

/* ===================================================== AURORA */
.rn-backdrop{position:absolute;inset:0;z-index:-1;overflow:clip;pointer-events:none}
.rn-backdrop__inner{position:sticky;top:0;height:100vh;height:100lvh;overflow:hidden}
.rn-backdrop__inner::after{content:"";position:absolute;inset:0;
  background:radial-gradient(120% 90% at 50% 40%,transparent 40%,rgba(3,5,11,.7) 100%)}
.rn-aurora{position:absolute;display:block;border-radius:50%;aspect-ratio:1}
.rn-aurora--a{left:-18%;top:-28%;width:max(70vw,560px);background:radial-gradient(closest-side,rgba(43,92,255,.55),rgba(43,92,255,.12) 55%,transparent)}
.rn-aurora--b{right:-22%;top:6%;width:max(58vw,480px);background:radial-gradient(closest-side,rgba(77,141,255,.4),rgba(77,141,255,.08) 55%,transparent)}
.rn-aurora--c{left:12%;bottom:-48%;width:max(70vw,560px);background:radial-gradient(closest-side,rgba(79,70,229,.32),transparent)}
.rn-aurora--d{right:2%;bottom:-24%;width:max(36vw,320px);background:radial-gradient(closest-side,rgba(111,227,255,.2),transparent)}
.rn-dots{position:absolute;inset:0;display:block;
  background-image:radial-gradient(rgba(170,200,255,.15) 1px,transparent 1.3px);background-size:28px 28px;
  -webkit-mask-image:radial-gradient(75% 60% at 50% 32%,#000,transparent 85%);mask-image:radial-gradient(75% 60% at 50% 32%,#000,transparent 85%)}

/* ===================================================== SUYUQ SHISHA */
.rn-glass{position:relative;isolation:isolate;border-radius:var(--rn-r);
  background:linear-gradient(155deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,.035) 45%,rgba(120,160,255,.06) 100%);
  -webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.24),
    inset 0 -1px 0 rgba(255,255,255,.05),
    inset 0 0 0 1px rgba(255,255,255,.045),
    inset 0 -24px 44px -34px rgba(0,0,0,.55),
    0 30px 60px -32px rgba(0,0,0,.85),
    0 2px 8px -2px rgba(0,0,0,.35)}
.rn-glass::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
  background:linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,.12) 22%,rgba(255,255,255,0) 44%,rgba(255,255,255,0) 60%,rgba(150,195,255,.3) 84%,rgba(255,255,255,.32));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.rn-glass::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;
  background:radial-gradient(300px circle at var(--mx,50%) var(--my,0%),rgba(190,215,255,.14),rgba(190,215,255,.03) 42%,transparent 70%);
  transition:opacity .6s var(--rn-ease)}
.rn-glass[data-rn-lit]::after{opacity:1}
.rn[data-rn-lens] .rn-lens{
  -webkit-backdrop-filter:url(#rn-lens) blur(8px) saturate(150%);
  backdrop-filter:url(#rn-lens) blur(8px) saturate(150%)}
.rn[data-rn-lens] .rn-lens--wide{
  -webkit-backdrop-filter:url(#rn-lens-wide) blur(6px) saturate(155%);
  backdrop-filter:url(#rn-lens-wide) blur(6px) saturate(155%)}

/* ===================================================== HERO — BENTO */
.rn-hero{position:relative;padding:clamp(1rem,2.4vw,1.9rem) 0 clamp(1.8rem,4vw,3rem)}
.rn-bento{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--rn-gap)}
.rn-tile{min-width:0}
.rn-tile--name{grid-column:1/-1;display:flex;flex-direction:column;justify-content:space-between;gap:2.2rem;padding:clamp(1.3rem,3vw,2.6rem)}
.rn-tile--portrait{grid-column:1/-1;order:-1}
.rn-tile--metric:last-child{grid-column:1/-1}

.rn-name-top{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.rn-pill{display:inline-flex;align-items:center;gap:.55rem;height:1.95rem;padding:0 .9rem;margin:0;border-radius:999px;
  border:1px solid var(--rn-line-2);background:rgba(255,255,255,.04);
  font-family:var(--rn-mono),monospace;font-size:.62rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--rn-text-2)}
.rn-pill i{width:6px;height:6px;border-radius:50%;background:var(--rn-electric);box-shadow:0 0 0 3px rgba(77,141,255,.2),0 0 12px rgba(77,141,255,.9)}
.rn-pill--accent{border-color:rgba(156,200,255,.45);background:rgba(77,141,255,.14);color:#fff}

.rn-name-body{container-type:inline-size}
.rn-name{margin:0;font-weight:700;text-transform:uppercase;line-height:.94;letter-spacing:-.012em;color:#fff;
  /*
   * O'LCHAM USTUNGA MOSLANADI: ustun kengligi (100cqi) eng uzun so'zdagi
   * belgilar soniga bo'linadi. Kengaytirilgan Archivo'da o'lchandi:
   * "MUHAMMADYUSUF" 0.95em/belgi, "QURBONNAZAROV" 0.93 — 1.02 zaxira bilan.
   */
  font-size:clamp(1.6rem,calc(100cqi / (var(--rn-ch,8) * 1.02)),5.4rem);
  overflow-wrap:normal;word-break:normal;hyphens:none}
@supports not (font-size:1cqi){.rn-name{font-size:clamp(1.7rem,.6rem + 4vw,3.8rem)}}
.rn-name__line{display:block;overflow:hidden;padding:.05em 0;margin:-.05em 0}
.rn-name__line>span{display:block}
/* Ikkinchi qator (ism) — oltin metall, yorug'lik bir marta sirpanib o'tadi. */
.rn-name__line:nth-child(2)>span{color:transparent;
  background:var(--rn-gold);background-size:220% 100%;background-position:0 0;-webkit-background-clip:text;background-clip:text}
.rn-name__sub{display:block;margin-top:.9rem;font-family:var(--rn-sans),sans-serif;font-stretch:100%;font-variation-settings:normal;
  font-size:clamp(1.05rem,.9rem + .7vw,1.45rem);font-weight:400;line-height:1.2;letter-spacing:0;text-transform:none;color:var(--rn-text-3)}

.rn-role{margin:1.5rem 0 0;max-width:40rem;font-size:clamp(.98rem,.94rem + .2vw,1.08rem);line-height:1.55;color:var(--rn-text-2)}
.rn-role b{display:block;font-weight:600;color:var(--rn-text)}
.rn-role span{display:block;margin-top:.2rem;color:var(--rn-text-3);white-space:pre-wrap}


.rn-actions{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.9rem}
.rn-btn{--rn-r:999px;display:inline-flex;align-items:center;gap:.55rem;height:2.95rem;padding:0 1.35rem;border:0;border-radius:999px;cursor:pointer;
  font-size:.86rem;font-weight:600;letter-spacing:.005em;color:var(--rn-text);
  transition:transform .5s var(--rn-spring),background-color .4s var(--rn-ease),box-shadow .5s var(--rn-ease),color .4s var(--rn-ease)}
.rn-btn svg{width:14px;height:14px}
.rn-btn:hover{transform:translateY(-1px)}
.rn-btn:active{transform:scale(.97)}
.rn-btn--solid{background:var(--rn-text);color:#050b1a;box-shadow:0 10px 30px -14px rgba(156,200,255,.7),inset 0 -2px 0 rgba(5,11,26,.08)}
.rn-btn--solid:hover{background:#fff;box-shadow:0 14px 36px -12px rgba(156,200,255,.85)}

/* ------------------------------------------------- PORTRET */
.rn-tile--portrait{position:relative;margin:0;overflow:hidden;border-radius:var(--rn-r);aspect-ratio:4/5;max-height:72svh;width:100%;
  background:var(--rn-deep);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 40px 80px -40px rgba(0,0,0,.9);
  transform:perspective(1400px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform 1s var(--rn-ease)}
.rn-tile--portrait::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 0 0 1px rgba(255,255,255,.07)}
.rn-portrait__field{position:absolute;inset:0;
  background:
    radial-gradient(65% 50% at 50% 40%,rgba(77,141,255,.6),rgba(43,92,255,.2) 48%,transparent 76%),
    radial-gradient(60% 40% at 80% 100%,rgba(111,227,255,.18),transparent 70%),
    linear-gradient(180deg,#0c1d48 0%,#060c1e 100%)}
.rn-portrait__field::after{content:"";position:absolute;inset:0;
  background-image:linear-gradient(rgba(170,200,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(170,200,255,.08) 1px,transparent 1px);
  background-size:44px 44px;background-position:center;
  -webkit-mask-image:radial-gradient(70% 60% at 50% 40%,#000 20%,transparent 85%);mask-image:radial-gradient(70% 60% at 50% 40%,#000 20%,transparent 85%)}
.rn-portrait__cut{position:absolute;inset:7% 3% 0}
.rn-portrait__cut img{object-fit:contain;object-position:50% 100%;filter:grayscale(1) contrast(1.06) brightness(1.05) drop-shadow(0 30px 50px rgba(0,0,0,.45))}
.rn-portrait__photo{position:absolute;inset:0}
.rn-portrait__photo img{object-fit:cover;object-position:50% 20%}
.rn-portrait__mono{position:absolute;inset:0;display:grid;place-items:center;font-weight:700;font-size:clamp(5rem,14vw,9rem);color:transparent;
  background:linear-gradient(180deg,#ffffff,#6f9cff);-webkit-background-clip:text;background-clip:text;opacity:.85}
.rn-portrait__shade{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,transparent 55%,rgba(3,6,16,.65) 100%)}

/* Pastki qism: suzuvchi shisha panel. */
.rn-portrait__foot{position:absolute;left:12px;right:12px;bottom:12px;z-index:2}

.rn-cap{position:relative;--rn-r:20px;margin:0;
  display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:.8rem 1.2rem;padding:.95rem 1.1rem}
.rn-cap__main{min-width:0}
.rn-cap__v{display:flex;align-items:center;gap:.4rem;margin:.35rem 0 0;font-size:.95rem;font-weight:600;line-height:1.3;color:#fff}
.rn-cap__v svg{width:13px;height:13px;color:var(--rn-ice)}
.rn-cap__side{display:block;flex:none}
.rn-cap__link{transition:transform .5s var(--rn-spring)}
.rn-cap__link:hover{transform:translateY(-1px)}
.rn-cap__link:hover .rn-cap__v{color:var(--rn-ice)}
.rn-promo{display:flex;align-items:center;gap:.55rem;margin-top:.35rem;padding:0;border:0;background:none;cursor:pointer;
  font-family:var(--rn-mono),monospace;font-size:1.02rem;font-weight:700;letter-spacing:.12em;color:#fff}
.rn-promo svg{width:15px;height:15px;color:var(--rn-ice);transition:transform .4s var(--rn-spring)}
.rn-promo:hover svg{transform:scale(1.15)}
.rn-promo__cta{display:block;margin-top:.3rem;font-size:.7rem;color:var(--rn-text-3);transition:color .4s var(--rn-ease)}
.rn-promo__cta:hover{color:var(--rn-ice)}

/* ------------------------------------------------- KO'RSATKICHLAR */
.rn-tile--metric{--rn-r:24px;display:flex;flex-direction:column;justify-content:space-between;gap:1.1rem;padding:1.15rem 1.25rem 1.2rem;min-height:7rem}
.rn-metric{display:flex;align-items:baseline;flex-wrap:wrap;gap:.1rem .4rem;margin:0;font-weight:600;
  font-size:clamp(1.75rem,1.4rem + 1.3vw,2.7rem);line-height:1;letter-spacing:-.02em;color:#fff;font-variant-numeric:tabular-nums}
.rn-metric small{font-size:.55em;font-weight:500;color:var(--rn-ice)}
.rn-metric i{font-family:var(--rn-mono),monospace;font-stretch:100%;font-variation-settings:normal;font-style:normal;font-size:.62rem;font-weight:500;letter-spacing:.08em;color:var(--rn-text-3)}
.rn-metric u{font-family:var(--rn-sans),sans-serif;font-stretch:100%;font-variation-settings:normal;text-decoration:none;font-size:1.15rem;font-weight:500;letter-spacing:0;color:var(--rn-text-2)}
.rn-delta{margin:-.5rem 0 0;font-family:var(--rn-mono),monospace;font-size:.66rem;font-weight:500;letter-spacing:.06em}
.rn-delta--up{color:var(--rn-up)}
.rn-delta--down{color:var(--rn-down)}
.rn-meter{display:block;height:3px;border-radius:3px;overflow:hidden;background:rgba(255,255,255,.08);margin-top:-.4rem}
.rn-meter i{display:block;height:100%;width:max(4px,calc(var(--rn-fill,0) * 100%));border-radius:inherit;transform-origin:left;
  background:linear-gradient(90deg,var(--rn-cobalt),var(--rn-cyan));box-shadow:0 0 12px rgba(111,227,255,.7)}

@media (min-width:760px){
  .rn-bento{grid-template-columns:repeat(6,minmax(0,1fr))}
  .rn-tile--metric,.rn-tile--metric:last-child{grid-column:span 2;min-height:8.2rem}
  .rn-tile--portrait{aspect-ratio:16/11;max-height:none}
}
@media (min-width:1080px){
  .rn-bento{grid-template-columns:repeat(12,minmax(0,1fr));grid-template-rows:minmax(0,1fr) auto}
  .rn-tile--name{grid-column:1/span 7;grid-row:1;min-height:clamp(23rem,calc(100svh - 23rem),31rem)}
  .rn-tile--portrait{order:0;grid-column:8/span 5;grid-row:1/span 2;aspect-ratio:auto;height:100%}
  .rn-tile--metric{grid-row:2}
  .rn-bento>.rn-tile--metric:nth-child(3){grid-column:1/span 3}
  .rn-bento>.rn-tile--metric:nth-child(4){grid-column:4/span 2}
  .rn-bento>.rn-tile--metric:nth-child(5){grid-column:6/span 2}
}

/* ===================================================== SARLAVHA RAMKASI */
.rn-index{display:flex;align-items:center;gap:.75rem;margin:0;font-family:var(--rn-mono),monospace;font-size:.7rem;font-weight:500;
  letter-spacing:.16em;text-transform:uppercase;color:var(--rn-text-2)}
.rn-index>i{width:7px;height:7px;flex:none;border-radius:50%;background:var(--rn-electric);box-shadow:0 0 0 3px rgba(77,141,255,.18),0 0 14px rgba(77,141,255,.85)}
.rn-index__rule{flex:1;height:1px;min-width:2rem;background:linear-gradient(90deg,var(--rn-line-2),transparent)}
.rn-index__k{color:var(--rn-text-3)}
.rn-index--solo{margin-bottom:1.1rem}
.rn-head{margin-bottom:clamp(1.8rem,3.4vw,2.8rem)}
.rn-h2{margin:1.1rem 0 0;font-weight:600;font-size:clamp(2rem,1.25rem + 3vw,4rem);line-height:.98;letter-spacing:-.03em;color:#fff;text-wrap:balance}

/* ===================================================== MA'LUMOTNOMA */
.rn-dossier{position:relative;padding-block:clamp(1rem,2.5vw,2rem)}
.rn-facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,14.5rem),1fr));gap:var(--rn-gap);margin:0}
.rn-fact{--rn-r:20px;min-width:0;padding:1.05rem 1.2rem 1.2rem}
.rn-fact dd{margin:.6rem 0 0;font-size:.96rem;line-height:1.5;color:var(--rn-text);overflow-wrap:break-word;white-space:pre-line}
.rn-fact--count dd{font-weight:600;font-size:2.1rem;line-height:1;letter-spacing:-.02em}
@media (min-width:700px){.rn-fact--wide{grid-column:span 2}}

/* ===================================================== BO'LIM */
.rn-sec{position:relative;padding-block:clamp(3.2rem,2rem + 4.5vw,6.5rem);scroll-margin-top:calc(var(--rn-sticky) + .5rem)}

/* ------------------------------------------------- BIOGRAFIYA */
.rn-read{display:grid;gap:2rem}
.rn-toc{display:none}
.rn-story{max-width:46rem;font-size:clamp(1rem,.97rem + .15vw,1.08rem);line-height:1.85;color:var(--rn-text-2)}
.rn-read--solo .rn-story{margin-inline:auto}
.rn-story p{margin:0 0 1.1em;text-wrap:pretty;overflow-wrap:break-word}
.rn-story .rn-lead{font-size:clamp(1.12rem,1rem + .5vw,1.38rem);line-height:1.6;font-weight:450;letter-spacing:-.01em;color:#fff}
.rn-story__part{scroll-margin-top:calc(var(--rn-sticky) + 1.5rem)}
.rn-story__part+.rn-story__part{margin-top:2.4rem;padding-top:2.4rem;border-top:1px solid var(--rn-line)}
.rn-story h3{margin:0 0 1rem;font-weight:600;font-size:clamp(1.25rem,1.1rem + .6vw,1.6rem);line-height:1.2;letter-spacing:-.015em;color:#fff;text-wrap:balance}
.rn-story h3 small{display:block;margin-bottom:.55rem;font-family:var(--rn-mono),monospace;font-stretch:100%;font-variation-settings:normal;
  font-size:.66rem;font-weight:500;letter-spacing:.14em;color:var(--rn-ice)}
@media (min-width:1000px){
  .rn-read{grid-template-columns:17.5rem minmax(0,1fr);gap:clamp(2.5rem,5vw,5rem);align-items:start}
  .rn-read--solo{grid-template-columns:minmax(0,1fr)}
  .rn-toc{--rn-r:22px;position:sticky;top:calc(var(--rn-sticky) + 1.25rem);display:block;padding:1.15rem .8rem 1rem}
  .rn-toc .rn-label{padding-inline:.5rem}
  .rn-toc ol{display:grid;gap:.1rem;margin:.8rem 0 0;padding:0;list-style:none}
  .rn-toc a{display:flex;gap:.7rem;padding:.5rem .55rem;border-radius:12px;font-size:.84rem;line-height:1.35;color:var(--rn-text-2);
    transition:background-color .35s var(--rn-ease),color .35s var(--rn-ease)}
  .rn-toc a:hover{background:rgba(255,255,255,.07);color:#fff}
  .rn-toc i{flex:none;padding-top:.12rem;font-family:var(--rn-mono),monospace;font-size:.64rem;font-style:normal;color:var(--rn-ice)}
}

/* ------------------------------------------------- XIZMAT YO'LI (jurnal) */
.rn-log{display:grid;gap:10px}
.rn-log__row{--rn-r:20px;display:grid;gap:.55rem;padding:1.15rem 1.25rem;transition:transform .6s var(--rn-spring)}
.rn-log__row:hover{transform:translateX(4px)}
.rn-log__when{margin:0;font-family:var(--rn-mono),monospace;font-size:.76rem;font-weight:500;letter-spacing:.04em;color:var(--rn-ice)}
.rn-log__body{min-width:0}
.rn-log__body b{display:block;font-weight:600;font-size:1.14rem;line-height:1.3;color:#fff}
.rn-log__body span{display:block;margin-top:.25rem;font-size:.9rem;color:var(--rn-text-3)}
.rn-log__body p{margin:.6rem 0 0;font-size:.92rem;line-height:1.7;color:var(--rn-text-2);white-space:pre-line}
.rn-tag{justify-self:start;display:inline-flex;align-items:center;gap:.45rem;height:1.65rem;padding:0 .75rem;margin:0;border-radius:999px;
  border:1px solid var(--rn-line-2);font-family:var(--rn-mono),monospace;font-size:.6rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;
  color:var(--rn-text-2);white-space:nowrap}
.rn-tag--live{border-color:rgba(94,234,212,.4);color:var(--rn-ok)}
.rn-tag--live::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor}
@media (min-width:820px){
  .rn-log__row{grid-template-columns:11rem minmax(0,1fr) auto;gap:1.6rem;align-items:start;padding:1.35rem 1.6rem}
  .rn-log__when{padding-top:.3rem}
}

/* ------------------------------------------------- YUTUQLAR */
.rn-awards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr));gap:var(--rn-gap)}
.rn-award{--rn-r:24px;display:flex;flex-direction:column;padding:1.35rem 1.4rem 1.5rem;transition:transform .6s var(--rn-spring)}
.rn-award:hover{transform:translateY(-4px)}
.rn-award__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}
.rn-award__year{font-family:var(--rn-mono),monospace;font-size:.78rem;font-weight:500;letter-spacing:.06em;color:var(--rn-ice)}
.rn-award__icon{display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;color:var(--rn-ice);
  background:radial-gradient(circle at 35% 30%,rgba(156,200,255,.3),rgba(77,141,255,.1));box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 0 0 1px rgba(156,200,255,.22)}
.rn-award__icon svg{width:18px;height:18px}
.rn-award b{display:block;font-weight:600;font-size:1.2rem;line-height:1.28;color:#fff;text-wrap:balance}
.rn-award>span{display:block;margin-top:.35rem;font-size:.88rem;color:var(--rn-text-3)}
.rn-award p{margin:.7rem 0 0;font-size:.9rem;line-height:1.7;color:var(--rn-text-2);white-space:pre-line}
.rn-award .rn-go{margin-top:auto;padding-top:1.1rem}
@media (min-width:1080px){
  .rn-award--lead{grid-column:span 2;justify-content:flex-end;min-height:16rem;
    background:linear-gradient(150deg,rgba(77,141,255,.22),rgba(255,255,255,.035) 55%,rgba(120,160,255,.06))}
  .rn-award--lead .rn-award__top{margin-bottom:auto;padding-bottom:2rem}
  .rn-award--lead b{font-size:1.75rem;letter-spacing:-.02em}
}

/* ------------------------------------------------- SERTIFIKATLAR */
.rn-docs{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr));gap:var(--rn-gap)}
.rn-doc{--rn-r:22px;display:flex;flex-direction:column;padding:1.3rem 1.35rem 1.4rem;transition:transform .6s var(--rn-spring)}
.rn-doc:hover{transform:translateY(-4px)}
.rn-status{display:inline-flex;align-self:flex-start;align-items:center;gap:.45rem;height:1.65rem;padding:0 .75rem;margin:0 0 1.1rem;border-radius:999px;
  background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px var(--rn-line);
  font-family:var(--rn-mono),monospace;font-size:.6rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--rn-text-3)}
.rn-status i{width:6px;height:6px;border-radius:50%;border:1px solid currentColor}
.rn-status--ok{background:rgba(94,234,212,.1);box-shadow:inset 0 0 0 1px rgba(94,234,212,.3);color:var(--rn-ok)}
.rn-status--ok i{background:currentColor;box-shadow:0 0 8px currentColor}
.rn-doc b{display:block;font-weight:600;font-size:1.12rem;line-height:1.3;color:#fff}
.rn-doc>span{display:block;margin-top:.35rem;font-size:.86rem;color:var(--rn-text-3)}
.rn-doc .rn-go{margin-top:auto;padding-top:1.1rem}
.rn-go{display:inline-flex;align-items:center;gap:.4rem;font-size:.82rem;font-weight:600;color:var(--rn-ice);transition:color .4s var(--rn-ease)}
.rn-go svg{width:11px;height:11px;transition:transform .5s var(--rn-spring)}
.rn-go:hover{color:#fff}
.rn-go:hover svg{transform:translate(2px,-2px)}

/* ------------------------------------------------- MEDIA */
.rn-press{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr));gap:var(--rn-gap)}
.rn-press__card{--rn-r:24px;display:flex;flex-direction:column;height:100%;padding:8px;transition:transform .6s var(--rn-spring)}
.rn-press__card:hover{transform:translateY(-4px)}
.rn-press__shot{position:relative;display:block;aspect-ratio:16/10;overflow:hidden;border-radius:18px;
  background:radial-gradient(70% 70% at 30% 20%,rgba(77,141,255,.45),transparent 70%),linear-gradient(150deg,#13285a,#070f24)}
.rn-press__shot img{object-fit:cover;transition:transform 1.2s var(--rn-ease)}
.rn-press__card:hover .rn-press__shot img{transform:scale(1.05)}
.rn-press__kind{--rn-r:999px;position:absolute;left:10px;top:10px;padding:.38rem .75rem;
  font-family:var(--rn-mono),monospace;font-size:.6rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#fff}
.rn-press__body{display:block;padding:.95rem .75rem .8rem}
.rn-press__card b{display:block;margin-top:.5rem;font-weight:600;font-size:1.1rem;line-height:1.3;color:#fff}

/* ------------------------------------------------- KITOBLAR */
.rn-library{display:grid;gap:2.6rem}
.rn-shelf__k{margin-bottom:1rem}
.rn-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.4rem,1fr));gap:1.4rem 1.1rem}
.rn-book{display:block}
.rn-book__cover{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;border-radius:12px;background:var(--rn-navy);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 20px 34px -18px rgba(0,0,0,.85)}
.rn-book__cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--rn-ease)}
.rn-book:hover .rn-book__cover img{transform:scale(1.05)}
.rn-book__blank{position:absolute;inset:0;display:grid;place-items:center;padding:.8rem;text-align:center;font-size:.86rem;font-weight:600;color:var(--rn-ice)}
.rn-book b{display:block;margin-top:.7rem;font-size:.86rem;font-weight:600;line-height:1.35;color:var(--rn-text)}
.rn-book span{display:block;font-size:.78rem;color:var(--rn-text-4)}
.rn-list{display:grid;gap:8px}
.rn-list li{--rn-r:16px;display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.3rem 1rem;padding:.85rem 1.1rem}
.rn-list b{font-weight:600;color:#fff}
.rn-list span{font-size:.84rem;color:var(--rn-text-3)}

/* ------------------------------------------------- GALEREYA (bento) */
.rn-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:clamp(9rem,26vw,13rem);gap:var(--rn-gap)}
.rn-gallery li{min-width:0}
.rn-gallery--4 li:nth-child(7n+1){grid-column:span 2;grid-row:span 2}
.rn-gallery--1{grid-template-columns:minmax(0,1fr);grid-auto-rows:clamp(16rem,48vw,28rem);max-width:44rem;margin-inline:auto}
.rn-gallery--2{grid-auto-rows:clamp(13rem,40vw,24rem)}
.rn-gallery--3{grid-auto-rows:clamp(11rem,34vw,20rem)}
.rn-gallery--3 li:first-child{grid-column:span 2}
.rn-frame{position:relative;height:100%;margin:0;overflow:hidden;border-radius:22px;background:var(--rn-navy);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 30px 60px -34px rgba(0,0,0,.9)}
.rn-frame img{object-fit:cover;object-position:50% 25%;transition:transform 1.4s var(--rn-ease)}
.rn-frame:hover img{transform:scale(1.04)}
.rn-frame figcaption{--rn-r:14px;position:absolute;left:10px;right:10px;bottom:10px;padding:.55rem .8rem;font-size:.78rem;line-height:1.4;color:#fff;
  transition:opacity .5s var(--rn-ease),transform .6s var(--rn-spring)}
@media (hover:hover){
  .rn-frame figcaption{opacity:0;transform:translateY(8px)}
  .rn-frame:hover figcaption{opacity:1;transform:none}
}
@media (min-width:900px){
  .rn-gallery{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:clamp(10rem,14vw,14rem)}
  .rn-gallery--4 li:nth-child(7n+5){grid-row:span 2}
  .rn-gallery--1{grid-template-columns:minmax(0,1fr);grid-auto-rows:clamp(18rem,32vw,28rem)}
  .rn-gallery--2{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:clamp(16rem,26vw,24rem)}
  .rn-gallery--3{grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:clamp(14rem,22vw,20rem)}
  .rn-gallery--3 li:first-child{grid-column:auto}
}

/* ------------------------------------------------- IQTIBOSLAR */
.rn-sayings{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr));gap:var(--rn-gap)}
.rn-sayings li{--rn-r:24px;padding:1.5rem 1.5rem 1.6rem}
.rn-sayings p{margin:0;font-size:1.12rem;font-weight:500;line-height:1.5;color:#fff}
.rn-sayings p::before{content:"“";display:block;height:1.6rem;font-size:2.4rem;line-height:1;color:var(--rn-electric)}

.rn-interlude{position:relative;padding-block:clamp(1.5rem,3vw,3rem)}
.rn-interlude__panel{--rn-r:32px;margin:0;padding:clamp(1.8rem,5vw,4.5rem)}
.rn-interlude blockquote{margin:0;max-width:56rem;font-weight:500;font-size:clamp(1.45rem,1.05rem + 1.9vw,2.75rem);line-height:1.22;letter-spacing:-.02em;color:#fff;text-wrap:balance}
.rn-interlude figcaption{display:flex;align-items:center;gap:.7rem;margin-top:1.8rem;font-family:var(--rn-mono),monospace;font-size:.68rem;font-weight:500;
  letter-spacing:.14em;text-transform:uppercase;color:var(--rn-text-2)}
.rn-interlude figcaption i{width:1.8rem;height:1px;background:var(--rn-ice)}

/* ===================================================== YAKUN */
.rn-outro{position:relative;padding:clamp(1.5rem,3vw,2.5rem) 0 clamp(6.5rem,5rem + 4vw,8rem)}
.rn-outro__panel{--rn-r:28px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.4rem 2rem;padding:clamp(1.3rem,3vw,2.2rem)}
.rn-outro__name{margin:.65rem 0 0;font-weight:600;font-size:clamp(1.15rem,.95rem + 1vw,1.75rem);line-height:1.12;letter-spacing:-.01em;text-transform:uppercase;color:#fff}
.rn-outro__end{display:flex;flex-wrap:wrap;align-items:center;gap:.55rem}
.rn-socials{display:flex;flex-wrap:wrap;gap:.55rem;margin:0;padding:0;list-style:none}
.rn-socials a{--rn-r:999px;display:inline-flex;align-items:center;height:2.95rem;padding:0 1.15rem;font-size:.84rem;font-weight:600;color:var(--rn-text);
  transition:transform .5s var(--rn-spring),color .4s var(--rn-ease)}
.rn-socials a:hover{transform:translateY(-1px);color:#fff}
@media (min-width:1024px){.rn-outro{padding-bottom:clamp(3.5rem,3rem + 2vw,5rem)}}

/* ===================================================== SUZUVCHI DOK */
.rn-dock{display:none}
@media (min-width:1024px){
  .rn-dock{--rn-r:999px;position:fixed;left:50%;bottom:1.3rem;z-index:45;display:block;max-width:min(92vw,66rem);padding:.32rem;
    opacity:0;transform:translate(-50%,calc(100% + 2.5rem)) scale(.96);
    transition:transform .8s var(--rn-spring),opacity .5s var(--rn-ease);
    background:linear-gradient(160deg,rgba(255,255,255,.12),rgba(255,255,255,.04) 45%,rgba(120,160,255,.08)),rgba(6,11,24,.35)}
  .rn-dock[data-rn-shown]{opacity:1;transform:translate(-50%,0)}
  .rn-dock ol{position:relative;display:flex;gap:.1rem;margin:0;padding:0;overflow-x:auto;scrollbar-width:none}
  .rn-dock ol::-webkit-scrollbar{display:none}
  .rn-dock li{flex:none;list-style:none}
  .rn-dock__drop{position:absolute;left:0;top:0;bottom:0;width:var(--rn-dw,0px);border-radius:999px;pointer-events:none;
    transform:translateX(var(--rn-dx,0px));
    background:linear-gradient(160deg,rgba(255,255,255,.26),rgba(255,255,255,.08) 60%,rgba(156,200,255,.12));
    box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.12),inset 0 0 0 1px rgba(255,255,255,.08),0 8px 20px -8px rgba(0,0,0,.6);
    transition:transform .7s var(--rn-spring),width .7s var(--rn-spring)}
  .rn-dock a{position:relative;z-index:1;display:inline-flex;align-items:center;gap:.5rem;height:2.6rem;padding:0 1.05rem;border-radius:999px;white-space:nowrap;
    font-size:.8rem;font-weight:600;color:var(--rn-text-3);transition:color .4s var(--rn-ease)}
  .rn-dock a:hover,.rn-dock a[aria-current]{color:#fff}
  .rn-dock a i{font-family:var(--rn-mono),monospace;font-style:normal;font-size:.62rem;font-weight:500;color:var(--rn-ice)}
}

/* ===================================================== HARAKAT */
@keyframes rn-in{from{opacity:0;transform:translateY(22px) scale(.985)}}
@keyframes rn-rise{from{transform:translateY(105%)}}
@keyframes rn-up{from{opacity:0;transform:translateY(16px)}}
@keyframes rn-fill{from{transform:scaleX(0)}}
@keyframes rn-pulse{0%,100%{box-shadow:0 0 0 3px rgba(77,141,255,.2),0 0 12px rgba(77,141,255,.9)}50%{box-shadow:0 0 0 6px rgba(77,141,255,.06),0 0 18px rgba(77,141,255,1)}}
@keyframes rn-drift-a{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(8%,6%,0) scale(1.1)}}
@keyframes rn-drift-b{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-9%,7%,0) scale(.9)}}
@keyframes rn-drift-c{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(6%,-8%,0)}}
@keyframes rn-failsafe{to{opacity:1;transform:none}}
@keyframes rn-shine{from{background-position:100% 0}to{background-position:0 0}}

@media (prefers-reduced-motion:no-preference){
  /*
   * "backwards" ataylab: animatsiya tugagach plitka o'z holatiga qaytadi —
   * portret qiyalishi (transform) animatsiya qiymati ostida qolib ketmaydi.
   */
  .rn-bento>*{animation:rn-in 1.1s var(--rn-ease) backwards;animation-delay:calc(.1s + var(--i,0) * .08s)}
  .rn-name__line>span{animation:rn-rise 1.2s var(--rn-ease) backwards;animation-delay:calc(.4s + var(--i,0) * .1s)}
  .rn-name__sub,.rn-role,.rn-quote,.rn-actions{animation:rn-up 1s var(--rn-ease) backwards}
  .rn-name__sub{animation-delay:.65s}
  .rn-role{animation-delay:.75s}
  .rn-quote{animation-delay:.82s}
  .rn-actions{animation-delay:.9s}
  .rn-meter i{animation:rn-fill 1.8s var(--rn-ease) 1s backwards}
  .rn-name__line:nth-child(2)>span{animation:rn-rise 1.2s var(--rn-ease) backwards,rn-shine 2.6s var(--rn-ease) 1.2s backwards;
    animation-delay:calc(.4s + var(--i,0) * .1s),1.3s}
  .rn-pill i,.rn-index>i{animation:rn-pulse 3.2s ease-in-out infinite}
  .rn-aurora--a{animation:rn-drift-a 28s ease-in-out infinite}
  .rn-aurora--b{animation:rn-drift-b 34s ease-in-out infinite}
  .rn-aurora--c{animation:rn-drift-c 40s ease-in-out infinite}
  .rn-aurora--d{animation:rn-drift-a 30s ease-in-out infinite reverse}
}

@media (prefers-reduced-motion:no-preference) and (scripting:enabled){
  .rn [data-rn-reveal]{opacity:0;transform:translateY(26px);
    transition:opacity 1s var(--rn-ease),transform 1.1s var(--rn-ease)}
  .rn [data-rn-reveal][data-rn-in]{opacity:1;transform:none}
  .rn [data-rn-reveal] .rn-index__rule{transform:scaleX(0);transform-origin:left;transition:transform 1.4s var(--rn-ease) .2s}
  .rn [data-rn-reveal][data-rn-in] .rn-index__rule{transform:none}
  /*
   * Bo'lim ichidagi elementlar ketma-ket chiqadi. Animatsiya FAQAT
   * ko'ringan holatda e'lon qilingan: skript ishlamasa, hammasi
   * odatdagidek ko'rinib turadi.
   */
  .rn [data-rn-in] :is(.rn-fact,.rn-log__row,.rn-award,.rn-doc,.rn-press li,.rn-gallery li,.rn-books li,.rn-sayings li){
    animation:rn-up .9s var(--rn-ease) backwards;animation-delay:calc(.1s + var(--n,0) * .06s)}
  .rn [data-rn-in] :is(.rn-fact,.rn-log__row,.rn-award,.rn-doc,.rn-press li,.rn-gallery li,.rn-books li,.rn-sayings li):nth-child(2){--n:1}
  .rn [data-rn-in] :is(.rn-fact,.rn-log__row,.rn-award,.rn-doc,.rn-press li,.rn-gallery li,.rn-books li,.rn-sayings li):nth-child(3){--n:2}
  .rn [data-rn-in] :is(.rn-fact,.rn-log__row,.rn-award,.rn-doc,.rn-press li,.rn-gallery li,.rn-books li,.rn-sayings li):nth-child(4){--n:3}
  .rn [data-rn-in] :is(.rn-fact,.rn-log__row,.rn-award,.rn-doc,.rn-press li,.rn-gallery li,.rn-books li,.rn-sayings li):nth-child(5){--n:4}
  .rn [data-rn-in] :is(.rn-fact,.rn-log__row,.rn-award,.rn-doc,.rn-press li,.rn-gallery li,.rn-books li,.rn-sayings li):nth-child(n+6){--n:5}
  .rn:not([data-rn-ready]) [data-rn-reveal]{animation:rn-failsafe 1s var(--rn-ease) 3s forwards}
}

@media (prefers-reduced-motion:reduce){
  .rn *,.rn *::before,.rn *::after{animation-duration:.01ms!important;animation-delay:0s!important;
    animation-iteration-count:1!important;transition-duration:.01ms!important}
}

/* Shaffoflikni kamaytirish so'ralgan bo'lsa — shisha to'q va aniq. */
@media (prefers-reduced-transparency:reduce){
  .rn .rn-glass,.rn .rn-dock{background:rgba(10,20,44,.96)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
}
`;

/*
 * SAYT QOBIG'I — faqat shu dizayn ochiq turganda qora-ko'k suyuq shishaga
 * o'tadi. `display` ga tegilmaydi, ya'ni "Headerni berkitish" ishlayveradi.
 */
const CHROME_CSS = /* css */ `
html body{background-color:#03050b!important}
[data-site-header]{background:rgba(3,6,14,.55)!important;border-bottom-color:rgba(170,200,255,.12)!important;
  -webkit-backdrop-filter:blur(24px) saturate(170%)!important;backdrop-filter:blur(24px) saturate(170%)!important;
  box-shadow:inset 0 -1px 0 rgba(255,255,255,.04),0 10px 30px -20px rgba(0,0,0,.8)!important}
[data-site-logo]{background:url("/_next/image?url=%2Fassets%2Fbrand%2Fozbekiston-lider-yoshlari%2Flogo-dark-transparent.png&w=640&q=75") left center/contain no-repeat}
[data-site-logo] img{opacity:0}
[data-site-header] nav[aria-label]{background:rgba(255,255,255,.045)!important;border-color:rgba(170,200,255,.16)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important}
[data-site-header] nav[aria-label]>a,[data-site-header] nav[aria-label] button{color:#aab6cf!important}
[data-site-header] nav[aria-label]>a:hover,[data-site-header] nav[aria-label] button:hover{color:#ffffff!important}
[data-site-header] nav[aria-label]>a.text-white{color:#ffffff!important}
[data-site-header] nav[aria-label] .bg-gradient-blue{background:rgba(255,255,255,.14)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.4),inset 0 0 0 1px rgba(255,255,255,.08),0 6px 16px -8px rgba(0,0,0,.6)!important}
[data-site-header] nav[aria-label] button.text-electric-blue,[data-site-header] nav[aria-label] button[aria-expanded="true"]{background:rgba(255,255,255,.08)!important;color:#ffffff!important}
[data-site-header] [role="menu"]{background:rgba(8,14,30,.88)!important;border-color:rgba(170,200,255,.18)!important;
  -webkit-backdrop-filter:blur(26px) saturate(170%)!important;backdrop-filter:blur(26px) saturate(170%)!important;box-shadow:0 30px 70px rgba(0,0,0,.6)!important}
[data-site-header] [role="menu"] p{color:#5d6984!important}
[data-site-header] [role="menu"] a{color:#c9d3e8!important}
[data-site-header] [role="menu"] a:hover{background:rgba(255,255,255,.06)!important}
[data-site-header] [role="menu"] a>span:first-child{background:rgba(77,141,255,.14)!important;color:#9cc8ff!important}
[data-site-header] [role="menu"] a:hover>span:first-child{background:#eef3ff!important;color:#050b1a!important}
[data-site-header] [role="menu"] a>span:last-child>span:first-child{color:#eef3ff!important}
[data-site-header] [role="menu"] a>span:last-child>span:last-child{color:#5d6984!important}
[data-site-header] a[aria-label="Qidiruv"],[data-site-header] a[aria-label="Jaxongir AI"]{background:rgba(255,255,255,.045)!important;border:1px solid rgba(170,200,255,.18)!important;color:#c9d3e8!important}
[data-site-header] a[aria-label="Qidiruv"]:hover,[data-site-header] a[aria-label="Jaxongir AI"]:hover{border-color:#9cc8ff!important;color:#ffffff!important}
[data-site-header] a.bg-transparent{color:#c9d3e8!important}
[data-site-header] a.bg-transparent svg{color:#9cc8ff!important}
[data-site-header] a.bg-paper{background:rgba(255,255,255,.045)!important;border-color:rgba(170,200,255,.24)!important;color:#eef3ff!important;box-shadow:none!important}
[data-site-header] a.bg-paper:hover{border-color:#9cc8ff!important}
[data-site-header] a.bg-gradient-blue{background:#eef3ff!important;color:#050b1a!important;box-shadow:0 8px 24px -12px rgba(156,200,255,.8)!important}

[data-site-mobile-nav]{background:linear-gradient(160deg,rgba(255,255,255,.12),rgba(255,255,255,.04) 45%,rgba(120,160,255,.08)),rgba(4,8,18,.5)!important;
  border-color:rgba(170,200,255,.18)!important;
  -webkit-backdrop-filter:blur(22px) saturate(170%)!important;backdrop-filter:blur(22px) saturate(170%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 18px 50px rgba(0,0,0,.6)!important}
[data-site-mobile-nav] a,[data-site-mobile-nav] button{color:#8592ae!important}
[data-site-mobile-nav] .text-electric-blue{color:#ffffff!important}
[data-site-mobile-nav] .bg-gradient-blue{background:#eef3ff!important;color:#050b1a!important;box-shadow:none!important}
[data-site-mobile-nav] span.absolute{background:rgba(255,255,255,.1)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}

[data-site-footer]{background:#020409!important;border-top:1px solid rgba(170,200,255,.12)!important;color:#8592ae!important}
[data-site-footer] h4{color:#9cc8ff!important}
[data-site-footer] p{color:#5d6984!important}
[data-site-footer] ul a{color:#aab6cf!important}
[data-site-footer] ul a:hover{color:#ffffff!important}
[data-site-footer] a.rounded-full{background:transparent!important;border:1px solid rgba(170,200,255,.2);color:#c9d3e8}
[data-site-footer] a.rounded-full:hover{border-color:#9cc8ff;color:#ffffff}
[data-site-footer] div[class*="border-t"]{border-color:rgba(170,200,255,.1)!important}

[data-hidden-header-link]{background:rgba(4,8,18,.55)!important;border:1px solid rgba(170,200,255,.25);color:#eef3ff!important;
  -webkit-backdrop-filter:blur(18px) saturate(170%);backdrop-filter:blur(18px) saturate(170%);box-shadow:inset 0 1px 0 rgba(255,255,255,.22)!important}
body:has([data-hidden-header-link]) .rn{--rn-sticky:0px}
`;

export function royalNavyCss(palette: RnPalette): string {
  return themeCss(palette) + CHROME_CSS;
}

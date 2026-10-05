/**
 * AURORA GLASS — USLUBLAR.
 *
 * Hamma selektor `.au` ostida, keyframe nomlari `au-` bilan. `<style>`
 * dizayn ichida chiziladi — sahifadan chiqilganda DOM'dan ketadi.
 *
 * SHISHA (`.au-glass`): oq shaffof tana + kuchli xiralash, ichki oq aks
 * (yuqori qirra), pastel gradient qirra (`::before`, niqob bilan) va juda
 * yumshoq soya. Matn har doim to'q ko'k — aurora faqat urg'uda.
 */

export interface AuPalette {
  pearl: string;
  ink: string;
  sky: string;
  lavender: string;
  pink: string;
  peach: string;
}

const themeCss = (p: AuPalette) => /* css */ `
.au{
  --au-pearl:${p.pearl};--au-ink:${p.ink};--au-ink-2:#3b4262;--au-ink-3:#6b7290;--au-ink-4:#a0a6bd;
  --au-sky:${p.sky};--au-lavender:${p.lavender};--au-pink:${p.pink};--au-peach:${p.peach};--au-cyan:#8fe3e8;
  --au-aurora:linear-gradient(95deg,#5fb2f5 0%,#8f86f5 38%,#ec7fbb 70%,#f6a77d 100%);
  --au-aurora-soft:linear-gradient(95deg,#d6ecff 0%,#e4defe 45%,#ffdcec 80%,#ffe6d6 100%);
  --au-line:rgba(110,120,180,.14);
  --au-ease:cubic-bezier(.22,1,.36,1);
  --au-gutter:clamp(1rem,4.4vw,4rem);--au-sticky:76px;
  position:relative;isolation:isolate;overflow-x:clip;background:var(--au-pearl);color:var(--au-ink);
  font-family:var(--au-sans),ui-sans-serif,system-ui,sans-serif;font-size:1rem;line-height:1.65;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.au ::selection{background:#e4defe;color:var(--au-ink)}
.au :where(a){color:inherit;text-decoration:none}
.au :where(button){font:inherit}
.au :focus-visible{outline:2px solid var(--au-lavender);outline-offset:3px}
.au-wrap{width:100%;max-width:1360px;margin-inline:auto;padding-inline:var(--au-gutter)}
.au-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.au-gradient{color:transparent;background:var(--au-aurora);-webkit-background-clip:text;background-clip:text}

/* ===================================================== AURORA FON */
.au-sky{position:absolute;inset:0;z-index:-1;overflow:clip;pointer-events:none}
.au-sky__inner{position:sticky;top:0;height:100vh;height:100lvh;overflow:hidden}
.au-blob{position:absolute;display:block;border-radius:50%;aspect-ratio:1;opacity:.75}
.au-blob--a{left:-14%;top:-22%;width:max(52vw,420px);background:radial-gradient(closest-side,rgba(124,196,255,.55),transparent)}
.au-blob--b{right:-16%;top:-6%;width:max(50vw,420px);background:radial-gradient(closest-side,rgba(169,155,255,.45),transparent)}
.au-blob--c{left:26%;top:30%;width:max(40vw,340px);background:radial-gradient(closest-side,rgba(255,159,203,.35),transparent)}
.au-blob--d{right:4%;bottom:-24%;width:max(42vw,360px);background:radial-gradient(closest-side,rgba(255,191,152,.38),transparent)}

/* ===================================================== SHISHA */
.au-glass{position:relative;isolation:isolate;border-radius:var(--au-r,22px);
  background:linear-gradient(150deg,rgba(255,255,255,.78),rgba(255,255,255,.46));
  -webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 0 0 1px rgba(255,255,255,.5),
    0 22px 44px -30px rgba(70,80,160,.4),0 2px 6px -3px rgba(70,80,160,.12)}
.au-glass::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
  background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(169,155,255,.35) 38%,rgba(255,159,203,.3) 68%,rgba(124,196,255,.45));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}

/* Kursorga ergashuvchi yumshoq nur — shisha ichida yorug'lik siljiydi. */
.au-glass::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;
  background:radial-gradient(260px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.75),rgba(236,232,255,.25) 40%,transparent 70%);
  transition:opacity .6s var(--au-ease)}
.au-glass[data-au-lit]::after{opacity:1}
/* Linza: Chromium'da shisha chetida fon sinadi (SVG siljish xaritasi). */
.au[data-au-lens] .au-lens{
  -webkit-backdrop-filter:url(#au-lens) blur(10px) saturate(175%) brightness(1.04);
  backdrop-filter:url(#au-lens) blur(10px) saturate(175%) brightness(1.04)}
.au[data-au-lens] .au-lens--wide{
  -webkit-backdrop-filter:url(#au-lens-wide) blur(9px) saturate(175%) brightness(1.04);
  backdrop-filter:url(#au-lens-wide) blur(9px) saturate(175%) brightness(1.04)}
.au-defs{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}

/* Chiziqli ikonka — kichik shisha idishda. */
.au-icon{display:grid;place-items:center;flex:none;width:2.6rem;height:2.6rem;border-radius:14px;color:#6c74ee;
  background:linear-gradient(150deg,rgba(255,255,255,.95),rgba(236,232,255,.7));
  box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px rgba(169,155,255,.28),0 8px 16px -10px rgba(100,100,200,.45)}
.au-icon svg{width:1.25rem;height:1.25rem}

/* ===================================================== HERO */
.au-hero{position:relative}
.au-stage{position:relative;max-width:1600px;margin:0 auto;height:clamp(620px,calc(100svh - 76px - 132px),880px)}

.au-intro{position:absolute;left:var(--au-gutter);top:clamp(1.5rem,4vh,2.6rem);z-index:5;width:min(33%,32rem);container-type:inline-size}
.au-micro{margin:0;padding:0 0 0 1rem;list-style:none;position:relative;
  font-size:.66rem;font-weight:600;letter-spacing:.3em;line-height:1.95;text-transform:uppercase;color:var(--au-ink-3)}
.au-micro::before{content:"";position:absolute;left:0;top:.2em;bottom:.2em;width:2px;border-radius:2px;background:linear-gradient(180deg,var(--au-sky),var(--au-lavender),var(--au-pink))}
.au-name{margin:clamp(1.4rem,4.6vh,2.8rem) 0 0;font-family:var(--au-display),ui-sans-serif,system-ui,sans-serif;font-weight:800;
  font-size:min(clamp(3rem,1.9rem + 4.4vw,6.8rem),calc(100cqi / (var(--au-n,8) * .7)));line-height:1;letter-spacing:-.04em;color:var(--au-ink)}
.au-name__line{display:block;overflow:hidden;padding:0 0 .12em;margin-bottom:-.1em}
.au-name__line>span{display:block}
.au-name__line--aurora>span{color:transparent;background:var(--au-aurora);background-size:160% 100%;-webkit-background-clip:text;background-clip:text}

.au-visual{position:absolute;inset:0;z-index:1}
/* Egilgan shisha panellar — portret ortida va oldida. */
.au-pane{position:absolute;display:block;border-radius:30px;pointer-events:none;
  background:linear-gradient(155deg,rgba(255,255,255,.62),rgba(255,255,255,.18));
  -webkit-backdrop-filter:blur(10px) saturate(150%);backdrop-filter:blur(10px) saturate(150%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 0 0 1px rgba(255,255,255,.55),0 30px 60px -40px rgba(90,90,190,.45)}
/* Panel qirrasi — oq yorug'lik va pastel aks, xuddi shisha kabi. */
.au-pane::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.2px;pointer-events:none;z-index:1;
  background:linear-gradient(135deg,rgba(255,255,255,1),rgba(255,255,255,.2) 30%,rgba(169,155,255,.35) 60%,rgba(255,159,203,.4) 85%,rgba(255,255,255,.9));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.au-pane--a{left:34%;top:9%;width:15%;height:30%;transform:rotate(-14deg);
  background:linear-gradient(155deg,rgba(214,236,255,.85),rgba(228,222,254,.45))}
.au-pane--b{left:52%;top:4%;width:22%;height:72%;transform:rotate(11deg);overflow:hidden;
  background:linear-gradient(165deg,rgba(228,222,254,.75),rgba(214,236,255,.35) 55%,rgba(255,220,236,.5))}
.au-pane--photo::after{content:"";position:absolute;inset:0;border-radius:inherit;opacity:.5;
  background:linear-gradient(165deg,rgba(214,236,255,.55),rgba(255,220,236,.45)),var(--au-scene) center/cover no-repeat;
  filter:saturate(.7) contrast(.95);mix-blend-mode:multiply}
.au-pane--c{left:28%;bottom:4%;width:24%;height:42%;transform:rotate(9deg);
  background:linear-gradient(160deg,rgba(255,220,236,.7),rgba(255,230,214,.4))}
/* Oldingi shisha — yarmi portret chetida, yarmi fonda: sinish ko'rinib turadi. */
.au-pane--front{left:62%;bottom:-3%;z-index:4;width:13%;height:21%;border-radius:32px;transform:rotate(-8deg);
  background:linear-gradient(160deg,rgba(255,255,255,.9),rgba(240,236,255,.72) 55%,rgba(255,228,240,.7))}
.au-orb{position:absolute;left:58%;top:34%;z-index:2;display:block;width:clamp(4.5rem,8vw,7.5rem);aspect-ratio:1;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle at 34% 28%,#fff 0,rgba(255,255,255,.95) 7%,rgba(214,236,255,.7) 26%,rgba(169,155,255,.45) 52%,rgba(255,159,203,.4) 74%,rgba(255,191,152,.35) 92%);
  box-shadow:inset -6px -10px 22px rgba(169,155,255,.35),inset 4px 6px 12px rgba(255,255,255,.8),0 20px 40px -24px rgba(120,100,220,.6)}

.au-figure{position:absolute;left:49%;bottom:0;z-index:3;translate:-50% 0;height:97%;width:min(44rem,44%);container-type:size;pointer-events:none}
.au-frame{position:absolute;left:50%;bottom:0;translate:-50% 0;width:min(100cqw,calc(100cqh * var(--au-arn,.75)));aspect-ratio:var(--au-ar,3/4)}
.au-frame__mono{object-fit:contain;object-position:50% 100%;filter:grayscale(1) contrast(1.05) brightness(1.04);transition:opacity 1.2s var(--au-ease)}
.au-frame__mono[data-au-hidden]{opacity:0}
.au-frame__color{position:absolute;inset:0;overflow:hidden;opacity:0;transition:opacity 1.2s var(--au-ease);
  -webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.au-frame__color[data-au-shown]{opacity:1}
.au-frame__color img{position:absolute;max-width:none;filter:saturate(1.02) brightness(1.03)}
.au-photo{position:absolute;inset:6% 6% 0;overflow:hidden;border-radius:40px 40px 0 0;
  -webkit-mask-image:linear-gradient(180deg,#000 70%,transparent);mask-image:linear-gradient(180deg,#000 70%,transparent)}
.au-photo img{object-fit:cover;object-position:50% 18%}
.au-mono{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--au-display),sans-serif;font-weight:800;
  font-size:clamp(6rem,15vw,10rem);color:transparent;background:var(--au-aurora);-webkit-background-clip:text;background-clip:text}

/* Suzuvchi ma'lumot kartalari. */
.au-float{display:flex;align-items:center;gap:.85rem;min-width:0;padding:.85rem 1.05rem;--au-r:18px}
.au-float p{min-width:0;margin:0;font-size:.86rem;font-weight:500;line-height:1.35;color:var(--au-ink);overflow-wrap:break-word;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.au-float small{display:block;margin-top:.15rem;font-size:.72rem;font-weight:500;color:var(--au-ink-3)}
/* O'ng ustunga tegmaydi: o'ng cheti kartalar ustunining chap chetiga bog'langan. */
.au-float--place{position:absolute;right:calc(var(--au-gutter) + min(21%,19rem) + 1.25rem);top:54%;z-index:4;max-width:min(15.5rem,21%)}
.au-cards{position:absolute;right:var(--au-gutter);top:30%;z-index:5;display:grid;gap:.75rem;width:min(21%,19rem);margin:0;padding:0;list-style:none}

.au-notes{position:absolute;left:var(--au-gutter);bottom:clamp(1.2rem,3.6vh,2.2rem);z-index:5;width:min(29%,26rem)}
.au-quote{position:relative;margin:0 0 1.3rem;padding:0 0 0 3.2rem;font-size:clamp(1rem,.95rem + .25vw,1.12rem);line-height:1.55;color:var(--au-ink-2);text-wrap:pretty}
.au-quote span{position:absolute;left:0;top:-.35rem;font-family:var(--au-display),sans-serif;font-weight:800;font-size:3.6rem;line-height:1;
  color:transparent;background:var(--au-aurora);-webkit-background-clip:text;background-clip:text;opacity:.7}
.au-actions{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.1rem}
.au-btn{display:inline-flex;align-items:center;gap:.55rem;height:2.9rem;padding:0 1.3rem;border:0;border-radius:999px;cursor:pointer;white-space:nowrap;
  font-size:.86rem;font-weight:600;color:var(--au-ink);
  transition:transform .5s var(--au-ease),box-shadow .5s var(--au-ease),background-color .4s}
.au-btn svg{width:14px;height:14px}
.au-btn:hover{transform:translateY(-1px)}
.au-btn--aurora{background:var(--au-aurora-soft);box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px rgba(255,255,255,.7),0 12px 26px -16px rgba(120,110,220,.65)}
.au-btn--aurora:hover{box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px rgba(255,255,255,.7),0 16px 30px -14px rgba(120,110,220,.75)}
.au-btn--glass{background:rgba(255,255,255,.6);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
  box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px rgba(169,155,255,.28),0 10px 22px -16px rgba(90,90,190,.5)}
.au-promo{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;margin:.9rem 0 0;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--au-ink-3)}
.au-promo button{display:inline-flex;align-items:center;gap:.4rem;padding:0;border:0;background:none;cursor:pointer;font-size:.84rem;font-weight:700;letter-spacing:.12em;color:var(--au-ink)}
.au-promo svg{width:13px;height:13px}
.au-promo a{color:#6c74ee}

/* IJTIMOIY TARMOQLAR — o'z brend rangida. */
.au-social{display:flex;flex-wrap:wrap;gap:.6rem;margin:0;padding:0;list-style:none}
.au-brand{display:grid;place-items:center;width:2.45rem;height:2.45rem;border-radius:50%;color:#fff;
  box-shadow:0 8px 16px -10px rgba(60,70,140,.6);transition:transform .5s var(--au-ease)}
.au-brand svg{width:1.2rem;height:1.2rem}
.au-brand:hover{transform:translateY(-2px)}
.au-brand--telegram{background:#27a7e7}
.au-brand--instagram{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)}
.au-brand--youtube{background:#ff0000}
.au-brand--linkedin{background:#0a66c2}
.au-brand--facebook{background:#1877f2}
.au-brand--x{background:#111}
.au-brand--tiktok{background:#111}
.au-brand--tiktok svg{filter:drop-shadow(-1px -1px 0 #25f4ee) drop-shadow(1px 1px 0 #fe2c55)}
.au-brand--web{background:#6c74ee}

/* ===================================================== STATISTIKA */
.au-stats{position:relative;z-index:6;padding-bottom:clamp(2.5rem,5vw,4rem)}
.au-stats__row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0;padding:.5rem;list-style:none;--au-r:24px}
.au-stat{display:flex;align-items:center;gap:.9rem;min-width:0;padding:.9rem 1rem}
.au-stat div{min-width:0}
.au-stat b{display:block;font-family:var(--au-display),sans-serif;font-size:1.35rem;font-weight:700;line-height:1.1;letter-spacing:-.02em;color:var(--au-ink);font-variant-numeric:tabular-nums}
.au-stat__soft{font-family:var(--au-sans),sans-serif;font-size:.95rem;font-weight:600;letter-spacing:0;color:var(--au-ink-2)}
.au-stat span{display:block;margin-top:.2rem;font-size:.76rem;line-height:1.3;color:var(--au-ink-3)}
.au-stat em{margin-left:.45rem;font-style:normal;font-weight:700}
.au-up{color:#22a06b}
.au-down{color:#d9534f}
.au-stat__icon{display:grid;place-items:center;flex:none;width:2.9rem;height:2.9rem;border-radius:16px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9),inset 0 0 0 1px rgba(255,255,255,.6)}
.au-stat__icon svg{width:1.35rem;height:1.35rem}
.au-stat__icon--lavender{background:linear-gradient(150deg,rgba(169,155,255,.28),rgba(169,155,255,.1));color:#7a68f2}
.au-stat__icon--sky{background:linear-gradient(150deg,rgba(124,196,255,.32),rgba(124,196,255,.1));color:#3b8fe0}
.au-stat__icon--pink{background:linear-gradient(150deg,rgba(255,159,203,.34),rgba(255,159,203,.1));color:#de4f95}
.au-stat__icon--peach{background:linear-gradient(150deg,rgba(255,191,152,.4),rgba(255,191,152,.12));color:#df7536}
.au-stat__icon--cyan{background:linear-gradient(150deg,rgba(143,227,232,.42),rgba(143,227,232,.12));color:#1a9ea7}
.au-stat:last-child:nth-child(odd){grid-column:1/-1}
@media (min-width:760px){
  .au-stats__row{grid-template-columns:repeat(3,minmax(0,1fr))}
  .au-stat:last-child:nth-child(odd){grid-column:auto}
}
@media (min-width:1100px){
  .au-stats__row{grid-template-columns:repeat(var(--au-cols,6),minmax(0,1fr));padding:.6rem}
  .au-stat{padding:1rem 1.3rem}
  .au-stat+.au-stat{border-left:1px solid var(--au-line)}
  .au-stat b{font-size:1.5rem}
}

/* ===================================================== BO'LIMLAR */
.au-sec{position:relative;padding-block:clamp(3.5rem,2.5rem + 5vw,7.5rem);scroll-margin-top:var(--au-sticky)}
.au-sec__grid{display:grid;gap:2rem;align-items:start}
.au-head{display:flex;gap:1.3rem;align-items:flex-start;min-width:0}
.au-head>div{flex:1;min-width:0;container-type:inline-size}
.au-head__no{display:flex;flex-direction:column;align-items:center;gap:.7rem;margin:.2rem 0 0;font-family:var(--au-display),sans-serif;font-size:1.05rem;font-weight:700;color:var(--au-ink)}
.au-head__no i{width:2px;height:4.5rem;border-radius:2px;background:linear-gradient(180deg,var(--au-sky),var(--au-lavender),var(--au-pink),transparent);transform-origin:top}
.au-kicker{display:flex;align-items:center;gap:.7rem;margin:0 0 .9rem;font-size:.68rem;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--au-ink-3)}
.au-kicker::before{content:"";width:2px;height:.9rem;border-radius:2px;background:linear-gradient(180deg,var(--au-sky),var(--au-pink))}
.au-h2{margin:0;font-family:var(--au-display),sans-serif;font-weight:800;
  font-size:min(clamp(2.4rem,1.5rem + 3.2vw,4.6rem),calc(100cqi / (var(--au-n,8) * .64)));line-height:1.02;letter-spacing:-.04em;color:var(--au-ink);text-wrap:balance}
.au-meta{margin:1rem 0 0;font-size:.76rem;font-weight:500;color:var(--au-ink-3)}
.au-sec__body{min-width:0}
@media (min-width:960px){
  .au-sec--split .au-sec__grid{grid-template-columns:minmax(0,4fr) minmax(0,7fr);gap:clamp(2rem,5vw,5rem)}
  .au-sec--split .au-head{position:sticky;top:calc(var(--au-sticky) + 2rem)}
  .au-sec--guide .au-sec__grid{grid-template-columns:minmax(0,3.6fr) minmax(0,5fr) minmax(0,4.4fr)}
  .au-sec--stack .au-sec__grid{gap:2.6rem}
}

/* BIOGRAFIYA */
.au-story{color:var(--au-ink-2)}
.au-lead{margin:0;font-size:clamp(1.05rem,.98rem + .3vw,1.22rem);line-height:1.75;color:var(--au-ink-2);text-wrap:pretty}
.au-more{margin-top:1.6rem}
.au-more summary{list-style:none;width:fit-content}
.au-more summary::-webkit-details-marker{display:none}
.au-more summary svg{transition:transform .5s var(--au-ease)}
.au-more[open] summary svg{transform:rotate(90deg)}
.au-story__rest{margin-top:2rem;padding:clamp(1.2rem,3vw,2rem);border-radius:24px;background:rgba(255,255,255,.55);box-shadow:inset 0 0 0 1px rgba(255,255,255,.8)}
.au-story__rest p{margin:0 0 1em;font-size:1rem;line-height:1.8;text-wrap:pretty;overflow-wrap:break-word}
.au-story__part+.au-story__part{margin-top:1.8rem}
.au-story h3{margin:0 0 .7rem;font-family:var(--au-display),sans-serif;font-size:1.2rem;font-weight:700;line-height:1.3;letter-spacing:-.02em;color:var(--au-ink)}
.au-story h3 small{display:block;margin-bottom:.3rem;font-size:.7rem;font-weight:700;letter-spacing:.2em;color:#8f86f5}

/* Keyingi bo'limlarga pastel kartalar. */
.au-guide{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:0;padding:0;list-style:none}
.au-guide__card{position:relative;display:flex;flex-direction:column;justify-content:space-between;min-height:15rem;overflow:hidden;border-radius:26px;padding:1.1rem;
  background:linear-gradient(160deg,#dcefff 0%,#e7e1ff 50%,#ffe0ee 100%);
  box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px rgba(255,255,255,.7),0 24px 44px -30px rgba(90,90,190,.5);
  transition:transform .6s var(--au-ease),box-shadow .6s var(--au-ease)}
.au-guide li:nth-child(2) .au-guide__card{background:linear-gradient(160deg,#e7e1ff 0%,#ffe0ee 55%,#ffe8da 100%);margin-top:2rem}
.au-guide__card--photo::before{content:"";position:absolute;inset:auto 0 0 0;height:62%;opacity:.65;
  background:linear-gradient(180deg,rgba(231,225,255,1),rgba(231,225,255,0) 40%),var(--au-scene) center/cover no-repeat;
  mix-blend-mode:multiply;filter:saturate(.7)}
.au-guide__card:hover{transform:translateY(-4px);box-shadow:inset 0 1px 0 #fff,inset 0 0 0 1px rgba(255,255,255,.7),0 30px 50px -30px rgba(90,90,190,.6)}
.au-guide__no{position:relative;display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:14px;font-family:var(--au-display),sans-serif;font-weight:700;font-size:.9rem;
  background:rgba(255,255,255,.7);box-shadow:inset 0 1px 0 #fff}
.au-guide__title{position:relative;font-size:.66rem;font-weight:700;letter-spacing:.24em;line-height:1.7;text-transform:uppercase;color:var(--au-ink-2)}
.au-guide__go{position:absolute;right:1.1rem;top:1.1rem;color:#4f7fe8}
.au-guide__go svg{width:1.4rem;height:1.4rem}

/* VAQT PANELI */
.au-timeline{margin:0;padding:clamp(1.2rem,3vw,2rem) clamp(1.2rem,3vw,2rem) .6rem;list-style:none;--au-r:26px}
.au-timeline__item{position:relative;padding:0 0 1.8rem 1.8rem}
.au-timeline__item::before{content:"";position:absolute;left:.38rem;top:.5rem;bottom:0;width:2px;border-radius:2px;background:linear-gradient(180deg,rgba(169,155,255,.5),rgba(255,159,203,.2))}
.au-timeline__item:last-child::before{display:none}
.au-timeline__dot{position:absolute;left:0;top:.3rem;width:.9rem;height:.9rem;border-radius:50%;background:var(--au-aurora);box-shadow:0 0 0 4px rgba(255,255,255,.9),0 4px 10px rgba(143,134,245,.4)}
.au-timeline__when{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;margin:0 0 .35rem;font-size:.8rem;font-weight:700;color:#6c74ee}
.au-timeline__when span{padding:.15rem .6rem;border-radius:999px;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--au-ink-3);background:rgba(255,255,255,.8)}
.au-timeline__item b{display:block;font-family:var(--au-display),sans-serif;font-size:1.1rem;font-weight:700;line-height:1.3;letter-spacing:-.015em}
.au-timeline__sub{display:block;margin-top:.2rem;font-size:.9rem;color:var(--au-ink-3)}
.au-timeline__text{margin:.5rem 0 0;font-size:.94rem;line-height:1.7;color:var(--au-ink-2);white-space:pre-line}

/* YUTUQLAR — suzuvchi */
.au-floating{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr));gap:1.2rem;margin:0;padding:0;list-style:none}
.au-floating__item{display:flex;gap:1rem;padding:1.3rem 1.3rem 1.4rem;--au-r:24px;transition:transform .6s var(--au-ease)}
.au-floating__item:hover{transform:translateY(-4px)}
.au-floating__item>div{min-width:0}
.au-floating__year{margin:0 0 .3rem;font-size:.72rem;font-weight:700;letter-spacing:.14em;color:#8f86f5}
.au-floating__item b{display:block;font-family:var(--au-display),sans-serif;font-size:1.1rem;font-weight:700;line-height:1.3;letter-spacing:-.015em}
.au-floating__item span{display:block;margin-top:.25rem;font-size:.88rem;color:var(--au-ink-3)}
.au-floating__item p{margin:.55rem 0 0;font-size:.92rem;line-height:1.65;color:var(--au-ink-2);white-space:pre-line}
.au-floating__item .au-go{margin-top:.8rem}
@media (min-width:960px){.au-floating__item:nth-child(3n+2){transform:translateY(2.2rem)}.au-floating__item:nth-child(3n+2):hover{transform:translateY(1.9rem)}}

/* SERTIFIKATLAR — bitta panel */
.au-certs{margin:0;padding:.4rem clamp(1rem,2.6vw,1.8rem);list-style:none;--au-r:26px}
.au-cert{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.7rem 1.5rem;padding:1.15rem 0;border-bottom:1px solid var(--au-line)}
.au-cert:last-child{border-bottom:0}
.au-cert b{display:block;font-family:var(--au-display),sans-serif;font-size:1.05rem;font-weight:700;line-height:1.3}
.au-cert span{display:block;margin-top:.2rem;font-size:.86rem;color:var(--au-ink-3)}
.au-cert__end{display:flex;align-items:center;gap:1rem}
.au-pill{display:inline-flex;align-items:center;height:1.75rem;padding:0 .8rem;border-radius:999px;font-size:.68rem;font-weight:700;letter-spacing:.06em;color:var(--au-ink-3);background:rgba(255,255,255,.85);box-shadow:inset 0 0 0 1px var(--au-line)}
.au-pill--ok{color:#1d8c5f;background:rgba(214,247,231,.9);box-shadow:inset 0 0 0 1px rgba(34,160,107,.25)}
.au-go{display:inline-flex;align-items:center;gap:.4rem;font-size:.82rem;font-weight:700;color:#6c74ee}
.au-go svg{width:11px;height:11px;transition:transform .5s var(--au-ease)}
.au-go:hover svg{transform:translate(2px,-2px)}

/* MAQOLALAR — pastel surat kartalari */
.au-press{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr));gap:1.4rem;margin:0;padding:0;list-style:none}
.au-press__card{display:block;transition:transform .6s var(--au-ease)}
.au-press__card:hover{transform:translateY(-4px)}
.au-press__shot{position:relative;display:block;aspect-ratio:16/11;overflow:hidden;border-radius:26px;background:var(--au-aurora-soft)}
.au-press__shot img{object-fit:cover;transition:transform 1.2s var(--au-ease)}
.au-press__card:hover .au-press__shot img{transform:scale(1.04)}
.au-press__body{display:block;margin:-2.4rem .8rem 0;padding:1rem 1.1rem 1.1rem;--au-r:20px}
.au-press__meta{display:block;font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8f86f5}
.au-press__card b{display:block;margin-top:.4rem;font-family:var(--au-display),sans-serif;font-size:1.05rem;font-weight:700;line-height:1.3;letter-spacing:-.015em}
@media (min-width:960px){.au-press li:first-child{grid-column:span 2}.au-press li:first-child .au-press__shot{aspect-ratio:16/8}}

/* KITOBLAR */
.au-library{display:grid;gap:2.4rem}
.au-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.4rem,1fr));gap:1.4rem 1.1rem;margin:0;padding:0;list-style:none}
.au-book{display:block}
.au-book__cover{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;border-radius:14px;background:var(--au-aurora-soft);box-shadow:0 18px 30px -20px rgba(80,80,170,.6)}
.au-book__cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--au-ease)}
.au-book:hover .au-book__cover img{transform:scale(1.04)}
.au-book__blank{position:absolute;inset:0;display:grid;place-items:center;padding:.8rem;text-align:center;font-size:.86rem;font-weight:700;color:var(--au-ink-2)}
.au-book b{display:block;margin-top:.65rem;font-size:.86rem;font-weight:700;line-height:1.35}
.au-book span{display:block;font-size:.78rem;color:var(--au-ink-3)}
.au-list{margin:0;padding:.4rem 1.4rem;list-style:none;--au-r:22px}
.au-list li{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.3rem 1rem;padding:.9rem 0;border-bottom:1px solid var(--au-line)}
.au-list li:last-child{border-bottom:0}
.au-list b{font-weight:700}
.au-list span{font-size:.86rem;color:var(--au-ink-3)}

/* GALEREYA */
.au-gallery{columns:2;column-gap:1rem;margin:0;padding:0;list-style:none}
.au-gallery li{break-inside:avoid;margin-bottom:1rem}
.au-shot{position:relative;margin:0;overflow:hidden;border-radius:24px;aspect-ratio:4/5;background:var(--au-aurora-soft);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.8),0 24px 44px -32px rgba(80,80,170,.6)}
.au-gallery li:nth-child(3n+2) .au-shot{aspect-ratio:1}
.au-shot img{object-fit:cover;object-position:50% 25%;transition:transform 1.2s var(--au-ease)}
.au-shot:hover img{transform:scale(1.04)}
.au-shot figcaption{position:absolute;left:.7rem;right:.7rem;bottom:.7rem;padding:.55rem .8rem;font-size:.78rem;line-height:1.4;--au-r:14px}
@media (min-width:900px){.au-gallery{columns:3;column-gap:1.3rem}.au-gallery--1{columns:1;max-width:36rem}.au-gallery--2{columns:2;max-width:56rem}}

/* IQTIBOSLAR */
.au-sayings{display:grid;gap:1rem;margin:0;padding:0;list-style:none}
.au-sayings li{padding:1.4rem 1.5rem;font-family:var(--au-display),sans-serif;font-size:1.15rem;font-weight:600;line-height:1.45;letter-spacing:-.015em;--au-r:22px}
.au-interlude{padding-block:clamp(2rem,4vw,4rem)}
.au-interlude__panel{max-width:62rem;margin:0 auto;padding:clamp(2rem,5vw,4.2rem);text-align:center;--au-r:34px}
.au-interlude blockquote{margin:0;font-family:var(--au-display),sans-serif;font-weight:700;font-size:clamp(1.5rem,1.1rem + 1.8vw,2.6rem);line-height:1.22;letter-spacing:-.03em;text-wrap:balance;
  color:transparent;background:linear-gradient(95deg,var(--au-ink) 0%,#4a4f8a 50%,#8f5aa8 100%);-webkit-background-clip:text;background-clip:text}
.au-interlude figcaption{margin-top:1.6rem;font-size:.7rem;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--au-ink-3)}

/* ===================================================== YAKUN */
.au-outro{padding:clamp(1.5rem,3vw,3rem) 0 clamp(7rem,6rem + 3vw,8rem)}
.au-outro__panel{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.4rem 2rem;padding:clamp(1.3rem,3vw,2.2rem);--au-r:28px}
.au-outro__name{margin:0;font-family:var(--au-display),sans-serif;font-size:clamp(1.15rem,1rem + .8vw,1.6rem);font-weight:800;letter-spacing:-.03em}
.au-outro__end{display:flex;flex-wrap:wrap;align-items:center;gap:1rem}
@media (min-width:1024px){.au-outro{padding-bottom:clamp(4rem,3rem + 2vw,5rem)}}

/* ===================================================== TELEFON */
@media (max-width:959.98px){
  .au-stage{height:auto;display:flex;flex-direction:column;padding:1.2rem var(--au-gutter) 1.4rem}
  .au-intro{position:relative;inset:auto;width:100%}
  .au-name{margin-top:1rem;font-size:min(4.4rem,calc(100cqi / (var(--au-n,8) * .7)))}
  .au-visual{position:relative;inset:auto;height:clamp(400px,112vw,560px);margin:.4rem calc(var(--au-gutter) * -1) 0}
  .au-pane--a{left:6%;top:6%;width:30%;height:30%}
  .au-pane--b{left:52%;top:2%;width:40%;height:70%}
  .au-pane--c{left:4%;bottom:6%;width:46%;height:38%}
  .au-pane--front{left:70%;width:26%;height:18%}
  .au-orb{left:72%;top:42%}
  .au-figure{left:50%;width:92%;height:98%}
  .au-float--place{left:var(--au-gutter);right:auto;top:auto;bottom:1rem;max-width:62%}
  .au-cards{position:relative;inset:auto;width:100%;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:1rem}
  .au-cards li:first-child{grid-column:1/-1}
  .au-notes{position:relative;inset:auto;width:100%;margin-top:1.4rem}
}
@media (max-width:420px){.au-cards{grid-template-columns:minmax(0,1fr)}}

/* ===================================================== HARAKAT */
@keyframes au-rise{from{transform:translateY(105%)}}
@keyframes au-up{from{opacity:0;transform:translateY(16px)}}
@keyframes au-fade{from{opacity:0}}
@keyframes au-portrait{from{opacity:0;transform:translateY(4%)}}
@keyframes au-pane{from{opacity:0;translate:0 24px}}
@keyframes au-drift-a{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(6%,5%,0) scale(1.08)}}
@keyframes au-drift-b{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-7%,6%,0) scale(.94)}}
@keyframes au-bob{0%,100%{translate:0 0}50%{translate:0 -6px}}
@keyframes au-flow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes au-line{from{transform:scaleY(0)}}
@keyframes au-failsafe{to{opacity:1;transform:none}}

@media (prefers-reduced-motion:no-preference){
  .au-name__line>span{animation:au-rise 1.2s var(--au-ease) backwards;animation-delay:.1s}
  .au-name__line:nth-child(2)>span{animation:au-rise 1.2s var(--au-ease) .22s backwards,au-flow 12s ease-in-out 1.5s infinite}
  .au-micro{animation:au-fade 1.2s var(--au-ease) .5s backwards}
  .au-pane{animation:au-pane 1.4s var(--au-ease) backwards}
  .au-pane--a{animation-delay:.3s}
  .au-pane--b{animation-delay:.4s}
  .au-pane--c{animation-delay:.5s}
  .au-pane--front{animation-delay:.9s}
  .au-figure{animation:au-portrait 1.6s var(--au-ease) .55s backwards}
  .au-orb{animation:au-fade 1.4s var(--au-ease) .9s backwards,au-bob 9s ease-in-out 2s infinite}
  .au-float{animation:au-up 1s var(--au-ease) backwards,au-bob 8s ease-in-out infinite;animation-delay:calc(1s + var(--i,0) * .12s),calc(2.4s + var(--i,0) * .9s)}
  .au-float--place{animation-delay:.95s,2s}
  .au-notes{animation:au-up 1.1s var(--au-ease) 1.1s backwards}
  .au-stats__row{animation:au-up 1s var(--au-ease) 1.25s backwards}
  .au-blob--a{animation:au-drift-a 26s ease-in-out infinite}
  .au-blob--b{animation:au-drift-b 32s ease-in-out infinite}
  .au-blob--c{animation:au-drift-a 36s ease-in-out infinite reverse}
  .au-blob--d{animation:au-drift-b 30s ease-in-out infinite reverse}
}
@media (prefers-reduced-motion:no-preference) and (scripting:enabled){
  .au [data-au-reveal]{opacity:0;transform:translateY(26px);transition:opacity 1.1s var(--au-ease),transform 1.2s var(--au-ease)}
  .au [data-au-reveal][data-au-in]{opacity:1;transform:none}
  .au [data-au-reveal] .au-head__no i{transform:scaleY(0);transition:transform 1.4s var(--au-ease) .3s}
  .au [data-au-reveal][data-au-in] .au-head__no i{transform:none}
  .au [data-au-in] :is(.au-floating__item,.au-timeline__item,.au-cert,.au-press li,.au-gallery li,.au-guide li,.au-sayings li){
    animation:au-up .9s var(--au-ease) backwards;animation-delay:calc(.12s + var(--n,0) * .07s)}
  .au [data-au-in] :is(.au-floating__item,.au-timeline__item,.au-cert,.au-press li,.au-gallery li,.au-guide li,.au-sayings li):nth-child(2){--n:1}
  .au [data-au-in] :is(.au-floating__item,.au-timeline__item,.au-cert,.au-press li,.au-gallery li,.au-guide li,.au-sayings li):nth-child(3){--n:2}
  .au [data-au-in] :is(.au-floating__item,.au-timeline__item,.au-cert,.au-press li,.au-gallery li,.au-guide li,.au-sayings li):nth-child(n+4){--n:3}
  .au:not([data-au-ready]) [data-au-reveal]{animation:au-failsafe 1s var(--au-ease) 3s forwards}
}
@media (prefers-reduced-motion:reduce){
  .au *,.au *::before,.au *::after{animation-duration:.01ms!important;animation-delay:0s!important;
    animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;

/*
 * SAYT QOBIG'I — faqat shu dizayn ochiq turganda oq + shaffof shisha +
 * pastel aurora. `display` ga tegilmaydi, ya'ni "Headerni berkitish"
 * ishlayveradi.
 */
const CHROME_CSS = /* css */ `
html body{background-color:#f7f8fc!important}
[data-site-header]{background:rgba(255,255,255,.62)!important;border-bottom-color:rgba(150,160,210,.18)!important;
  -webkit-backdrop-filter:blur(20px) saturate(170%)!important;backdrop-filter:blur(20px) saturate(170%)!important;
  box-shadow:0 10px 30px -24px rgba(90,90,180,.35)!important}
[data-site-header] nav[aria-label]{background:rgba(255,255,255,.55)!important;border-color:rgba(255,255,255,.9)!important;
  box-shadow:inset 0 1px 0 #fff,0 8px 20px -16px rgba(90,90,180,.35)!important}
[data-site-header] nav[aria-label]>a,[data-site-header] nav[aria-label] button{color:#4a5070!important}
[data-site-header] nav[aria-label]>a:hover,[data-site-header] nav[aria-label] button:hover{color:#151a33!important}
[data-site-header] nav[aria-label]>a.text-white{color:#151a33!important}
[data-site-header] nav[aria-label] .bg-gradient-blue{background:linear-gradient(95deg,#d6ecff,#e4defe 50%,#ffdcec)!important;box-shadow:inset 0 1px 0 #fff,0 6px 16px -10px rgba(120,110,220,.6)!important}
[data-site-header] nav[aria-label] button.text-electric-blue,[data-site-header] nav[aria-label] button[aria-expanded="true"]{background:rgba(228,222,254,.6)!important;color:#151a33!important}
[data-site-header] [role="menu"]{background:rgba(255,255,255,.88)!important;border-color:rgba(255,255,255,.95)!important;
  -webkit-backdrop-filter:blur(22px) saturate(170%)!important;backdrop-filter:blur(22px) saturate(170%)!important;box-shadow:0 30px 60px -30px rgba(90,90,180,.45)!important}
[data-site-header] [role="menu"] a:hover{background:rgba(228,222,254,.45)!important}
[data-site-header] [role="menu"] a>span:first-child{background:linear-gradient(150deg,#e4defe,#ffe0ee)!important;color:#6c74ee!important}
[data-site-header] [role="menu"] a:hover>span:first-child{background:linear-gradient(95deg,#7cc4ff,#a99bff)!important;color:#fff!important}
[data-site-header] a[aria-label="Qidiruv"],[data-site-header] a[aria-label="Jaxongir AI"]{background:rgba(255,255,255,.7)!important;border:1px solid rgba(255,255,255,.95)!important;color:#4a5070!important;
  box-shadow:0 6px 14px -10px rgba(90,90,180,.45)!important}
[data-site-header] a.bg-paper{background:rgba(255,255,255,.7)!important;border-color:rgba(255,255,255,.95)!important;color:#151a33!important;box-shadow:0 6px 14px -10px rgba(90,90,180,.45)!important}
[data-site-header] a.bg-gradient-blue{background:linear-gradient(95deg,#d6ecff,#e4defe 50%,#ffdcec)!important;color:#151a33!important;box-shadow:inset 0 1px 0 #fff,0 10px 24px -14px rgba(120,110,220,.7)!important}

[data-site-mobile-nav]{background:rgba(255,255,255,.7)!important;border-color:rgba(255,255,255,.95)!important;
  -webkit-backdrop-filter:blur(20px) saturate(170%)!important;backdrop-filter:blur(20px) saturate(170%)!important;box-shadow:0 18px 40px -20px rgba(90,90,180,.45)!important}
[data-site-mobile-nav] .text-electric-blue{color:#151a33!important}
[data-site-mobile-nav] .bg-gradient-blue{background:linear-gradient(95deg,#7cc4ff,#a99bff 55%,#ff9fcb)!important;color:#fff!important;box-shadow:none!important}
[data-site-mobile-nav] span.absolute{background:rgba(228,222,254,.55)!important}

[data-site-footer]{background:linear-gradient(180deg,#f7f8fc,#eef0fa)!important;border-top:0!important;color:#4a5070!important;position:relative}
[data-site-footer]::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(95deg,#7cc4ff,#a99bff 40%,#ff9fcb 75%,#ffbf98)}
[data-site-footer] h4{color:#151a33!important}
[data-site-footer] p{color:#6b7290!important}
[data-site-footer] ul a{color:#4a5070!important}
[data-site-footer] ul a:hover{color:#6c74ee!important}
[data-site-footer] a.rounded-full{background:rgba(255,255,255,.75)!important;border:1px solid rgba(255,255,255,.95);color:#4a5070}
[data-site-footer] div[class*="border-t"]{border-color:rgba(110,120,180,.14)!important}
/* Futer och — oq yozuvli logo o'rniga to'q yozuvlisi (header bilan bir xil usul). */
[data-site-footer] a[aria-label]:has(> img[src*="logo-dark"]){background:url("/_next/image?url=%2Fassets%2Fbrand%2Fozbekiston-lider-yoshlari%2Flogo-light-transparent.png&w=640&q=75") left center/contain no-repeat}
[data-site-footer] a[aria-label]:has(> img[src*="logo-dark"]) img{opacity:0}
[data-site-footer] a.rounded-full svg,[data-site-footer] .flex a svg{color:#4a5070}

[data-hidden-header-link]{background:rgba(255,255,255,.75)!important;color:#151a33!important;border:1px solid #fff;
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 8px 20px -12px rgba(90,90,180,.5)!important}
body:has([data-hidden-header-link]) .au{--au-sticky:0px}
`;

export function auroraGlassCss(palette: AuPalette): string {
  return themeCss(palette) + CHROME_CSS;
}

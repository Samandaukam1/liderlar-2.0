/**
 * EMERALD LEGACY — USLUBLAR.
 *
 * Hamma selektor `.el` ostida, keyframe nomlari `el-` bilan. `<style>`
 * dizayn ichida chiziladi — sahifadan chiqilganda DOM'dan ketadi.
 *
 * KOMPOZITSIYA BOSHQA DIZAYNLARDAN TUBDAN FARQ QILADI: bu yerda
 * "chapda portret → o'rtada ism → ostida ko'rsatkichlar paneli" tuzilishi
 * YO'Q. Hero assimetrik, portret pastga va o'ngga chiqib ketadi, raqamlar
 * esa kompozitsiya bo'ylab suzuvchi shisha modullarda. Har bo'lim o'z
 * geometriyasida: gorizontal vaqt o'qi, zinapoyali yutuqlar, assimetrik
 * sertifikat galereyasi, kinematik media lentasi.
 */

export interface ElPalette {
  void: string;
  emerald: string;
  glow: string;
  cream: string;
  gold: string;
}

const themeCss = (p: ElPalette) => /* css */ `
.el{
  --el-void:${p.void};--el-deep:#061a14;--el-panel:rgba(12,42,33,.55);
  --el-emerald:${p.emerald};--el-glow:${p.glow};
  --el-cream:${p.cream};--el-cream-2:#c4d6cc;--el-cream-3:#8ca89b;--el-cream-4:#5d7a6d;
  --el-gold:${p.gold};--el-gold-soft:rgba(185,154,91,.4);
  --el-line:rgba(141,214,180,.16);--el-line-2:rgba(141,214,180,.3);
  --el-ease:cubic-bezier(.19,1,.22,1);
  --el-sticky:64px;
  --el-gutter:clamp(1.1rem,4.5vw,4rem);
  position:relative;isolation:isolate;overflow-x:clip;
  background:var(--el-void);color:var(--el-cream);
  font-family:var(--el-sans),ui-sans-serif,system-ui,sans-serif;
  font-size:1rem;line-height:1.7;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.el ::selection{background:rgba(52,211,153,.3);color:#fff}
.el a{color:inherit;text-decoration:none}
.el :focus-visible{outline:1px solid var(--el-glow);outline-offset:4px}
.el-wrap{width:100%;max-width:1320px;margin-inline:auto;padding-inline:var(--el-gutter)}
.el-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.el-serif{font-family:var(--el-serif),Georgia,serif}

/* Nozik texnik to'r — zamonaviy geometriya, naqsh emas. */
.el-grid{position:absolute;inset:0;pointer-events:none;opacity:.55;
  background-image:linear-gradient(90deg,rgba(141,214,180,.07) 1px,transparent 1px),
    linear-gradient(180deg,rgba(141,214,180,.05) 1px,transparent 1px);
  background-size:clamp(68px,7vw,110px) clamp(68px,7vw,110px)}

/* Nurli chiziq — sekin o'tuvchi yorug'lik izi. */
.el-trace{position:absolute;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,var(--el-line-2) 18%,rgba(52,211,153,.75) 50%,var(--el-line-2) 82%,transparent)}

/* ===================================================== HERO (assimetrik) */
.el-hero{position:relative;z-index:2;isolation:isolate;padding-top:clamp(1.5rem,5vw,3rem)}
.el-hero__sky{position:absolute;inset:-10% -10% 0 -10%;z-index:-2;pointer-events:none;
  background:
    radial-gradient(42% 44% at 74% 24%,rgba(16,185,129,.22),transparent 70%),
    radial-gradient(60% 50% at 18% 72%,rgba(6,95,70,.4),transparent 72%),
    radial-gradient(90% 70% at 50% 0%,rgba(14,70,54,.55),transparent 76%)}
.el-hero__grid-bg{z-index:-1;-webkit-mask-image:radial-gradient(60% 55% at 70% 35%,#000,transparent 75%);
  mask-image:radial-gradient(60% 55% at 70% 35%,#000,transparent 75%)}

.el-rail{display:none}
.el-hero__grid{position:relative;display:grid;gap:0}
.el-copy{container-type:inline-size}

.el-eyebrow{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem .9rem;
  font-size:.62rem;font-weight:500;letter-spacing:.34em;text-transform:uppercase;color:var(--el-glow)}
.el-eyebrow__chip{display:inline-flex;align-items:center;gap:.5rem;height:1.7rem;padding:0 .8rem;border-radius:999px;
  border:1px solid var(--el-gold-soft);color:var(--el-gold);letter-spacing:.2em}
.el-eyebrow__chip::before{content:"";width:5px;height:5px;transform:rotate(45deg);background:currentColor}

/* ISM — me'moriy tipografiya zonasi. */
.el-name{margin:1.2rem 0 0;font-family:var(--el-display),ui-sans-serif,system-ui,sans-serif;font-weight:800;
  line-height:.98;letter-spacing:-.045em;color:#fff;text-transform:uppercase;
  /*
   * O'LCHAM USTUNGA MOSLANADI. "100cqi" — ustun kengligi; uni eng uzun
   * so'zdagi belgilar soniga bo'lamiz (Unbounded'da bosh harf ~0.84em).
   * Shuning uchun uzun familiya ham bitta qatorda qoladi va so'z
   * o'rtasidan bo'linmaydi.
   */
  font-size:clamp(1.2rem,calc(100cqi / (var(--el-ch,8) * .93)),5.4rem);
  overflow-wrap:normal;word-break:normal;hyphens:none}
@supports not (font-size:1cqi){
  .el-name{font-size:clamp(1.5rem,.4rem + 4.2vw,3.4rem)}
}
.el-name__line{display:block;overflow:hidden;padding:.06em 0;margin:-.06em 0}
.el-name__line>span{display:block}
.el-name__line:nth-child(2)>span{color:var(--el-cream)}
.el-name__sub{display:block;margin-top:.75rem;font-family:var(--el-serif),Georgia,serif;font-style:italic;font-weight:400;
  font-size:clamp(1.1rem,.8rem + 1.5vw,2.2rem);line-height:1.1;letter-spacing:-.01em;text-transform:none;color:var(--el-cream-3)}
.el-role{margin-top:1.3rem;max-width:30rem;font-size:clamp(.95rem,.9rem + .25vw,1.08rem);line-height:1.6;color:var(--el-cream-2)}
.el-role b{display:block;font-weight:600;color:#fff}

.el-quote{position:relative;margin-top:1.6rem;max-width:26rem;padding-left:1.3rem;
  border-left:1px solid var(--el-gold-soft);font-family:var(--el-serif),Georgia,serif;font-style:italic;
  font-size:clamp(1rem,.95rem + .5vw,1.22rem);line-height:1.5;color:var(--el-cream)}

.el-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.75rem}
.el-btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:.6rem;min-height:3rem;padding:0 1.4rem;
  overflow:hidden;border-radius:2px;border:1px solid var(--el-line-2);background:rgba(10,38,29,.5);
  font-size:.7rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--el-cream);cursor:pointer;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  transition:color .6s var(--el-ease),border-color .6s var(--el-ease),transform .6s var(--el-ease)}
.el-btn svg{width:15px;height:15px}
.el-btn::before{content:"";position:absolute;inset:0;z-index:-1;transform:translateX(-101%);
  background:linear-gradient(100deg,#0d6b4e,#34d399);transition:transform .75s var(--el-ease)}
.el-btn:hover{color:#04120d;border-color:var(--el-glow);transform:translateY(-2px)}
.el-btn:hover::before{transform:none}
.el-btn--gold{border-color:var(--el-gold-soft);color:var(--el-gold)}
.el-btn--gold::before{background:linear-gradient(100deg,#8a6f36,#d9bd82)}

/* PORTRET — pastga chiqib ketadi, ramkasiz. */
.el-figure{position:relative;z-index:2;margin-top:1.5rem}
.el-portrait{position:relative;width:100%;aspect-ratio:4/5;max-height:62svh;margin-inline:auto}
.el-portrait__frame{position:absolute;inset:0;display:block;transition:opacity .6s var(--el-ease)}
/*
 * FONSIZ PORTRET — ILIQ BRONZA TUS.
 *
 * Kesma oq-qora saqlanadi (post kartochkalari shunday loyihalangan), shu
 * sababli bu yerda filtr bilan bronza-oltin tusga keltiriladi: teri jonli
 * ko'rinadi, zumrad fonda esa iliq qarama-qarshilik hosil bo'ladi.
 * Yashil tus ATAYLAB berilmaydi — u yuzni kasal ko'rsatadi.
 */
.el-portrait__frame--cut{-webkit-mask-image:linear-gradient(180deg,#000 78%,rgba(0,0,0,.6) 92%,transparent 100%);
  mask-image:linear-gradient(180deg,#000 78%,rgba(0,0,0,.6) 92%,transparent 100%)}
.el-portrait__frame--cut img{object-fit:contain;object-position:50% 100%;
  filter:sepia(.52) saturate(1.5) brightness(1.07) contrast(1.05)}
.el-portrait__frame--photo{inset:0;overflow:hidden;
  /* Chetlari yumshoq — to'rtburchak chegara ko'rinmaydi, rasm fonga singadi. */
  -webkit-mask-image:radial-gradient(82% 70% at 50% 38%,#000 26%,rgba(0,0,0,.55) 64%,transparent 96%);
  mask-image:radial-gradient(82% 70% at 50% 38%,#000 26%,rgba(0,0,0,.55) 64%,transparent 96%)}
.el-portrait__frame--photo img{object-fit:cover;object-position:50% 14%;filter:brightness(.97) saturate(1.16) contrast(1.04)}
.el-portrait__veil{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,rgba(4,17,13,0) 44%,rgba(4,17,13,.55) 78%,rgba(4,17,13,.96) 100%),
    radial-gradient(74% 62% at 50% 36%,transparent 36%,rgba(6,26,20,.72) 100%)}
.el-initials{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--el-serif),Georgia,serif;
  font-size:clamp(5rem,20vw,11rem);font-weight:500;color:rgba(52,211,153,.18)}

/* O'NG TOMONDAGI SANOQLAR — portret atrofida. */
.el-side{position:relative;z-index:3;display:grid;gap:.75rem;margin-top:1rem}
.el-counts{display:flex;gap:.5rem;justify-content:center}
.el-counts li{flex:1;min-width:0;max-width:8rem;padding:.6rem .7rem;border-radius:3px;text-align:center;
  border:1px solid var(--el-line);background:rgba(8,32,25,.6);
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.el-counts b{display:block;font-family:var(--el-display),sans-serif;font-weight:800;font-size:1.15rem;line-height:1;color:#fff;font-variant-numeric:tabular-nums}
.el-counts span{display:block;margin-top:.3rem;font-size:.54rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--el-cream-4)}
@media (min-width:1080px){
  .el-side{position:absolute;right:var(--el-gutter);top:clamp(2.5rem,8vh,5rem);bottom:clamp(2.5rem,8vh,5rem);
    width:11.5rem;margin:0;align-content:space-between;gap:1.25rem}
  .el-counts{flex-direction:column;gap:.6rem}
  .el-counts li{max-width:none;padding:.8rem .9rem;text-align:left;transition:border-color .6s var(--el-ease),transform .6s var(--el-ease)}
  .el-counts li:nth-child(2){transform:translateX(-1.2rem)}
  .el-counts li:hover{border-color:var(--el-line-2)}
  .el-counts b{font-size:1.45rem}
}

/* Promo kod — o'ng ustunda. */
.el-promo{padding:.95rem 1rem;border-radius:3px;border:1px solid var(--el-gold-soft);
  background:linear-gradient(150deg,rgba(60,48,22,.5),rgba(10,32,25,.5));
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.el-promo__k{font-size:.54rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--el-gold)}
.el-promo__code{display:flex;align-items:center;justify-content:space-between;gap:.6rem;width:100%;margin-top:.5rem;
  padding:0;border:0;background:transparent;cursor:pointer;color:#fff;
  font-family:var(--el-sans),sans-serif;font-size:1.02rem;font-weight:700;letter-spacing:.14em}
.el-promo__code svg{width:14px;height:14px;flex:none;color:var(--el-gold)}
.el-promo__code:hover svg{color:var(--el-glow)}
.el-promo__cta{display:inline-block;margin-top:.55rem;font-size:.6rem;font-weight:500;letter-spacing:.08em;color:var(--el-cream-3);
  transition:color .5s var(--el-ease)}
.el-promo__cta:hover{color:var(--el-glow)}

/* O'ng tomondagi bo'limlar ko'rsatkichi. */
.el-index{display:none}
@media (min-width:1080px){
  .el-index{display:block;padding-left:.9rem;border-left:1px solid var(--el-line)}
  .el-index ol{display:grid;gap:.5rem}
  .el-index a{display:flex;align-items:baseline;gap:.5rem;font-size:.66rem;font-weight:500;letter-spacing:.06em;
    color:var(--el-cream-4);transition:color .5s var(--el-ease),transform .5s var(--el-ease)}
  .el-index a:hover{color:var(--el-glow);transform:translateX(3px)}
  .el-index i{font-style:normal;font-size:.54rem;font-weight:600;letter-spacing:.1em;color:var(--el-gold);font-variant-numeric:tabular-nums}
}

/* SUZUVCHI MA'LUMOT MODULLARI — gorizontal panel EMAS. */
.el-mods{position:relative;z-index:3;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin-top:-2.75rem}
.el-mods>:nth-child(3):last-child{grid-column:1/-1}
.el-mod{position:relative;overflow:hidden;padding:.9rem .95rem;border-radius:3px;border:1px solid var(--el-line);
  background:linear-gradient(145deg,rgba(13,45,35,.82),rgba(6,26,20,.7));
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  transition:border-color .6s var(--el-ease),transform .6s var(--el-ease)}
.el-mod::after{content:"";position:absolute;left:0;top:0;width:100%;height:1px;
  background:linear-gradient(90deg,transparent,var(--el-glow),transparent);opacity:.5}
.el-mod:hover{border-color:var(--el-line-2);transform:translateY(-3px)}
.el-mod__k{display:flex;align-items:center;gap:.45rem;font-size:.56rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--el-cream-4)}
.el-mod__k svg{width:13px;height:13px;color:var(--el-glow)}
.el-mod__v{display:flex;align-items:baseline;gap:.3rem;margin-top:.45rem;font-family:var(--el-serif),Georgia,serif;
  font-weight:500;font-size:clamp(1.35rem,1.1rem + 1.1vw,2.1rem);line-height:1;color:#fff;font-variant-numeric:tabular-nums}
.el-mod__v i{font-family:var(--el-sans),sans-serif;font-style:normal;font-size:.6rem;font-weight:600;letter-spacing:.14em;color:var(--el-glow)}
.el-mod__v u{font-family:var(--el-sans),sans-serif;text-decoration:none;font-size:.95rem;font-style:italic;color:var(--el-cream-2)}
.el-mod--up .el-mod__v i{color:#4ade80}
.el-mod--down .el-mod__v i{color:#f87171}

@media (min-width:720px){
  .el-mods{grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}
  .el-mods>:nth-child(3):last-child{grid-column:auto}
  .el-mod{padding:1.1rem 1.15rem}
}
@media (min-width:1080px){
  .el-hero{padding-top:0}
  .el-hero__grid{grid-template-columns:minmax(0,1.04fr) minmax(0,.96fr);grid-template-rows:1fr auto;
    align-items:end;min-height:clamp(620px,calc(100svh - 64px),880px);column-gap:clamp(1rem,2vw,3rem)}
  .el-copy{container-type:inline-size;grid-column:1;grid-row:1;padding:clamp(3rem,7vh,6rem) 0 0;align-self:end;margin-left:clamp(-2.5rem,-1.6vw,0rem)}
  .el-figure{grid-column:2;grid-row:1/-1}
  /* Portret ustunning tashqarisiga chiqadi va pastdagi bo'limga tushadi. */
  .el-figure{align-self:stretch;margin:0}
  .el-portrait{position:absolute;right:8rem;bottom:-5rem;width:min(36vw,540px);height:min(90%,780px);max-height:none;aspect-ratio:auto}
  /* Modullar suzadi: har biri boshqa balandlikda. */
  .el-mods{grid-column:1;grid-row:2;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;
    margin:2.6rem 0 clamp(3.5rem,8vh,6.5rem);max-width:34rem}
  .el-mod:nth-child(1){transform:translateY(-14px)}
  .el-mod:nth-child(2){transform:translateY(10px)}
  .el-mod:nth-child(3){transform:translateY(-4px)}
  .el-mod:nth-child(4){transform:translateY(14px)}
  .el-mod:nth-child(1):hover{transform:translateY(-20px)}
  .el-mod:nth-child(2):hover{transform:translateY(4px)}
  .el-mod:nth-child(3):hover{transform:translateY(-10px)}
  .el-mod:nth-child(4):hover{transform:translateY(8px)}
  /* Chapdagi vertikal meros yozuvi. */
  .el-rail{display:block;position:absolute;left:calc(var(--el-gutter) * -1 + .35rem);top:clamp(4rem,10vh,8rem);
    writing-mode:vertical-rl;font-size:.6rem;font-weight:500;letter-spacing:.42em;text-transform:uppercase;color:var(--el-cream-4)}
  .el-rail span{display:inline-flex;align-items:center;gap:.9rem}
  .el-rail span::after{content:"";width:1px;height:2.2rem;background:linear-gradient(180deg,var(--el-line-2),transparent)}
}

/* ===================================================== DOSSIER (tezkor ma'lumot) */
.el-dossier{position:relative;z-index:1;border-top:1px solid var(--el-line);border-bottom:1px solid var(--el-line);
  background:linear-gradient(180deg,rgba(8,30,23,.86),rgba(4,17,13,.9))}
.el-dossier__row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.el-dossier__cell{min-width:0;padding:1.15rem 1rem 1.25rem 0;border-top:1px solid var(--el-line);
  transition:background-color .6s var(--el-ease)}
.el-dossier__cell:hover{background:rgba(52,211,153,.04)}
.el-dossier__cell:nth-child(2n){padding-left:1rem;border-left:1px solid var(--el-line)}
.el-dossier__cell:nth-child(-n+2){border-top:0}
.el-dossier dt{font-size:.56rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--el-glow)}
.el-dossier dd{margin-top:.5rem;font-size:.9rem;line-height:1.5;color:var(--el-cream);white-space:pre-line;overflow-wrap:break-word}
@media (min-width:900px){
  .el-dossier__row{grid-template-columns:repeat(4,minmax(0,1fr))}
  .el-dossier__cell{padding:1.6rem 1.5rem 1.8rem 0}
  .el-dossier__cell:nth-child(2n){padding-left:0;border-left:0}
  .el-dossier__cell:not(:nth-child(4n+1)){padding-left:1.5rem;border-left:1px solid var(--el-line)}
  .el-dossier__cell:nth-child(-n+4){border-top:0}
}

/* ===================================================== BO'LIM RAMKASI */
.el-sec{position:relative;padding-block:clamp(4rem,2.5rem + 6vw,8rem);scroll-margin-top:calc(var(--el-sticky) + 1rem)}
.el-sec--alt{background:linear-gradient(180deg,rgba(7,26,20,.72),transparent 60%)}
.el-sec__head{display:flex;align-items:flex-end;justify-content:space-between;gap:1.5rem;flex-wrap:wrap}
.el-no{font-family:var(--el-display),ui-sans-serif,system-ui,sans-serif;font-weight:800;font-size:clamp(2.6rem,2rem + 2.4vw,4.4rem);line-height:.8;
  color:transparent;-webkit-text-stroke:1px rgba(141,214,180,.35);font-variant-numeric:lining-nums}
.el-h2{margin-top:.5rem;font-family:var(--el-display),ui-sans-serif,system-ui,sans-serif;font-weight:700;
  font-size:clamp(1.5rem,1.1rem + 1.7vw,2.6rem);line-height:1.08;letter-spacing:-.035em;color:#fff;text-wrap:balance}
.el-kicker{margin-top:.6rem;font-size:.68rem;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--el-cream-4)}
.el-sec__rule{display:block;width:100%;height:1px;margin:1.6rem 0 2.5rem;transform-origin:left;
  background:linear-gradient(90deg,var(--el-line-2),transparent 70%)}

/* ===================================================== BIOGRAFIYA (keng editorial) */
.el-lead{max-width:48rem;font-family:var(--el-serif),Georgia,serif;font-weight:400;
  font-size:clamp(1.3rem,1.05rem + 1.1vw,2rem);line-height:1.42;letter-spacing:-.012em;color:#fff;text-wrap:pretty}
.el-lead::first-letter{float:left;margin:.1em .14em 0 0;font-size:3.2em;line-height:.76;color:var(--el-gold)}
.el-story{margin-top:2.75rem;font-size:clamp(.96rem,.94rem + .15vw,1.04rem);line-height:1.9;color:var(--el-cream-2)}
.el-story p{margin:0 0 1.1em;text-wrap:pretty;overflow-wrap:break-word}
.el-story h3{margin:0 0 .7rem;font-family:var(--el-serif),Georgia,serif;font-weight:500;font-size:1.3rem;line-height:1.25;color:#fff}
.el-story h3 small{display:block;margin-bottom:.35rem;font-family:var(--el-sans),sans-serif;font-size:.6rem;font-weight:500;letter-spacing:.24em;color:var(--el-glow)}
.el-story__part{break-inside:avoid-column;margin-bottom:2rem}
@media (min-width:900px){
  .el-story{column-count:2;column-gap:clamp(2.5rem,4vw,4.5rem);column-rule:1px solid var(--el-line)}
}
@media (min-width:1280px){.el-story{column-count:3}}

/* ===================================================== VAQT O'QI (gorizontal) */
.el-rail-scroller{position:relative;display:block;margin-inline:calc(var(--el-gutter) * -1);padding-inline:var(--el-gutter);
  overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.el-rail-scroller::-webkit-scrollbar{display:none}
.el-time{display:flex;gap:1rem}
.el-time__node{position:relative;flex:none;width:min(78vw,21rem);scroll-snap-align:start;padding-top:2.6rem}
.el-time__node::before{content:"";position:absolute;left:0;right:-1rem;top:.95rem;height:1px;background:var(--el-line)}
.el-time__node:last-child::before{right:0}
.el-time__node::after{content:"";position:absolute;left:0;top:.45rem;width:11px;height:11px;transform:rotate(45deg);
  background:var(--el-void);border:1px solid var(--el-glow);transition:background-color .6s var(--el-ease),box-shadow .6s var(--el-ease)}
.el-time__node:hover::after{background:var(--el-glow);box-shadow:0 0 18px rgba(52,211,153,.6)}
.el-time__when{font-size:.7rem;font-weight:600;letter-spacing:.14em;color:var(--el-glow);font-variant-numeric:tabular-nums}
.el-time__card{margin-top:.6rem;padding:1.1rem 1.15rem;border-radius:3px;border:1px solid var(--el-line);
  background:linear-gradient(160deg,rgba(12,42,33,.6),rgba(5,20,15,.5));min-height:7.5rem;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:border-color .6s var(--el-ease),transform .6s var(--el-ease)}
.el-time__node:hover .el-time__card{border-color:var(--el-line-2);transform:translateY(-3px)}
.el-time__card b{display:block;font-family:var(--el-serif),Georgia,serif;font-weight:500;font-size:1.12rem;line-height:1.3;color:#fff}
.el-time__card span{display:block;margin-top:.3rem;font-size:.82rem;color:var(--el-cream-3)}
.el-time__card p{margin:.55rem 0 0;font-size:.85rem;line-height:1.65;color:var(--el-cream-2);white-space:pre-line}
.el-time__tag{display:inline-block;margin-bottom:.55rem;font-size:.56rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--el-gold)}

/* ===================================================== YUTUQLAR (zinapoya) */
.el-steps{display:grid;gap:1px;background:var(--el-line)}
.el-stair{position:relative;overflow:hidden;display:grid;grid-template-columns:auto minmax(0,1fr);gap:1rem 1.1rem;
  padding:1.6rem 1.1rem;background:var(--el-void);transition:background-color .7s var(--el-ease)}
.el-stair:hover{background:rgba(10,38,29,.5)}
.el-stair__n{font-family:var(--el-display),ui-sans-serif,system-ui,sans-serif;font-weight:800;font-size:clamp(2.2rem,1.6rem + 2vw,3.6rem);line-height:.82;
  color:transparent;-webkit-text-stroke:1px var(--el-gold-soft);transition:color .7s var(--el-ease),-webkit-text-stroke-color .7s var(--el-ease)}
.el-stair:hover .el-stair__n{color:rgba(185,154,91,.16);-webkit-text-stroke-color:var(--el-gold)}
.el-stair__b{min-width:0}
.el-stair b{display:block;font-family:var(--el-serif),Georgia,serif;font-weight:500;
  font-size:clamp(1.15rem,1.05rem + .5vw,1.5rem);line-height:1.28;color:#fff}
.el-stair span{display:block;margin-top:.3rem;font-size:.86rem;color:var(--el-cream-3)}
.el-stair p{margin:.6rem 0 0;font-size:.92rem;line-height:1.7;color:var(--el-cream-2);white-space:pre-line;max-width:46rem}
.el-stair__meta{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1.2rem;margin-top:.8rem}
@media (min-width:860px){
  .el-stair{grid-template-columns:7rem minmax(0,1fr) auto;align-items:start;padding:2rem 1.5rem}
  /* Zinapoya: har qator biroz ichkariroq boshlanadi. */
  .el-stair:nth-child(2){padding-left:3rem}
  .el-stair:nth-child(3){padding-left:4.5rem}
  .el-stair:nth-child(n+4){padding-left:6rem}
  .el-stair__meta{margin-top:0;justify-content:flex-end;text-align:right}
}
.el-year{font-size:.7rem;font-weight:600;letter-spacing:.14em;color:var(--el-glow);font-variant-numeric:tabular-nums}
.el-trust{display:inline-flex;align-items:center;gap:.45rem;font-size:.58rem;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--el-cream-4)}
.el-trust::before{content:"";width:5px;height:5px;transform:rotate(45deg);border:1px solid currentColor}
.el-trust--ok{color:var(--el-glow)}
.el-trust--ok::before{background:currentColor}
.el-go{display:inline-flex;align-items:center;gap:.45rem;font-size:.6rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--el-cream-2);transition:color .5s var(--el-ease)}
.el-go svg{width:11px;height:11px;transition:transform .6s var(--el-ease)}
.el-go:hover{color:var(--el-glow)}
.el-go:hover svg{transform:translate(2px,-2px)}

/* ===================================================== SERTIFIKATLAR (assimetrik) */
.el-certs{display:grid;gap:.9rem}
.el-cert{position:relative;overflow:hidden;padding:1.25rem 1.2rem;border-radius:3px;border:1px solid var(--el-line);
  background:linear-gradient(150deg,rgba(12,42,33,.55),rgba(5,20,15,.4));
  transition:border-color .6s var(--el-ease),transform .6s var(--el-ease)}
.el-cert::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,var(--el-glow),transparent)}
.el-cert:hover{border-color:var(--el-line-2);transform:translateY(-4px)}
.el-cert b{display:block;font-family:var(--el-serif),Georgia,serif;font-weight:500;font-size:1.1rem;line-height:1.3;color:#fff}
.el-cert span{display:block;margin-top:.3rem;font-size:.82rem;color:var(--el-cream-3)}
.el-cert__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.6rem;margin-top:1rem}
@media (min-width:820px){
  .el-certs{grid-template-columns:repeat(6,minmax(0,1fr));gap:1rem}
  .el-cert{grid-column:span 3}
  .el-cert:nth-child(3n+1){grid-column:span 4}
  .el-cert:nth-child(3n+2){grid-column:span 2;margin-top:2.2rem}
  .el-cert:nth-child(3n){grid-column:span 3;margin-top:-1rem}
}

/* ===================================================== MEDIA (kinematik lenta) */
.el-reel{display:flex;gap:1rem}
.el-reel li{flex:none;width:min(84vw,30rem);scroll-snap-align:start}
.el-film{display:block;position:relative;overflow:hidden;border-radius:3px;border:1px solid var(--el-line);
  transition:border-color .6s var(--el-ease)}
.el-film:hover{border-color:var(--el-line-2)}
.el-film__shot{position:relative;aspect-ratio:16/9;overflow:hidden;background:#07211a}
.el-film__shot img{object-fit:cover;transition:transform 1.5s var(--el-ease)}
.el-film:hover .el-film__shot img{transform:scale(1.07)}
.el-film__shot::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(4,17,13,.88))}
.el-film__body{position:relative;padding:1rem 1.1rem 1.15rem}
.el-film__meta{font-size:.58rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--el-glow)}
.el-film b{display:block;margin-top:.45rem;font-family:var(--el-serif),Georgia,serif;font-weight:500;font-size:1.18rem;line-height:1.3;color:#fff}
.el-rail-ctrl{display:flex;justify-content:flex-end;gap:.5rem;margin-bottom:1rem}
.el-rail-ctrl button{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;cursor:pointer;
  border:1px solid var(--el-line);background:transparent;color:var(--el-cream-2);
  transition:border-color .5s var(--el-ease),color .5s var(--el-ease),background-color .5s var(--el-ease)}
.el-rail-ctrl button:hover{border-color:var(--el-glow);color:var(--el-glow);background:rgba(52,211,153,.07)}
.el-rail-ctrl button:disabled{opacity:.3;cursor:default}
.el-rail-ctrl svg{width:14px;height:14px}

/* ===================================================== KITOBLAR */
.el-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:1.2rem}
.el-book__cover{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;border-radius:2px;border:1px solid var(--el-line);background:#07211a}
.el-book__cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--el-ease)}
.el-book:hover .el-book__cover img{transform:scale(1.06)}
.el-book__blank{position:absolute;inset:0;display:grid;place-items:center;padding:.8rem;text-align:center;
  font-family:var(--el-serif),Georgia,serif;font-style:italic;font-size:.95rem;color:var(--el-glow)}
.el-book b{display:block;margin-top:.6rem;font-size:.86rem;font-weight:600;line-height:1.35;color:var(--el-cream)}
.el-book span{display:block;font-size:.76rem;color:var(--el-cream-4)}
.el-list{border-top:1px solid var(--el-line)}
.el-list li{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem .8rem;padding:.9rem 0;border-bottom:1px solid var(--el-line)}
.el-list b{font-family:var(--el-serif),Georgia,serif;font-weight:500;font-size:1.05rem;color:#fff}
.el-list span{font-size:.85rem;color:var(--el-cream-4)}

/* ===================================================== GALEREYA (mozaika) */
.el-mosaic{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
.el-tile{position:relative;overflow:hidden;border-radius:2px;aspect-ratio:1;background:#07211a}
.el-tile img{object-fit:cover;object-position:50% 25%;transition:transform 1.5s var(--el-ease),filter 1s var(--el-ease);filter:saturate(.85)}
.el-tile:hover img{transform:scale(1.07);filter:saturate(1)}
.el-tile::after{content:"";position:absolute;inset:0;pointer-events:none;
  box-shadow:inset 0 0 0 1px rgba(141,214,180,.12);transition:box-shadow .7s var(--el-ease)}
.el-tile:hover::after{box-shadow:inset 0 0 0 1px rgba(52,211,153,.45)}
.el-tile figcaption{position:absolute;inset:auto 0 0 0;padding:1.6rem .8rem .7rem;font-size:.76rem;line-height:1.4;color:#fff;
  background:linear-gradient(180deg,transparent,rgba(4,17,13,.86));opacity:0;transition:opacity .6s var(--el-ease)}
.el-tile:hover figcaption{opacity:1}
@media (min-width:760px){
  .el-mosaic{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:clamp(8rem,12vw,12rem);gap:.8rem}
  .el-tile{aspect-ratio:auto;height:100%}
  .el-tile:nth-child(6n+1){grid-column:span 2;grid-row:span 2}
  .el-tile:nth-child(6n+4){grid-row:span 2}
}

/* ===================================================== IQTIBOS (to'liq kenglik) */
.el-interlude{position:relative;overflow:hidden;padding-block:clamp(4.5rem,3rem + 7vw,9rem);text-align:center;
  border-top:1px solid var(--el-line);border-bottom:1px solid var(--el-line)}
.el-interlude__glow{position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:radial-gradient(44% 58% at 50% 50%,rgba(16,185,129,.16),transparent 72%)}
.el-interlude blockquote{max-width:52rem;margin-inline:auto;font-family:var(--el-serif),Georgia,serif;font-style:italic;font-weight:400;
  font-size:clamp(1.5rem,1.05rem + 2.1vw,2.9rem);line-height:1.32;letter-spacing:-.012em;color:#fff;text-wrap:balance}
.el-interlude figcaption{display:inline-flex;align-items:center;gap:.9rem;margin-top:2rem;
  font-size:.6rem;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:var(--el-gold)}
.el-interlude figcaption::before,.el-interlude figcaption::after{content:"";width:1.8rem;height:1px;background:currentColor;opacity:.6}

/* ===================================================== YAKUN */
.el-outro{position:relative;overflow:hidden;padding-block:clamp(4rem,3rem + 4vw,7rem) clamp(3rem,2.5rem + 3vw,5rem);text-align:center}
.el-outro__horizon{position:absolute;left:50%;bottom:18%;width:min(94%,60rem);height:1px;transform:translateX(-50%);
  z-index:-1;pointer-events:none}
.el-outro__horizon i{position:absolute;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(52,211,153,.5),transparent)}
.el-outro__horizon i:nth-child(2){top:-1.5rem;opacity:.5;transform:scaleX(.7)}
.el-outro__horizon i:nth-child(3){top:1.5rem;opacity:.35;transform:scaleX(.45)}
.el-outro__words{font-family:var(--el-serif),Georgia,serif;font-size:clamp(1.3rem,1.05rem + 1.1vw,2rem);line-height:1.45;color:var(--el-cream)}
.el-outro__words span{display:block}
.el-outro__words span:nth-child(2){color:var(--el-gold);font-style:italic}
.el-socials{display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem;margin-top:2rem}
.el-socials a{display:inline-flex;align-items:center;min-height:2.6rem;padding:0 1.1rem;border-radius:999px;
  border:1px solid var(--el-line);font-size:.62rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--el-cream-2);
  transition:border-color .5s var(--el-ease),color .5s var(--el-ease),background-color .5s var(--el-ease)}
.el-socials a:hover{border-color:var(--el-glow);color:var(--el-glow);background:rgba(52,211,153,.06)}

/* ===================================================== HARAKAT */
@keyframes el-rise{from{transform:translateY(110%)}to{transform:none}}
@keyframes el-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes el-fade{from{opacity:0}to{opacity:1}}
@keyframes el-wipe{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 -10% 0)}}
@keyframes el-portrait{from{opacity:0;transform:translateY(5%) scale(1.03)}to{opacity:1;transform:none}}
@keyframes el-halo{from{opacity:0;transform:translate(-50%,-50%) scale(.8)}to{opacity:1;transform:translate(-50%,-50%)}}
@keyframes el-flow{from{background-position:0 120%}to{background-position:0 -120%}}
@keyframes el-drift-a{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-4%,-6%,0) scale(1.08)}}
@keyframes el-drift-b{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(5%,4%,0) scale(.92)}}
@keyframes el-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes el-trace{0%{opacity:0;transform:translateX(-30%) scaleX(.4)}
  45%{opacity:1}100%{opacity:0;transform:translateX(30%) scaleX(1)}}
@keyframes el-failsafe{to{opacity:1;transform:none;clip-path:none}}

@media (prefers-reduced-motion:no-preference){
  .el-eyebrow{animation:el-fade 1.3s var(--el-ease) .1s both}
  .el-name__line>span{animation:el-rise 1.4s var(--el-ease) both;animation-delay:calc(.26s + var(--i,0) * .12s)}
  .el-name__sub{animation:el-up 1.2s var(--el-ease) .6s both}
  .el-seq{animation:el-up 1.1s var(--el-ease) both;animation-delay:calc(.76s + var(--i,0) * .1s)}
  .el-portrait{animation:el-portrait 1.8s var(--el-ease) .2s both}
  .el-portrait__halo{animation:el-halo 2.4s var(--el-ease) .1s both}
  .el-portrait__lines i{animation:el-flow 11s linear infinite}
  .el-portrait__lines i:nth-child(2){animation-duration:15s;animation-delay:-3s}
  .el-portrait__lines i:nth-child(3){animation-duration:13s;animation-delay:-7s}
  .el-portrait__lines i:nth-child(4){animation-duration:17s;animation-delay:-2s}
  .el-orb{animation:el-drift-a 24s ease-in-out infinite}
  .el-orb--2{animation:el-drift-b 30s ease-in-out infinite}
  .el-orb--3{animation:el-drift-b 36s ease-in-out infinite reverse}
  .el-trace{animation:el-trace 9s ease-in-out 1.6s infinite}
  .el-mod{animation:el-up 1s var(--el-ease) both;animation-delay:calc(1.1s + var(--i,0) * .1s)}
  .el-outro__horizon i{animation:el-rule 2.2s var(--el-ease) both}
}

@media (prefers-reduced-motion:no-preference) and (scripting:enabled){
  .el [data-el-reveal]{opacity:0;transform:translateY(26px);
    transition:opacity 1.1s var(--el-ease) var(--d,0s),transform 1.2s var(--el-ease) var(--d,0s)}
  .el [data-el-reveal][data-el-in]{opacity:1;transform:none}
  .el [data-el-reveal] .el-sec__rule{transform:scaleX(0);transition:transform 1.5s var(--el-ease) .2s}
  .el [data-el-reveal][data-el-in] .el-sec__rule{transform:scaleX(1)}
  .el [data-el-reveal] .el-h2{clip-path:inset(0 0 100% 0);transition:clip-path 1.2s var(--el-ease) .1s}
  .el [data-el-reveal][data-el-in] .el-h2{clip-path:inset(0 0 -10% 0)}
  /*
   * Bo'lim ichidagi elementlar ketma-ket chiqadi. Animatsiya FAQAT
   * ko'ringan holatda e'lon qilingan: skript ishlamasa, hammasi
   * odatdagidek ko'rinib turadi.
   */
  .el [data-el-in] .el-stair,
  .el [data-el-in] .el-cert,
  .el [data-el-in] .el-time__node,
  .el [data-el-in] .el-reel li,
  .el [data-el-in] .el-tile,
  .el [data-el-in] .el-books li,
  .el [data-el-in] .el-dossier__cell{animation:el-up .85s var(--el-ease) both;animation-delay:calc(.1s + var(--n,0) * .07s)}
  .el [data-el-in] :is(.el-stair,.el-cert,.el-time__node,.el-reel li,.el-tile,.el-books li,.el-dossier__cell):nth-child(1){--n:0}
  .el [data-el-in] :is(.el-stair,.el-cert,.el-time__node,.el-reel li,.el-tile,.el-books li,.el-dossier__cell):nth-child(2){--n:1}
  .el [data-el-in] :is(.el-stair,.el-cert,.el-time__node,.el-reel li,.el-tile,.el-books li,.el-dossier__cell):nth-child(3){--n:2}
  .el [data-el-in] :is(.el-stair,.el-cert,.el-time__node,.el-reel li,.el-tile,.el-books li,.el-dossier__cell):nth-child(4){--n:3}
  .el [data-el-in] :is(.el-stair,.el-cert,.el-time__node,.el-reel li,.el-tile,.el-books li,.el-dossier__cell):nth-child(5){--n:4}
  .el [data-el-in] :is(.el-stair,.el-cert,.el-time__node,.el-reel li,.el-tile,.el-books li,.el-dossier__cell):nth-child(n+6){--n:5}
  .el:not([data-el-ready]) [data-el-reveal]{animation:el-failsafe 1s var(--el-ease) 3s forwards}
  .el:not([data-el-ready]) [data-el-reveal] .el-h2{animation:el-failsafe 1s var(--el-ease) 3s forwards}
  .el:not([data-el-ready]) [data-el-reveal] .el-sec__rule{animation:el-rule 1s var(--el-ease) 3s forwards}
}

@media (prefers-reduced-motion:reduce){
  .el *,.el *::before,.el *::after{animation-duration:.01ms!important;animation-delay:0s!important;
    animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;

/*
 * SAYT QOBIG'I — faqat shu dizayn ochiq turganda zumrad-qora uslubga
 * o'tadi. `display` ga tegilmaydi, ya'ni "Headerni berkitish" ishlayveradi.
 */
const CHROME_CSS = /* css */ `
html body{background-color:#04110d!important}
[data-site-header]{background:rgba(4,17,13,.82)!important;border-bottom-color:rgba(141,214,180,.16)!important;box-shadow:none!important}
[data-site-logo]{background:url("/_next/image?url=%2Fassets%2Fbrand%2Fozbekiston-lider-yoshlari%2Flogo-dark-transparent.png&w=640&q=75") left center/contain no-repeat}
[data-site-logo] img{opacity:0}
[data-site-header] nav[aria-label]{background:rgba(141,214,180,.04)!important;border-color:rgba(141,214,180,.16)!important;box-shadow:none!important}
[data-site-header] nav[aria-label]>a,[data-site-header] nav[aria-label] button{color:#a7c3b6!important}
[data-site-header] nav[aria-label]>a:hover,[data-site-header] nav[aria-label] button:hover{color:#eef7f2!important}
[data-site-header] nav[aria-label]>a.text-white{color:#04110d!important}
[data-site-header] .bg-gradient-blue{background:linear-gradient(110deg,#0d6b4e,#34d399)!important;box-shadow:none!important}
[data-site-header] nav[aria-label] button.text-electric-blue,[data-site-header] nav[aria-label] button[aria-expanded="true"]{background:rgba(52,211,153,.1)!important;color:#34d399!important}
[data-site-header] [role="menu"]{background:rgba(6,26,20,.97)!important;border-color:rgba(141,214,180,.2)!important;box-shadow:0 30px 70px rgba(0,0,0,.6)!important}
[data-site-header] [role="menu"] p{color:#6f8c7f!important}
[data-site-header] [role="menu"] a{color:#c4d6cc!important}
[data-site-header] [role="menu"] a:hover{background:rgba(52,211,153,.07)!important}
[data-site-header] [role="menu"] a>span:first-child{background:rgba(52,211,153,.1)!important;color:#34d399!important}
[data-site-header] [role="menu"] a:hover>span:first-child{background:#34d399!important;color:#04110d!important}
[data-site-header] [role="menu"] a>span:last-child>span:first-child{color:#eef7f2!important}
[data-site-header] [role="menu"] a>span:last-child>span:last-child{color:#6f8c7f!important}
[data-site-header] a[aria-label="Qidiruv"],[data-site-header] a[aria-label="Jaxongir AI"]{background:transparent!important;border:1px solid rgba(141,214,180,.22)!important;color:#c4d6cc!important}
[data-site-header] a[aria-label="Qidiruv"]:hover,[data-site-header] a[aria-label="Jaxongir AI"]:hover{border-color:#34d399!important;color:#34d399!important}
[data-site-header] a.bg-transparent{color:#c4d6cc!important}
[data-site-header] a.bg-transparent svg{color:#34d399!important}
[data-site-header] a.bg-paper{background:transparent!important;border-color:rgba(141,214,180,.3)!important;color:#eef7f2!important;box-shadow:none!important}
[data-site-header] a.bg-paper:hover{border-color:#34d399!important}
[data-site-header] a.bg-gradient-blue{color:#04110d!important}

[data-site-mobile-nav]{background:rgba(6,24,18,.93)!important;border-color:rgba(141,214,180,.18)!important;box-shadow:0 18px 50px rgba(0,0,0,.6)!important}
[data-site-mobile-nav] a,[data-site-mobile-nav] button{color:#8ca89b!important}
[data-site-mobile-nav] .text-electric-blue{color:#34d399!important}
[data-site-mobile-nav] .bg-gradient-blue{background:linear-gradient(110deg,#0d6b4e,#34d399)!important;color:#04110d!important;box-shadow:none!important}
[data-site-mobile-nav] span.absolute{background:rgba(52,211,153,.07)!important}

[data-site-footer]{background:#030d0a!important;border-top:1px solid rgba(141,214,180,.16)!important;color:#8ca89b!important}
[data-site-footer] h4{color:#34d399!important}
[data-site-footer] p{color:#6f8c7f!important}
[data-site-footer] ul a{color:#a7c3b6!important}
[data-site-footer] ul a:hover{color:#34d399!important}
[data-site-footer] a.rounded-full{background:transparent!important;border:1px solid rgba(141,214,180,.22);color:#c4d6cc}
[data-site-footer] a.rounded-full:hover{border-color:#34d399;color:#34d399}
[data-site-footer] div[class*="border-t"]{border-color:rgba(141,214,180,.12)!important}

[data-hidden-header-link]{background:rgba(4,17,13,.7)!important;border:1px solid rgba(52,211,153,.35);color:#34d399!important;box-shadow:none!important}
body:has([data-hidden-header-link]) .el{--el-sticky:0px}
`;

export function emeraldLegacyCss(palette: ElPalette): string {
  return themeCss(palette) + CHROME_CSS;
}

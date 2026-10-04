/**
 * OBSIDIAN — USLUBLAR.
 *
 * Hamma selektor `.ob` ostida, keyframe nomlari `ob-` bilan. `<style>`
 * dizayn ichida chiziladi — sahifadan chiqilganda DOM'dan ketadi.
 *
 * Rang yo'q: qora, oq va kumush. Yagona istisno — ijtimoiy tarmoq
 * belgilari, ular o'z brend rangida.
 */

export interface ObPalette {
  black: string;
  white: string;
  silver: string;
  graphite: string;
}

const themeCss = (p: ObPalette) => /* css */ `
.ob{
  --ob-white:${p.white};--ob-2:${p.silver};--ob-3:${p.graphite};--ob-4:#55555b;
  --ob-line:rgba(255,255,255,.09);--ob-line-2:rgba(255,255,255,.2);
  --ob-ease:cubic-bezier(.22,1,.36,1);
  --ob-gutter:clamp(1rem,4.4vw,4rem);--ob-sticky:76px;
  position:relative;isolation:isolate;overflow-x:clip;background:${p.black};color:var(--ob-white);
  font-family:var(--ob-sans),ui-sans-serif,system-ui,sans-serif;font-size:1rem;line-height:1.65;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.ob ::selection{background:#fff;color:#000}
.ob :where(a){color:inherit;text-decoration:none}
.ob :where(button){font:inherit}
.ob :focus-visible{outline:1.5px solid #fff;outline-offset:3px}
.ob-wrap{width:100%;max-width:1360px;margin-inline:auto;padding-inline:var(--ob-gutter)}
.ob-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ob-label{margin:0 0 1rem;font-size:.68rem;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--ob-3)}

/* ===================================================== HERO */
.ob-hero{position:relative}
.ob-stage{position:relative;max-width:1600px;margin:0 auto;overflow:hidden;
  height:clamp(600px,calc(100svh - 76px - 112px),880px)}
/* Portret ortidagi juda nozik yorug'lik — qora kostyum qora fondan ajralsin. */
.ob-stage::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(36% 52% at 50% 52%,rgba(255,255,255,.075),transparent 72%)}
.ob-stage__floor{position:absolute;left:0;right:0;bottom:0;z-index:3;height:18%;pointer-events:none;
  background:linear-gradient(180deg,transparent,#000 92%)}

/* ULKAN ISM — har qator o'z kengligiga moslanadi (Anton ~0.5em/belgi). */
.ob-giant{position:absolute;left:50%;translate:-50% 0;top:clamp(7.4rem,17vh,9.6rem);z-index:1;width:min(calc(100% - 2 * var(--ob-gutter)),1180px);
  margin:0;container-type:inline-size;text-align:center;pointer-events:none;
  font-family:var(--ob-display),Impact,sans-serif;font-weight:400;text-transform:uppercase;line-height:.86;letter-spacing:.004em}
.ob-giant__first,.ob-giant__last{display:block;overflow:hidden;padding-top:.04em;white-space:nowrap}
.ob-giant__first{font-size:min(calc(100cqi / (var(--ob-n,8) * .54)),15rem)}
.ob-giant__first>span{display:block;color:transparent;
  background:linear-gradient(180deg,#ffffff 0%,#f2f2f2 55%,#bdbdbd 100%);-webkit-background-clip:text;background-clip:text}
.ob-giant__last{margin-top:.02em;font-size:min(calc(100cqi / (var(--ob-n,8) * .54)),15rem)}
.ob-giant__last>span{display:block;color:transparent;-webkit-text-stroke:1.3px rgba(255,255,255,.82)}

/* Ingichka orbita — chiziq chizilib chiqadi. */
.ob-orbit{position:absolute;left:50%;top:58%;z-index:1;width:min(70vh,640px);aspect-ratio:1;translate:-50% -50%;overflow:visible;pointer-events:none}
.ob-orbit circle{fill:none;stroke:rgba(255,255,255,.2);stroke-width:1px;vector-effect:non-scaling-stroke}
.ob-orbit .ob-orbit__dot{fill:#fff;stroke:none}

/* PORTRET — oldinda, katta. */
.ob-figure{position:absolute;left:50%;bottom:0;z-index:2;translate:-50% 0;height:88%;width:min(54rem,94%);container-type:size;pointer-events:none}
.ob-frame{position:absolute;left:50%;bottom:0;translate:-50% 0;width:min(100cqw,calc(100cqh * var(--ob-arn,.75)));aspect-ratio:var(--ob-ar,3/4)}
.ob-frame__mono{object-fit:contain;object-position:50% 100%;filter:grayscale(1) contrast(1.12) brightness(1.04);transition:opacity 1.2s var(--ob-ease)}
.ob-frame__mono[data-ob-hidden]{opacity:0}
.ob-frame__color{position:absolute;inset:0;overflow:hidden;opacity:0;transition:opacity 1.2s var(--ob-ease);
  -webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.ob-frame__color[data-ob-shown]{opacity:1}
/* Tabiiy rang, biroz yuqori kontrast — qora muhitga singishi uchun. */
.ob-frame__color img{position:absolute;max-width:none;filter:contrast(1.07) saturate(.94) brightness(1.02)}
.ob-photo{position:absolute;inset:4% 8% 0;overflow:hidden;
  -webkit-mask-image:radial-gradient(70% 66% at 50% 40%,#000 40%,transparent 92%);mask-image:radial-gradient(70% 66% at 50% 40%,#000 40%,transparent 92%)}
.ob-photo img{object-fit:cover;object-position:50% 18%;filter:contrast(1.08) saturate(.9)}
.ob-mono{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--ob-display),Impact,sans-serif;font-size:clamp(6rem,18vw,12rem);color:#1c1c1f}

/* ATROFDAGI MA'LUMOT */
.ob-tag{position:absolute;left:50%;translate:-50% 0;top:clamp(1.4rem,3.6vh,2.3rem);z-index:4;display:flex;align-items:center;gap:1rem;margin:0;white-space:nowrap;
  font-size:.68rem;font-weight:500;letter-spacing:.42em;text-transform:uppercase;color:var(--ob-2)}
.ob-tag i{width:3rem;height:1px;background:var(--ob-2)}
.ob-roles,.ob-place{position:absolute;top:clamp(2.6rem,7vh,4.3rem);z-index:4;margin:0;padding:0;list-style:none;max-width:15rem;
  font-size:.68rem;font-weight:500;letter-spacing:.3em;line-height:2;text-transform:uppercase}
.ob-roles{left:var(--ob-gutter);padding-left:1.1rem;border-left:1px solid var(--ob-line-2);color:var(--ob-2)}
.ob-roles::after,.ob-place::after{content:"";display:block;width:1.8rem;height:1px;margin-top:.9rem;background:var(--ob-3)}
.ob-place{right:var(--ob-gutter);color:var(--ob-3)}

.ob-left{position:absolute;left:var(--ob-gutter);bottom:clamp(1.4rem,4vh,2.4rem);z-index:4;width:min(27rem,31vw)}
.ob-quote{position:relative;margin:0 0 1.8rem;padding-left:3.1rem;font-family:var(--ob-serif),Georgia,serif;font-style:italic;
  font-size:clamp(1.25rem,1rem + .8vw,1.65rem);line-height:1.28;color:#fff;text-wrap:balance}
.ob-quote span{position:absolute;left:0;top:-.15em;font-family:var(--ob-display),Impact,sans-serif;font-style:normal;font-size:3.4rem;line-height:1;color:var(--ob-3)}
.ob-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem 1.6rem;margin:0}
.ob-facts>div{display:flex;gap:.75rem;min-width:0}
.ob-facts dt svg{width:20px;height:20px;color:#e9e9e9}
.ob-facts dd{min-width:0;margin:0;font-size:.82rem;line-height:1.4;color:#ededed;overflow-wrap:break-word;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ob-facts dd small{display:block;margin-top:.15rem;font-size:.72rem;color:var(--ob-4)}

.ob-right{position:absolute;right:var(--ob-gutter);bottom:clamp(1.4rem,4vh,2.4rem);z-index:4;display:flex;flex-direction:column;align-items:flex-end;gap:1.2rem}
.ob-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.7rem}
.ob-btn{display:inline-flex;align-items:center;gap:.6rem;height:3.1rem;padding:0 1.5rem;border-radius:999px;cursor:pointer;white-space:nowrap;
  font-size:.88rem;font-weight:600;letter-spacing:-.005em;
  transition:background-color .4s var(--ob-ease),border-color .4s var(--ob-ease),color .4s var(--ob-ease),transform .5s var(--ob-ease)}
.ob-btn svg{width:17px;height:17px;flex:none}
.ob-btn:hover{transform:translateY(-1px)}
.ob-btn--solid{border:1px solid #fff;background:#fff;color:#000}
.ob-btn--solid:hover{background:#e6e6e6;border-color:#e6e6e6}
.ob-btn--line{border:1px solid rgba(255,255,255,.38);background:transparent;color:#fff}
.ob-btn--line:hover{border-color:#fff;background:rgba(255,255,255,.06)}
.ob-promo{display:flex;align-items:center;gap:.8rem;margin:0;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:var(--ob-3)}
.ob-promo button{display:inline-flex;align-items:center;gap:.4rem;padding:0;border:0;background:none;cursor:pointer;
  font-size:.82rem;font-weight:700;letter-spacing:.14em;color:#fff}
.ob-promo svg{width:13px;height:13px}
.ob-promo a{color:var(--ob-2);transition:color .3s}
.ob-promo a:hover{color:#fff}

/* IJTIMOIY TARMOQLAR — yagona rangli element. */
.ob-social{display:flex;flex-wrap:wrap;gap:.6rem;margin:0;padding:0;list-style:none}
.ob-brand{display:grid;place-items:center;width:2.65rem;height:2.65rem;border-radius:50%;color:#fff;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);transition:transform .5s var(--ob-ease),filter .4s}
.ob-brand svg{width:1.3rem;height:1.3rem}
.ob-brand:hover{transform:translateY(-2px);filter:brightness(1.08)}
.ob-brand--telegram{background:#27a7e7}
.ob-brand--instagram{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)}
.ob-brand--youtube{background:#ff0000}
.ob-brand--linkedin{background:#0a66c2}
.ob-brand--facebook{background:#1877f2}
.ob-brand--x{background:#fff;color:#000}
.ob-brand--tiktok{background:#010101;box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.ob-brand--tiktok svg{filter:drop-shadow(-1px -1px 0 #25f4ee) drop-shadow(1px 1px 0 #fe2c55)}
.ob-brand--web{background:#26262a}

/* ===================================================== STATISTIKA */
.ob-stats{position:relative;z-index:5;padding-bottom:clamp(2.5rem,5vw,4rem)}
.ob-stats__row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin:0;padding:0;list-style:none;overflow:hidden;
  border:1px solid var(--ob-line-2);border-radius:18px;background:var(--ob-line)}
.ob-stat{display:flex;align-items:center;gap:.9rem;min-width:0;padding:1.1rem 1.1rem;background:#070708}
.ob-stat svg{width:1.8rem;height:1.8rem;flex:none;color:#ececec}
.ob-stat div{min-width:0}
.ob-stat b{display:block;font-size:1.35rem;font-weight:650;line-height:1.1;letter-spacing:-.02em;color:#fff;font-variant-numeric:tabular-nums}
.ob-stat__soft{font-size:.95rem;font-weight:500;letter-spacing:0;color:var(--ob-2)}
.ob-stat span{display:block;margin-top:.2rem;font-size:.74rem;line-height:1.3;color:var(--ob-3)}
.ob-stat em{margin-left:.5rem;font-style:normal;font-weight:600}
.ob-up{color:#4ade80}
.ob-down{color:#f87171}
/* Oxirgi qatorda bo'sh katak qolmasin: toq qoldiq qolgan joyni egallaydi. */
.ob-stat:last-child:nth-child(odd){grid-column:1/-1}
@media (min-width:700px){
  .ob-stats__row{grid-template-columns:repeat(3,minmax(0,1fr))}
  .ob-stat:last-child:nth-child(odd){grid-column:auto}
  .ob-stat:last-child:nth-child(3n+1){grid-column:1/-1}
  .ob-stat:last-child:nth-child(3n+2){grid-column:span 2}
}
@media (min-width:1080px){
  .ob-stats__row{grid-template-columns:repeat(var(--ob-cols,6),minmax(0,1fr))}
  .ob-stat:last-child:nth-child(n){grid-column:auto}
  .ob-stat{padding:1.35rem 1.6rem;gap:1.1rem}
  .ob-stat b{font-size:1.5rem}
}

/* ===================================================== BO'LIM */
.ob-sec{position:relative;border-top:1px solid var(--ob-line);padding-block:clamp(4rem,3rem + 5vw,8rem);scroll-margin-top:var(--ob-sticky)}
.ob-sec__grid{display:grid;gap:2.2rem}
.ob-sec__no{display:flex;align-items:center;gap:.9rem;margin:0;font-size:.72rem;font-weight:600;letter-spacing:.3em;color:var(--ob-3);font-variant-numeric:tabular-nums}
.ob-sec__no i{width:3rem;height:1px;background:var(--ob-line-2);transform-origin:left}
/* Sarlavha ustunga sig'adi: eng uzun so'z hech qachon o'rtasidan bo'linmaydi. */
.ob-sec__head{container-type:inline-size}
.ob-h2{margin:1rem 0 0;font-family:var(--ob-display),Impact,sans-serif;font-weight:400;
  font-size:min(clamp(3rem,2rem + 5vw,6.6rem),calc(100cqi / (var(--ob-n,8) * .56)));line-height:.9;
  letter-spacing:.003em;text-transform:uppercase;color:#fff;overflow-wrap:normal;word-break:normal;hyphens:none}
.ob-sec__kicker{margin:1.1rem 0 0;font-size:.7rem;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:var(--ob-3)}
.ob-sec__body{min-width:0}
@media (min-width:900px){
  .ob-sec__grid{grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(3rem,6vw,6rem);align-items:start}
  .ob-sec__head{position:sticky;top:calc(var(--ob-sticky) + 2rem)}
  .ob-sec--wide .ob-sec__grid{grid-template-columns:minmax(0,1fr);gap:2.6rem}
  .ob-sec--wide .ob-sec__head{position:static;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;column-gap:2rem}
  .ob-sec--wide .ob-sec__no{grid-column:1/-1}
  .ob-sec--wide .ob-sec__kicker{margin:0 0 .6rem}
}

/* BIOGRAFIYA */
.ob-story{max-width:44rem;font-size:clamp(1rem,.97rem + .15vw,1.08rem);line-height:1.85;color:var(--ob-2)}
.ob-story p{margin:0 0 1.1em;text-wrap:pretty;overflow-wrap:break-word}
.ob-story .ob-lead{font-size:clamp(1.28rem,1.08rem + .8vw,1.7rem);line-height:1.45;letter-spacing:-.015em;color:#fff}
.ob-story__part+.ob-story__part{margin-top:3rem}
.ob-story h3{display:flex;align-items:baseline;gap:1rem;margin:0 0 1.2rem;padding-bottom:.85rem;border-bottom:1px solid var(--ob-line);
  font-size:.8rem;font-weight:650;letter-spacing:.18em;line-height:1.4;text-transform:uppercase;color:#fff}
.ob-story h3 small{flex:none;font-size:.72rem;font-weight:500;color:var(--ob-4);font-variant-numeric:tabular-nums}

/* QATORLAR — ta'lim, faoliyat, sertifikatlar */
.ob-rows{margin:0;padding:0;list-style:none;border-top:1px solid var(--ob-line-2)}
.ob-row{display:grid;grid-template-columns:minmax(0,1fr);gap:.45rem;padding:1.5rem 0;border-bottom:1px solid var(--ob-line);transition:padding .6s var(--ob-ease)}
.ob-row:hover{padding-left:.7rem}
.ob-row__when{margin:0;font-family:var(--ob-display),Impact,sans-serif;font-size:1.25rem;letter-spacing:.03em;color:var(--ob-3);font-variant-numeric:tabular-nums}
.ob-row__main{min-width:0}
.ob-row__main b{display:block;font-size:1.18rem;font-weight:600;line-height:1.3;letter-spacing:-.01em;color:#fff}
.ob-row__main span{display:block;margin-top:.25rem;font-size:.92rem;color:var(--ob-3)}
.ob-row__main p{margin:.6rem 0 0;font-size:.95rem;line-height:1.7;color:var(--ob-2);white-space:pre-line}
.ob-row__tag{margin:0;font-size:.64rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--ob-3);white-space:nowrap}
.ob-row__tag--ok{color:#fff}
.ob-row__tag--ok::before{content:"";display:inline-block;width:6px;height:6px;margin-right:.55rem;border-radius:50%;background:#fff;vertical-align:.12em}
.ob-row--compact{padding:1.1rem 0}
@media (min-width:700px){
  .ob-row{grid-template-columns:10.5rem minmax(0,1fr) auto;gap:2rem;align-items:baseline}
  .ob-row--compact{grid-template-columns:minmax(0,1fr)}
}

/* YUTUQLAR */
.ob-honours{margin:0;padding:0;list-style:none;border-top:1px solid var(--ob-line-2)}
.ob-honour{display:grid;grid-template-columns:auto minmax(0,1fr);gap:.4rem 1.4rem;align-items:start;padding:1.8rem 0;border-bottom:1px solid var(--ob-line)}
.ob-honour__no{grid-row:span 2;font-family:var(--ob-display),Impact,sans-serif;font-size:clamp(2.6rem,2rem + 2vw,4.2rem);line-height:.82;
  color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.4);transition:color .6s var(--ob-ease),-webkit-text-stroke-color .6s var(--ob-ease)}
.ob-honour:hover .ob-honour__no{color:#fff;-webkit-text-stroke-color:#fff}
.ob-honour__main{min-width:0}
.ob-honour__main b{display:block;font-size:clamp(1.15rem,1rem + .5vw,1.45rem);font-weight:600;line-height:1.28;letter-spacing:-.015em;color:#fff}
.ob-honour__main span{display:block;margin-top:.3rem;font-size:.92rem;color:var(--ob-3)}
.ob-honour__main p{margin:.65rem 0 0;font-size:.95rem;line-height:1.7;color:var(--ob-2);white-space:pre-line}
.ob-honour__main .ob-go{margin-top:.9rem}
.ob-honour__year{margin:0;font-family:var(--ob-display),Impact,sans-serif;font-size:1.2rem;letter-spacing:.04em;color:var(--ob-3)}
@media (min-width:700px){
  .ob-honour{grid-template-columns:6rem minmax(0,1fr) auto;gap:2rem}
  .ob-honour__no{grid-row:auto}
}
.ob-go{display:inline-flex;align-items:center;gap:.4rem;font-size:.8rem;font-weight:600;color:var(--ob-2);transition:color .3s}
.ob-go svg{width:11px;height:11px;transition:transform .5s var(--ob-ease)}
.ob-go:hover{color:#fff}
.ob-go:hover svg{transform:translate(2px,-2px)}

/* MAQOLALAR */
.ob-press{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr));gap:2.6rem 1.6rem;margin:0;padding:0;list-style:none}
.ob-press__item{display:block}
.ob-press__shot{position:relative;display:block;aspect-ratio:4/3;overflow:hidden;border-radius:4px;background:#111113}
.ob-press__shot img{object-fit:cover;filter:grayscale(.85) contrast(1.05);transition:filter .8s var(--ob-ease),transform 1.2s var(--ob-ease)}
.ob-press__item:hover .ob-press__shot img{filter:none;transform:scale(1.04)}
.ob-press__meta{display:block;margin-top:1.05rem;font-size:.64rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--ob-3)}
.ob-press__item b{display:block;margin-top:.5rem;font-size:1.14rem;font-weight:600;line-height:1.3;letter-spacing:-.01em;color:#fff}

/* KITOBLAR */
.ob-library{display:grid;gap:2.8rem}
.ob-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.4rem,1fr));gap:1.6rem 1.2rem;margin:0;padding:0;list-style:none}
.ob-book{display:block}
.ob-book__cover{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;border-radius:3px;background:#111113;box-shadow:inset 0 0 0 1px var(--ob-line)}
.ob-book__cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ob-ease)}
.ob-book:hover .ob-book__cover img{transform:scale(1.04)}
.ob-book__blank{position:absolute;inset:0;display:grid;place-items:center;padding:.8rem;text-align:center;font-size:.86rem;font-weight:600;color:var(--ob-2)}
.ob-book b{display:block;margin-top:.7rem;font-size:.86rem;font-weight:600;line-height:1.35;color:#fff}
.ob-book span{display:block;font-size:.78rem;color:var(--ob-4)}

/* GALEREYA — assimetrik */
.ob-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.6rem,1.4vw,1.2rem);margin:0;padding:0;list-style:none}
.ob-gallery li{min-width:0}
.ob-gallery li:first-child{grid-column:1/-1}
.ob-shot{position:relative;height:clamp(12rem,52vw,22rem);margin:0;overflow:hidden;border-radius:4px;background:#111113}
.ob-shot img{object-fit:cover;object-position:50% 25%;filter:grayscale(.3) contrast(1.04);transition:filter .8s var(--ob-ease),transform 1.4s var(--ob-ease)}
.ob-shot:hover img{filter:none;transform:scale(1.03)}
.ob-shot figcaption{position:absolute;left:0;right:0;bottom:0;padding:2rem 1rem .9rem;font-size:.78rem;line-height:1.4;color:#fff;
  background:linear-gradient(180deg,transparent,rgba(0,0,0,.82));opacity:0;transition:opacity .5s var(--ob-ease)}
.ob-shot:hover figcaption{opacity:1}
@media (min-width:900px){
  .ob-gallery{grid-template-columns:repeat(12,minmax(0,1fr))}
  .ob-gallery li,.ob-gallery li:first-child{grid-column:span 5}
  .ob-gallery li:nth-child(4n+1),.ob-gallery li:nth-child(4n+4){grid-column:span 7}
  .ob-gallery--1 li:first-child{grid-column:3/span 8}
  .ob-shot{height:clamp(16rem,30vw,30rem)}
  .ob-gallery li:nth-child(4n+2) .ob-shot,.ob-gallery li:nth-child(4n+3) .ob-shot{margin-top:clamp(2rem,5vw,5rem)}
}

/* IQTIBOSLAR */
.ob-sayings{margin:0;padding:0;list-style:none;border-top:1px solid var(--ob-line-2)}
.ob-sayings li{padding:1.6rem 0;border-bottom:1px solid var(--ob-line);font-family:var(--ob-serif),Georgia,serif;font-style:italic;
  font-size:clamp(1.35rem,1.1rem + .9vw,1.9rem);line-height:1.3;color:#fff;text-wrap:balance}
.ob-interlude{border-top:1px solid var(--ob-line);padding-block:clamp(4.5rem,3rem + 6vw,9rem);text-align:center}
.ob-interlude figure{margin:0}
.ob-interlude blockquote{max-width:58rem;margin:0 auto;font-family:var(--ob-serif),Georgia,serif;font-style:italic;
  font-size:clamp(2rem,1.3rem + 3vw,4.4rem);line-height:1.12;letter-spacing:-.01em;color:#fff;text-wrap:balance}
.ob-interlude figcaption{margin-top:2rem;font-size:.7rem;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:var(--ob-3)}

/* ===================================================== YAKUN */
.ob-outro{border-top:1px solid var(--ob-line);padding:clamp(3rem,6vw,6rem) 0 clamp(7rem,6rem + 3vw,8rem);overflow:hidden}
.ob-outro .ob-wrap{container-type:inline-size}
.ob-outro__giant{margin:0;font-family:var(--ob-display),Impact,sans-serif;font-size:min(calc(100cqi / (var(--ob-n,8) * .54)),16rem);line-height:.86;
  text-align:center;text-transform:uppercase;white-space:nowrap;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.28)}
.ob-outro__row{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1.8rem 2rem;margin-top:clamp(2rem,4vw,3.5rem);
  padding-top:1.6rem;border-top:1px solid var(--ob-line)}
.ob-outro__name{margin:0;font-size:clamp(1.05rem,.95rem + .5vw,1.35rem);font-weight:600;letter-spacing:-.01em;color:#fff}
.ob-outro__end{display:flex;flex-wrap:wrap;align-items:center;gap:1rem}
@media (min-width:1024px){.ob-outro{padding-bottom:clamp(4rem,3rem + 2vw,5rem)}}

/* ===================================================== TELEFON */
@media (max-width:899.98px){
  .ob-stage{--ob-vis:clamp(440px,124vw,600px);height:auto;overflow:hidden;padding:var(--ob-vis) var(--ob-gutter) 1.8rem;
    display:flex;flex-direction:column;align-items:center;gap:1.4rem;text-align:center}
  .ob-stage::before{bottom:auto;height:var(--ob-vis)}
  .ob-stage__floor{top:calc(var(--ob-vis) * .74);bottom:auto;height:calc(var(--ob-vis) * .26 + 1px)}
  .ob-giant{top:calc(var(--ob-vis) * .1);width:calc(100% - 2 * var(--ob-gutter))}
  .ob-orbit{top:calc(var(--ob-vis) * .6);width:min(84vw,420px)}
  .ob-figure{top:calc(var(--ob-vis) * .16);bottom:auto;height:calc(var(--ob-vis) * .84);width:100%}
  .ob-tag{top:1.1rem;font-size:.6rem;letter-spacing:.32em}
  .ob-tag i{width:1.6rem}
  .ob-roles,.ob-place,.ob-left,.ob-right{position:relative;inset:auto;z-index:4;width:100%;max-width:34rem}
  .ob-roles,.ob-place{display:flex;flex-wrap:wrap;justify-content:center;gap:.1rem .9rem;padding:0;border:0;line-height:1.7;font-size:.62rem;letter-spacing:.24em}
  .ob-roles{margin-top:-.6rem;color:var(--ob-2)}
  .ob-place{margin-top:-1rem}
  .ob-roles::after,.ob-place::after{display:none}
  .ob-roles li+li::before,.ob-place li+li::before{content:"·";margin-right:.9rem;color:var(--ob-4)}
  .ob-quote{padding:2.2rem 0 0;text-align:center;font-size:1.3rem}
  .ob-quote span{left:50%;translate:-50% 0;top:-.4rem;font-size:3rem}
  .ob-facts{text-align:left;padding-top:1.2rem;border-top:1px solid var(--ob-line)}
  .ob-right{align-items:center}
  .ob-actions{justify-content:center}
}
@media (max-width:420px){
  .ob-facts{grid-template-columns:minmax(0,1fr)}
  .ob-btn{height:2.95rem;padding:0 1.2rem}
}

/* ===================================================== HARAKAT */
@keyframes ob-rise{from{transform:translateY(104%)}}
@keyframes ob-fade{from{opacity:0}}
@keyframes ob-up{from{opacity:0;transform:translateY(16px)}}
@keyframes ob-portrait{from{opacity:0;transform:translateY(3.5%) scale(1.025)}}
@keyframes ob-draw{from{stroke-dashoffset:1}}
@keyframes ob-line{from{transform:scaleX(0)}}
@keyframes ob-failsafe{to{opacity:1;transform:none}}

@media (prefers-reduced-motion:no-preference){
  /* Ism → portret → chiziq → atrofdagi ma'lumot. */
  .ob-giant__first>span{animation:ob-rise 1.3s var(--ob-ease) .1s backwards}
  .ob-giant__last>span{animation:ob-rise 1.3s var(--ob-ease) .26s backwards}
  .ob-figure{animation:ob-portrait 1.7s var(--ob-ease) .55s backwards}
  .ob-orbit circle:first-child{stroke-dasharray:1;animation:ob-draw 2.4s var(--ob-ease) .9s backwards}
  .ob-orbit__dot{animation:ob-fade .8s var(--ob-ease) 2.6s backwards}
  .ob-tag,.ob-roles,.ob-place{animation:ob-fade 1.2s var(--ob-ease) 1.05s backwards}
  .ob-left,.ob-right{animation:ob-up 1.1s var(--ob-ease) 1.25s backwards}
  .ob-stat{animation:ob-up .9s var(--ob-ease) backwards;animation-delay:calc(1.3s + var(--k,0) * .07s)}
  .ob-stat:nth-child(2){--k:1}
  .ob-stat:nth-child(3){--k:2}
  .ob-stat:nth-child(4){--k:3}
  .ob-stat:nth-child(5){--k:4}
  .ob-stat:nth-child(6){--k:5}
}
@media (prefers-reduced-motion:no-preference) and (scripting:enabled){
  .ob [data-ob-reveal]{opacity:0;transform:translateY(28px);transition:opacity 1.1s var(--ob-ease),transform 1.2s var(--ob-ease)}
  .ob [data-ob-reveal][data-ob-in]{opacity:1;transform:none}
  .ob [data-ob-reveal] .ob-sec__no i{transform:scaleX(0);transition:transform 1.4s var(--ob-ease) .3s}
  .ob [data-ob-reveal][data-ob-in] .ob-sec__no i{transform:none}
  .ob:not([data-ob-ready]) [data-ob-reveal]{animation:ob-failsafe 1s var(--ob-ease) 3s forwards}
}
@media (prefers-reduced-motion:reduce){
  .ob *,.ob *::before,.ob *::after{animation-duration:.01ms!important;animation-delay:0s!important;
    animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;

/*
 * SAYT QOBIG'I — faqat shu dizayn ochiq turganda qora-oq-kumush.
 * `display` ga tegilmaydi, ya'ni "Headerni berkitish" ishlayveradi.
 */
const CHROME_CSS = /* css */ `
html body{background-color:#000!important}
[data-site-header]{background:rgba(0,0,0,.84)!important;border-bottom-color:rgba(255,255,255,.08)!important;
  -webkit-backdrop-filter:blur(18px)!important;backdrop-filter:blur(18px)!important;box-shadow:none!important}
[data-site-logo]{background:url("/_next/image?url=%2Fassets%2Fbrand%2Fozbekiston-lider-yoshlari%2Flogo-dark-transparent.png&w=640&q=75") left center/contain no-repeat;filter:grayscale(1) brightness(1.25)}
[data-site-logo] img{opacity:0}
[data-site-header] nav[aria-label]{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
[data-site-header] nav[aria-label]>a,[data-site-header] nav[aria-label] button{color:#a3a3a8!important}
[data-site-header] nav[aria-label]>a:hover,[data-site-header] nav[aria-label] button:hover{color:#fff!important}
[data-site-header] nav[aria-label]>a.text-white{color:#000!important}
[data-site-header] nav[aria-label] .bg-gradient-blue{background:#fff!important;box-shadow:none!important}
[data-site-header] nav[aria-label] button.text-electric-blue,[data-site-header] nav[aria-label] button[aria-expanded="true"]{background:rgba(255,255,255,.08)!important;color:#fff!important}
[data-site-header] [role="menu"]{background:#0a0a0b!important;border-color:rgba(255,255,255,.12)!important;box-shadow:0 30px 70px rgba(0,0,0,.7)!important}
[data-site-header] [role="menu"] p{color:#6b6b72!important}
[data-site-header] [role="menu"] a{color:#d4d4d8!important}
[data-site-header] [role="menu"] a:hover{background:rgba(255,255,255,.06)!important}
[data-site-header] [role="menu"] a>span:first-child{background:rgba(255,255,255,.08)!important;color:#fff!important}
[data-site-header] [role="menu"] a:hover>span:first-child{background:#fff!important;color:#000!important}
[data-site-header] [role="menu"] a>span:last-child>span:first-child{color:#fff!important}
[data-site-header] [role="menu"] a>span:last-child>span:last-child{color:#6b6b72!important}
[data-site-header] a[aria-label="Qidiruv"],[data-site-header] a[aria-label="Jaxongir AI"]{background:transparent!important;border:1px solid rgba(255,255,255,.18)!important;color:#e4e4e7!important}
[data-site-header] a[aria-label="Qidiruv"]:hover,[data-site-header] a[aria-label="Jaxongir AI"]:hover{border-color:#fff!important;color:#fff!important}
[data-site-header] a.bg-transparent{color:#e4e4e7!important}
[data-site-header] a.bg-transparent svg{color:#fff!important}
[data-site-header] a.bg-paper{background:transparent!important;border-color:rgba(255,255,255,.3)!important;color:#fff!important;box-shadow:none!important}
[data-site-header] a.bg-paper:hover{border-color:#fff!important}
[data-site-header] a.bg-gradient-blue{background:#fff!important;color:#000!important;box-shadow:none!important}

[data-site-mobile-nav]{background:rgba(10,10,11,.88)!important;border-color:rgba(255,255,255,.12)!important;
  -webkit-backdrop-filter:blur(18px)!important;backdrop-filter:blur(18px)!important;box-shadow:0 18px 50px rgba(0,0,0,.7)!important}
[data-site-mobile-nav] a,[data-site-mobile-nav] button{color:#8a8a90!important}
[data-site-mobile-nav] .text-electric-blue{color:#fff!important}
[data-site-mobile-nav] .bg-gradient-blue{background:#fff!important;color:#000!important;box-shadow:none!important}
[data-site-mobile-nav] span.absolute{background:rgba(255,255,255,.08)!important}

[data-site-footer]{background:#000!important;border-top:1px solid rgba(255,255,255,.08)!important;color:#8a8a90!important}
[data-site-footer] img{filter:grayscale(1)}
[data-site-footer] h4{color:#fff!important}
[data-site-footer] p{color:#6b6b72!important}
[data-site-footer] ul a{color:#a3a3a8!important}
[data-site-footer] ul a:hover{color:#fff!important}
[data-site-footer] a.rounded-full{background:transparent!important;border:1px solid rgba(255,255,255,.18);color:#e4e4e7}
[data-site-footer] a.rounded-full:hover{border-color:#fff;color:#fff}
[data-site-footer] div[class*="border-t"]{border-color:rgba(255,255,255,.08)!important}

[data-hidden-header-link]{background:rgba(0,0,0,.7)!important;border:1px solid rgba(255,255,255,.25);color:#fff!important;box-shadow:none!important}
body:has([data-hidden-header-link]) .ob{--ob-sticky:0px}
`;

export function obsidianCss(palette: ObPalette): string {
  return themeCss(palette) + CHROME_CSS;
}

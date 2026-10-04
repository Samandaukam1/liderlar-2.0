/**
 * IVORY EDITORIAL — USLUBLAR.
 *
 * Hamma selektor `.iv` ostida, keyframe nomlari `iv-` bilan. `<style>`
 * dizayn ichida chiziladi — sahifadan chiqilganda DOM'dan ketadi.
 *
 * KO'K MONOXROM: surat ustida bitta to'q ko'k qatlam `color` rejimida
 * aralashadi — qatlamning rang tusi va suratning yorqinligi qoladi. Ulkan
 * harflarda shu fon `background-clip: text` bilan harf shakliga kesiladi.
 */

export interface IvPalette {
  ivory: string;
  paper: string;
  ink: string;
  navy: string;
  stone: string;
}

/** Qog'oz donadorligi — juda nozik, SVG shovqin. */
const PAPER_GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .32 0 0 0 0 .28 0 0 0 0 .2 0 0 0 .06 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

const themeCss = (p: IvPalette) => /* css */ `
.iv{
  --iv-ivory:${p.ivory};--iv-paper:${p.paper};--iv-ink:${p.ink};--iv-navy:${p.navy};--iv-stone:${p.stone};
  --iv-ink-2:#3a3732;--iv-rule:#d9d2c5;--iv-rule-2:#c4bcad;
  --iv-ease:cubic-bezier(.22,1,.36,1);
  --iv-gutter:clamp(1rem,4.4vw,4rem);--iv-sticky:76px;
  position:relative;isolation:isolate;overflow-x:clip;
  background:${PAPER_GRAIN} repeat,var(--iv-ivory);color:var(--iv-ink);
  font-family:var(--iv-sans),ui-sans-serif,system-ui,sans-serif;font-size:1rem;line-height:1.65;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.iv ::selection{background:var(--iv-navy);color:var(--iv-ivory)}
.iv :where(a){color:inherit;text-decoration:none}
.iv :where(button){font:inherit}
.iv :focus-visible{outline:1.5px solid var(--iv-navy);outline-offset:3px}
.iv-wrap{width:100%;max-width:1360px;margin-inline:auto;padding-inline:var(--iv-gutter)}
.iv-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.iv-kicker{margin:0 0 .9rem;font-size:.68rem;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:var(--iv-stone)}

/* KO'K MONOXROM — kesiklar va plastinkalar. Surat bo'lmasa toza ko'k gradient. */
.iv-shard,.iv-sec__plate{
  background-color:#1c4b8f;background-image:linear-gradient(160deg,#24579e,#0f2c57);
  background-size:100% 100%,cover;background-repeat:no-repeat;background-blend-mode:color,normal}

/* ===================================================== HERO — MUQOVA */
.iv-hero{position:relative}
.iv-stage{position:relative;max-width:1600px;margin:0 auto;height:clamp(640px,calc(100svh - 76px - 136px),900px)}

.iv-micro--roles{position:absolute;left:var(--iv-gutter);top:clamp(1.4rem,3.6vh,2.4rem);z-index:5;max-width:min(24%,20rem)}
.iv-micro{margin:0;padding:0 0 0 1rem;list-style:none;border-left:1px solid var(--iv-ink);
  font-size:.64rem;font-weight:600;letter-spacing:.26em;line-height:1.9;text-transform:uppercase;color:var(--iv-ink-2)}
.iv-name{margin:0;font-family:var(--iv-serif),Didot,Georgia,serif;font-weight:500;line-height:.94;letter-spacing:-.025em;color:var(--iv-ink)}
.iv-name--mobile{display:none}
/* Muqova sarlavhasi — ulkan harf qatorlari orasida, o'ngga tekis. */
.iv-name--cover{align-self:flex-end;max-width:100%;text-align:right;pointer-events:auto;
  font-size:min(clamp(2.4rem,1.3rem + 3.2vw,5.4rem),calc(100cqw / (var(--iv-n,8) * .5)),15cqh)}
.iv-name__line{display:block;overflow:hidden;padding:0 0 .1em;margin-bottom:-.06em}
.iv-name__line>span{display:block}
.iv-name__line--navy{color:var(--iv-navy)}

.iv-visual{position:absolute;inset:0;z-index:1}
/* ULKAN HARFLAR — ichida surat. O'lcham blok kengligi va balandligiga moslanadi. */
.iv-giant{position:absolute;z-index:2;right:var(--iv-gutter);top:0;bottom:19%;width:57%;container-type:size;
  display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;pointer-events:none}
/* ULKAN HARFLAR — toza: yuqori qator to'liq ko'k, pastki — ingichka kontur. */
.iv-giant__line{display:block;font-family:var(--iv-giant),Impact,sans-serif;font-weight:700;text-transform:uppercase;white-space:nowrap;
  font-size:min(calc(100cqw / (var(--iv-gn,4) * .6)),39cqh);line-height:.84;letter-spacing:-.015em;color:var(--iv-navy)}
.iv-giant__line--outline{color:transparent;-webkit-text-stroke:2px var(--iv-navy)}
.iv-shard{position:absolute;display:block;pointer-events:none}
.iv-shard--a{left:20%;top:8%;width:24%;height:84%;clip-path:polygon(44% 0,100% 0,56% 100%,0 100%)}
.iv-shard--b{right:var(--iv-gutter);bottom:0;width:34%;height:17%;clip-path:polygon(17% 0,100% 0,100% 100%,0 100%)}
.iv-shard__words{position:absolute;left:22%;bottom:1.1rem;display:grid;gap:.2rem}
.iv-shard__words i{font-style:normal;font-size:.7rem;font-weight:600;letter-spacing:.3em;text-transform:uppercase;color:var(--iv-ivory)}
.iv-cutline{position:absolute;left:17%;bottom:8%;display:block;width:46%;height:1px;background:var(--iv-ink);opacity:.3;
  transform:rotate(-7deg);transform-origin:left;pointer-events:none}

.iv-figure{position:absolute;left:40%;bottom:0;z-index:3;translate:-50% 0;height:99%;width:min(46rem,46%);container-type:size;pointer-events:none}
.iv-frame{position:absolute;left:50%;bottom:0;translate:-50% 0;width:min(100cqw,calc(100cqh * var(--iv-arn,.75)));aspect-ratio:var(--iv-ar,3/4)}
.iv-frame__mono{object-fit:contain;object-position:50% 100%;filter:grayscale(1) contrast(1.08);transition:opacity 1.2s var(--iv-ease)}
.iv-frame__mono[data-iv-hidden]{opacity:0}
.iv-frame__color{position:absolute;inset:0;overflow:hidden;opacity:0;transition:opacity 1.2s var(--iv-ease);
  -webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.iv-frame__color[data-iv-shown]{opacity:1}
.iv-frame__color img{position:absolute;max-width:none;filter:contrast(1.04) saturate(.96)}
.iv-photo{position:absolute;inset:5% 4% 0;overflow:hidden;clip-path:polygon(14% 0,100% 0,86% 100%,0 100%)}
.iv-photo img{object-fit:cover;object-position:50% 18%}
.iv-mono{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--iv-serif),serif;font-size:clamp(6rem,16vw,11rem);color:var(--iv-navy)}


.iv-notes{position:absolute;left:var(--iv-gutter);bottom:clamp(1.2rem,3.4vh,2.2rem);z-index:5;width:min(18%,17rem)}
.iv-quote{position:relative;margin:0 0 1.5rem;padding:0 0 0 3.1rem;font-family:var(--iv-serif),Georgia,serif;font-weight:400;
  font-size:clamp(1.12rem,.95rem + .6vw,1.42rem);line-height:1.36;color:var(--iv-ink);text-wrap:balance}
.iv-quote span{position:absolute;left:0;top:-.2em;font-size:3.6rem;line-height:1;color:var(--iv-rule-2)}
.iv-notes__row{display:flex;flex-direction:column;gap:1.2rem;align-items:flex-start}
.iv-notes__row .iv-social{flex-direction:row;flex-wrap:wrap}
.iv-facts{display:grid;gap:.85rem;margin:0}
.iv-facts>div{display:flex;gap:.8rem;min-width:0}
.iv-facts dt svg{width:20px;height:20px;color:var(--iv-ink)}
.iv-facts dd{min-width:0;margin:0;font-size:.84rem;line-height:1.4;color:var(--iv-ink);overflow-wrap:break-word;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.iv-facts dd small{display:block;margin-top:.1rem;font-size:.72rem;color:var(--iv-stone)}

/* IJTIMOIY TARMOQLAR — o'z brend rangida. */
.iv-social{display:flex;flex-direction:column;gap:.55rem;margin:0;padding:0;list-style:none}
.iv-brand{display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:50%;color:#fff;transition:transform .5s var(--iv-ease),filter .4s}
.iv-brand svg{width:1.2rem;height:1.2rem}
.iv-brand:hover{transform:translateY(-2px);filter:brightness(1.06)}
.iv-brand--telegram{background:#27a7e7}
.iv-brand--instagram{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)}
.iv-brand--youtube{background:#ff0000}
.iv-brand--linkedin{background:#0a66c2}
.iv-brand--facebook{background:#1877f2}
.iv-brand--x{background:#000}
.iv-brand--tiktok{background:#010101}
.iv-brand--tiktok svg{filter:drop-shadow(-1px -1px 0 #25f4ee) drop-shadow(1px 1px 0 #fe2c55)}
.iv-brand--web{background:var(--iv-ink-2)}

/* ===================================================== STATISTIKA */
.iv-stats{position:relative;z-index:6;padding-bottom:clamp(2rem,4vw,3.4rem)}
.iv-stats__bar{display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.4rem;padding:.9rem 1.1rem;border:1px solid var(--iv-rule);border-radius:14px;
  background:var(--iv-paper);box-shadow:0 24px 50px -44px rgba(20,19,18,.45)}
.iv-stats__row{flex:1 1 34rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0;padding:0;list-style:none}
.iv-stat{display:flex;align-items:center;gap:.85rem;min-width:0;padding:.7rem .9rem}
.iv-stat:nth-child(even){border-left:1px solid var(--iv-rule)}
.iv-stat:nth-child(n+3){border-top:1px solid var(--iv-rule)}
.iv-stat svg{width:1.8rem;height:1.8rem;flex:none;color:var(--iv-ink)}
.iv-stat div{min-width:0}
.iv-stat b{display:block;font-size:1.35rem;font-weight:700;line-height:1.1;letter-spacing:-.02em;color:var(--iv-ink);font-variant-numeric:tabular-nums}
.iv-stat__soft{font-size:.95rem;font-weight:500;letter-spacing:0;color:var(--iv-ink-2)}
.iv-stat span{display:block;margin-top:.2rem;font-size:.74rem;line-height:1.3;color:var(--iv-stone)}
.iv-stat em{margin-left:.45rem;font-style:normal;font-weight:700}
.iv-up{color:#2f8f4e}
.iv-down{color:#b43c3c}
.iv-stats__actions{display:flex;flex-wrap:wrap;gap:.6rem}
.iv-btn{display:inline-flex;align-items:center;gap:.55rem;height:2.95rem;padding:0 1.3rem;border-radius:6px;cursor:pointer;white-space:nowrap;
  font-size:.86rem;font-weight:600;transition:background-color .4s var(--iv-ease),border-color .4s var(--iv-ease),color .4s var(--iv-ease),transform .5s var(--iv-ease)}
.iv-btn svg{width:17px;height:17px;flex:none}
.iv-btn:hover{transform:translateY(-1px)}
.iv-btn--solid{border:1px solid var(--iv-ink);background:var(--iv-ink);color:var(--iv-ivory)}
.iv-btn--solid:hover{background:var(--iv-navy);border-color:var(--iv-navy)}
.iv-btn--line{border:1px solid rgba(20,19,18,.35);background:transparent;color:var(--iv-ink)}
.iv-btn--line:hover{border-color:var(--iv-ink);background:rgba(20,19,18,.04)}
.iv-promo{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:.8rem;margin:.9rem 0 0;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--iv-stone)}
.iv-promo button{display:inline-flex;align-items:center;gap:.4rem;padding:0;border:0;background:none;cursor:pointer;font-size:.84rem;font-weight:700;letter-spacing:.14em;color:var(--iv-ink)}
.iv-promo svg{width:13px;height:13px}
.iv-promo a{color:var(--iv-navy)}
@media (min-width:760px){
  .iv-stats__row{grid-template-columns:repeat(3,minmax(0,1fr))}
  .iv-stat:nth-child(n){border-left:0;border-top:0}
  .iv-stat:not(:nth-child(3n+1)){border-left:1px solid var(--iv-rule)}
  .iv-stat:nth-child(n+4){border-top:1px solid var(--iv-rule)}
}
@media (min-width:1180px){
  .iv-stats__row{grid-template-columns:repeat(var(--iv-cols,6),minmax(0,1fr))}
  .iv-stat:nth-child(n){border-top:0;border-left:1px solid var(--iv-rule)}
  .iv-stat:first-child{border-left:0}
}

/* ===================================================== BO'LIM */
.iv-sec{position:relative;padding-block:clamp(4rem,3rem + 5vw,8rem);scroll-margin-top:var(--iv-sticky)}
.iv-sec+.iv-sec{border-top:1px solid var(--iv-rule)}
.iv-sec__grid{display:grid;gap:1.4rem}
.iv-sec__no{display:flex;align-items:center;gap:.9rem;margin:0;font-family:var(--iv-serif),Georgia,serif;font-size:clamp(2.4rem,1.8rem + 2vw,3.8rem);
  line-height:1;color:var(--iv-navy);font-variant-numeric:lining-nums}
.iv-sec__no i{width:2.6rem;height:1px;background:var(--iv-ink);transform-origin:left}
.iv-sec__head{min-width:0;container-type:inline-size}
/* Sarlavha ustunga sig'adi: eng uzun so'z o'rtasidan bo'linmaydi. */
.iv-h2{margin:0;font-family:var(--iv-serif),Didot,Georgia,serif;font-weight:500;
  font-size:min(clamp(2.8rem,1.6rem + 4.4vw,6.2rem),calc(100cqi / (var(--iv-n,8) * .52)));overflow-wrap:normal;hyphens:none;
  line-height:.95;letter-spacing:-.03em;color:var(--iv-ink);text-wrap:balance}
.iv-sec__meta{margin:1.1rem 0 0;font-size:.7rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--iv-stone)}
.iv-sec__body{min-width:0}
.iv-sec__plate{display:none}
@media (min-width:1000px){
  .iv-sec__grid{grid-template-columns:7.5rem minmax(0,4fr) minmax(0,7fr);column-gap:clamp(2rem,4vw,4rem);align-items:start}
  .iv-sec__no{flex-direction:column;align-items:flex-start;gap:1rem}
  .iv-sec__no i{width:1px;height:3rem;transform-origin:top}
  .iv-sec__head{position:sticky;top:calc(var(--iv-sticky) + 2rem)}
  .iv-sec--image .iv-sec__grid{grid-template-columns:7.5rem minmax(0,4fr) minmax(0,6fr) minmax(0,2.6fr)}
  .iv-sec__plate{display:block;position:sticky;top:calc(var(--iv-sticky) + 2rem);aspect-ratio:3/4;clip-path:polygon(28% 0,100% 0,100% 100%,0 100%)}
  .iv-sec--wide .iv-sec__grid{grid-template-columns:7.5rem minmax(0,1fr)}
  .iv-sec--wide .iv-sec__head{position:static}
  .iv-sec--wide .iv-sec__body{grid-column:1/-1;margin-top:2rem}
}

/* BIOGRAFIYA */
.iv-story{color:var(--iv-ink-2)}
.iv-lead{margin:0 0 2.2rem;font-family:var(--iv-serif),Georgia,serif;font-size:clamp(1.25rem,1.05rem + .8vw,1.7rem);line-height:1.48;letter-spacing:-.01em;color:var(--iv-ink);text-wrap:pretty}
.iv-lead::first-letter{float:left;margin:.06em .12em 0 0;font-size:3.7em;line-height:.8;font-weight:600;color:var(--iv-navy)}
.iv-story__cols{font-size:1rem;line-height:1.82}
.iv-story__cols p{margin:0 0 1em;text-wrap:pretty;overflow-wrap:break-word}
.iv-story__part+.iv-story__part{margin-top:2rem}
.iv-story h3{margin:0 0 .8rem;font-family:var(--iv-serif),Georgia,serif;font-size:1.4rem;font-weight:600;line-height:1.25;letter-spacing:-.01em;color:var(--iv-ink);break-after:avoid}
.iv-story h3 small{display:block;margin-bottom:.4rem;font-family:var(--iv-sans),sans-serif;font-size:.66rem;font-weight:700;letter-spacing:.24em;color:var(--iv-navy)}
@media (min-width:1300px){
  .iv-sec:not(.iv-sec--image) .iv-story__cols{column-count:2;column-gap:2.6rem;column-rule:1px solid var(--iv-rule)}
}

/* QATORLAR */
.iv-rows{margin:0;padding:0;list-style:none;border-top:1px solid var(--iv-ink)}
.iv-row{display:grid;gap:.4rem;padding:1.5rem 0;border-bottom:1px solid var(--iv-rule);transition:background-color .5s var(--iv-ease)}
.iv-row:hover{background:rgba(22,61,115,.03)}
.iv-row__when{margin:0;font-family:var(--iv-serif),Georgia,serif;font-style:italic;font-size:1.2rem;color:var(--iv-navy)}
.iv-row__main{min-width:0}
.iv-row__main b{display:block;font-family:var(--iv-serif),Georgia,serif;font-size:1.4rem;font-weight:600;line-height:1.25;letter-spacing:-.01em;color:var(--iv-ink)}
.iv-row__main span{display:block;margin-top:.3rem;font-size:.92rem;color:var(--iv-stone)}
.iv-row__main p{margin:.6rem 0 0;font-size:.95rem;line-height:1.7;color:var(--iv-ink-2);white-space:pre-line}
.iv-row__main .iv-go{margin-top:.7rem}
.iv-row__tag{margin:0;font-size:.64rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--iv-stone);white-space:nowrap}
.iv-row__tag--ok{color:var(--iv-navy)}
.iv-row__tag--ok::before{content:"";display:inline-block;width:6px;height:6px;margin-right:.5rem;border-radius:50%;background:var(--iv-navy);vertical-align:.12em}
.iv-row--compact{padding:1.1rem 0}
@media (min-width:700px){
  .iv-row{grid-template-columns:10.5rem minmax(0,1fr) auto;gap:2rem;align-items:baseline}
  .iv-row--compact{grid-template-columns:minmax(0,1fr)}
}

/* YUTUQLAR */
.iv-honours{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr));gap:2.6rem 2rem;margin:0;padding:0;list-style:none}
.iv-honour{padding-top:1.1rem;border-top:1px solid var(--iv-ink)}
.iv-honour__no{display:block;font-family:var(--iv-serif),Georgia,serif;font-size:clamp(3rem,2.2rem + 2.6vw,5rem);line-height:.9;color:var(--iv-navy);
  transition:transform .6s var(--iv-ease)}
.iv-honour:hover .iv-honour__no{transform:translateX(.3rem)}
.iv-honour__main{min-width:0}
.iv-honour__year{margin:.9rem 0 .3rem;font-size:.66rem;font-weight:700;letter-spacing:.24em;color:var(--iv-stone)}
.iv-honour__main b{display:block;margin-top:.5rem;font-family:var(--iv-serif),Georgia,serif;font-size:1.35rem;font-weight:600;line-height:1.25;color:var(--iv-ink)}
.iv-honour__main span{display:block;margin-top:.3rem;font-size:.9rem;color:var(--iv-stone)}
.iv-honour__main p{margin:.6rem 0 0;font-size:.93rem;line-height:1.7;color:var(--iv-ink-2);white-space:pre-line}
.iv-honour__main .iv-go{margin-top:.8rem}
.iv-go{display:inline-flex;align-items:center;gap:.4rem;font-size:.8rem;font-weight:700;color:var(--iv-navy)}
.iv-go svg{width:11px;height:11px;transition:transform .5s var(--iv-ease)}
.iv-go:hover svg{transform:translate(2px,-2px)}

/* MAQOLALAR — assimetrik */
.iv-press{display:grid;gap:2.4rem 1.6rem;margin:0;padding:0;list-style:none}
.iv-press__item{display:block}
.iv-press__shot{position:relative;display:block;aspect-ratio:16/10;overflow:hidden;background:#d9d3c6}
.iv-press__shot::after{content:"";position:absolute;inset:0;background:#1c4b8f;mix-blend-mode:color;transition:opacity .8s var(--iv-ease)}
.iv-press__shot img{object-fit:cover;transition:transform 1.4s var(--iv-ease)}
.iv-press__item:hover .iv-press__shot::after{opacity:0}
.iv-press__item:hover .iv-press__shot img{transform:scale(1.04)}
.iv-press__meta{display:block;margin-top:1rem;font-size:.66rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--iv-stone)}
.iv-press__item b{display:block;margin-top:.45rem;font-family:var(--iv-serif),Georgia,serif;font-size:1.45rem;font-weight:600;line-height:1.22;letter-spacing:-.01em;color:var(--iv-ink)}
@media (min-width:900px){
  .iv-press{grid-template-columns:repeat(12,minmax(0,1fr))}
  .iv-press li{grid-column:span 4}
  .iv-press li:first-child{grid-column:span 7;grid-row:span 2}
  .iv-press li:first-child .iv-press__shot{aspect-ratio:4/3}
  .iv-press li:first-child b{font-size:2.2rem}
  .iv-press li:nth-child(2),.iv-press li:nth-child(3){grid-column:span 5}
}

/* KITOBLAR */
.iv-library{display:grid;gap:2.8rem}
.iv-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.4rem,1fr));gap:1.6rem 1.2rem;margin:0;padding:0;list-style:none}
.iv-book{display:block}
.iv-book__cover{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;background:#e6e0d4;box-shadow:0 18px 30px -20px rgba(20,19,18,.5)}
.iv-book__cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--iv-ease)}
.iv-book:hover .iv-book__cover img{transform:scale(1.04)}
.iv-book__blank{position:absolute;inset:0;display:grid;place-items:center;padding:.8rem;text-align:center;font-family:var(--iv-serif),serif;font-size:.95rem;color:var(--iv-navy)}
.iv-book b{display:block;margin-top:.7rem;font-size:.86rem;font-weight:700;line-height:1.35;color:var(--iv-ink)}
.iv-book span{display:block;font-size:.78rem;color:var(--iv-stone)}

/* GALEREYA — ko'k monoxrom, ustiga kelganda tabiiy rang */
.iv-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.6rem,1.4vw,1.2rem);margin:0;padding:0;list-style:none}
.iv-gallery li{min-width:0}
.iv-gallery li:first-child{grid-column:1/-1}
.iv-shot{position:relative;height:clamp(12rem,52vw,22rem);margin:0;overflow:hidden;background:#d9d3c6}
.iv-shot::after{content:"";position:absolute;inset:0;background:#1c4b8f;mix-blend-mode:color;pointer-events:none;transition:opacity .8s var(--iv-ease)}
.iv-shot img{object-fit:cover;object-position:50% 25%;transition:transform 1.4s var(--iv-ease)}
.iv-shot:hover::after{opacity:0}
.iv-shot:hover img{transform:scale(1.03)}
.iv-shot figcaption{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:2rem 1rem .9rem;font-size:.78rem;line-height:1.4;color:#fff;
  background:linear-gradient(180deg,transparent,rgba(15,30,55,.82));opacity:0;transition:opacity .5s var(--iv-ease)}
.iv-shot:hover figcaption{opacity:1}
@media (min-width:900px){
  .iv-gallery{grid-template-columns:repeat(12,minmax(0,1fr))}
  .iv-gallery li,.iv-gallery li:first-child{grid-column:span 5}
  .iv-gallery li:nth-child(4n+1),.iv-gallery li:nth-child(4n+4){grid-column:span 7}
  .iv-gallery--1 li:first-child{grid-column:3/span 8}
  .iv-shot{height:clamp(16rem,30vw,30rem)}
  .iv-gallery li:nth-child(4n+2) .iv-shot,.iv-gallery li:nth-child(4n+3) .iv-shot{margin-top:clamp(2rem,5vw,5rem)}
}

/* IQTIBOSLAR */
.iv-sayings{margin:0;padding:0;list-style:none;border-top:1px solid var(--iv-ink)}
.iv-sayings li{padding:1.6rem 0;border-bottom:1px solid var(--iv-rule);font-family:var(--iv-serif),Georgia,serif;font-style:italic;
  font-size:clamp(1.4rem,1.1rem + 1vw,2rem);line-height:1.3;color:var(--iv-navy);text-wrap:balance}
.iv-interlude{background:var(--iv-navy);color:var(--iv-ivory);padding-block:clamp(4.5rem,3rem + 6vw,9rem);text-align:center}
.iv-interlude figure{margin:0}
.iv-interlude blockquote{max-width:58rem;margin:0 auto;font-family:var(--iv-serif),Georgia,serif;font-style:italic;font-weight:400;
  font-size:clamp(2rem,1.3rem + 3vw,4.4rem);line-height:1.12;letter-spacing:-.015em;text-wrap:balance}
.iv-interlude figcaption{margin-top:2rem;font-size:.7rem;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:#b9c4d6}

/* ===================================================== YAKUN */
.iv-outro{border-top:1px solid var(--iv-ink);padding:clamp(3rem,6vw,5.5rem) 0 clamp(7rem,6rem + 3vw,8rem)}
.iv-outro__name{margin:0;font-family:var(--iv-serif),Georgia,serif;font-size:clamp(2rem,1.4rem + 2.6vw,4rem);font-weight:500;line-height:1.05;letter-spacing:-.02em;color:var(--iv-ink);text-wrap:balance}
.iv-outro__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.4rem;margin-top:2rem;padding-top:1.4rem;border-top:1px solid var(--iv-rule)}
.iv-outro .iv-social{flex-direction:row}
@media (min-width:1024px){.iv-outro{padding-bottom:clamp(4rem,3rem + 2vw,5rem)}}

/* ===================================================== TELEFON */
@media (max-width:899.98px){
  .iv-stage{height:auto;display:flex;flex-direction:column;padding:1.3rem var(--iv-gutter) 1.6rem}
  .iv-stage{container-type:inline-size}
  .iv-micro--roles{position:relative;inset:auto;max-width:none}
  .iv-name--mobile{display:block;margin-top:1rem;font-size:min(4.6rem,calc(100cqi / (var(--iv-n,8) * .5)))}
  .iv-name--cover{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .iv-visual{position:relative;inset:auto;height:clamp(420px,120vw,560px);margin:1.2rem calc(var(--iv-gutter) * -1) 0}
  .iv-giant{right:var(--iv-gutter);top:0;bottom:26%;width:74%}
  .iv-shard--a{left:0;top:16%;width:40%;height:82%}
  .iv-shard--b{right:0;width:58%;height:20%}
  .iv-shard__words{left:26%;bottom:.9rem}
  .iv-shard__words i{font-size:.6rem;letter-spacing:.24em}
  .iv-figure{left:36%;width:76%;height:100%}
  .iv-notes{position:relative;inset:auto;width:100%;margin-top:1.6rem}
  .iv-quote{font-size:1.25rem}
  .iv-notes__row{flex-direction:column;gap:1.3rem}
  .iv-social{flex-direction:row;flex-wrap:wrap}
  .iv-stats__actions{width:100%}
  .iv-stats__actions .iv-btn{flex:1;justify-content:center}
  .iv-promo{justify-content:flex-start}
}

/* ===================================================== HARAKAT */
@keyframes iv-rise{from{transform:translateY(105%)}}
@keyframes iv-mask{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(-10% 0 -10% 0)}}
@keyframes iv-slide{from{opacity:0;transform:translateY(-3%)}}
@keyframes iv-portrait{from{opacity:0;transform:translateY(3%)}}
@keyframes iv-line{from{transform:scale(0)}}
@keyframes iv-fade{from{opacity:0}}
@keyframes iv-up{from{opacity:0;transform:translateY(14px)}}
@keyframes iv-crop{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0)}}
@keyframes iv-failsafe{to{opacity:1;transform:none}}

@media (prefers-reduced-motion:no-preference){
  /* Ism → ulkan harflar → kesiklar → portret → chiziqlar → izohlar. */
  .iv-name__line>span{animation:iv-rise 1.2s var(--iv-ease) backwards;animation-delay:.1s}
  .iv-name__line:nth-child(2)>span{animation-delay:.22s}
  .iv-giant__line{animation:iv-mask 1.4s var(--iv-ease) .3s backwards}
  .iv-giant__line+.iv-giant__line{animation-delay:.45s}
  .iv-shard{animation:iv-slide 1.4s var(--iv-ease) .5s backwards}
  .iv-figure{animation:iv-portrait 1.6s var(--iv-ease) .65s backwards}
  .iv-cutline{animation:iv-line 1.6s var(--iv-ease) 1.1s backwards}
  .iv-micro{animation:iv-fade 1.2s var(--iv-ease) 1s backwards}
  .iv-notes{animation:iv-up 1.1s var(--iv-ease) 1.2s backwards}
  .iv-stats__bar{animation:iv-up 1s var(--iv-ease) 1.3s backwards}
}
@media (prefers-reduced-motion:no-preference) and (scripting:enabled){
  .iv [data-iv-reveal]{opacity:0;transform:translateY(26px);transition:opacity 1.1s var(--iv-ease),transform 1.2s var(--iv-ease)}
  .iv [data-iv-reveal][data-iv-in]{opacity:1;transform:none}
  .iv [data-iv-reveal] .iv-sec__no i{transform:scale(0);transition:transform 1.4s var(--iv-ease) .3s}
  .iv [data-iv-reveal][data-iv-in] .iv-sec__no i{transform:none}
  .iv [data-iv-in] :is(.iv-press__shot,.iv-shot){animation:iv-crop 1.4s var(--iv-ease) .2s backwards}
  .iv:not([data-iv-ready]) [data-iv-reveal]{animation:iv-failsafe 1s var(--iv-ease) 3s forwards}
}
@media (prefers-reduced-motion:reduce){
  .iv *,.iv *::before,.iv *::after{animation-duration:.01ms!important;animation-delay:0s!important;
    animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;

/*
 * SAYT QOBIG'I — faqat shu dizayn ochiq turganda suyak/ko'k/qora jurnal
 * uslubiga o'tadi. `display` ga tegilmaydi, ya'ni "Headerni berkitish"
 * ishlayveradi.
 */
const CHROME_CSS = /* css */ `
html body{background-color:#f2eee5!important}
[data-site-header]{background:rgba(242,238,229,.9)!important;border-bottom-color:#d9d2c5!important;
  -webkit-backdrop-filter:blur(14px)!important;backdrop-filter:blur(14px)!important;box-shadow:none!important}
[data-site-header] nav[aria-label]{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
[data-site-header] nav[aria-label]>a,[data-site-header] nav[aria-label] button{color:#3a3732!important}
[data-site-header] nav[aria-label]>a:hover,[data-site-header] nav[aria-label] button:hover{color:#141312!important}
[data-site-header] nav[aria-label]>a.text-white{color:#f2eee5!important}
[data-site-header] nav[aria-label] .bg-gradient-blue{background:#141312!important;box-shadow:none!important}
[data-site-header] nav[aria-label] button.text-electric-blue,[data-site-header] nav[aria-label] button[aria-expanded="true"]{background:rgba(20,19,18,.06)!important;color:#141312!important}
[data-site-header] [role="menu"]{background:#fbf9f4!important;border-color:#d9d2c5!important;box-shadow:0 30px 60px -30px rgba(20,19,18,.35)!important}
[data-site-header] [role="menu"] p{color:#8a857b!important}
[data-site-header] [role="menu"] a{color:#3a3732!important}
[data-site-header] [role="menu"] a:hover{background:rgba(22,61,115,.05)!important}
[data-site-header] [role="menu"] a>span:first-child{background:rgba(22,61,115,.08)!important;color:#163d73!important}
[data-site-header] [role="menu"] a:hover>span:first-child{background:#163d73!important;color:#f2eee5!important}
[data-site-header] [role="menu"] a>span:last-child>span:first-child{color:#141312!important}
[data-site-header] [role="menu"] a>span:last-child>span:last-child{color:#8a857b!important}
[data-site-header] a[aria-label="Qidiruv"],[data-site-header] a[aria-label="Jaxongir AI"]{background:transparent!important;border:1px solid #d9d2c5!important;color:#141312!important}
[data-site-header] a[aria-label="Qidiruv"]:hover,[data-site-header] a[aria-label="Jaxongir AI"]:hover{border-color:#141312!important}
[data-site-header] a.bg-transparent{color:#141312!important}
[data-site-header] a.bg-transparent svg{color:#163d73!important}
[data-site-header] a.bg-paper{background:transparent!important;border-color:rgba(20,19,18,.3)!important;color:#141312!important;box-shadow:none!important}
[data-site-header] a.bg-paper:hover{border-color:#141312!important}
[data-site-header] a.bg-gradient-blue{background:#141312!important;color:#f2eee5!important;box-shadow:none!important}

[data-site-mobile-nav]{background:rgba(251,249,244,.94)!important;border-color:#d9d2c5!important;box-shadow:0 18px 40px -20px rgba(20,19,18,.4)!important}
[data-site-mobile-nav] a,[data-site-mobile-nav] button{color:#8a857b!important}
[data-site-mobile-nav] .text-electric-blue{color:#141312!important}
[data-site-mobile-nav] .bg-gradient-blue{background:#141312!important;color:#f2eee5!important;box-shadow:none!important}
[data-site-mobile-nav] span.absolute{background:rgba(20,19,18,.06)!important}

[data-site-footer]{background:#10284a!important;border-top:0!important;color:#b9c4d6!important}
[data-site-footer] h4{color:#f2eee5!important}
[data-site-footer] p{color:#93a1b8!important}
[data-site-footer] ul a{color:#cdd5e2!important}
[data-site-footer] ul a:hover{color:#fff!important}
[data-site-footer] a.rounded-full{background:transparent!important;border:1px solid rgba(242,238,229,.25);color:#f2eee5}
[data-site-footer] a.rounded-full:hover{border-color:#f2eee5}
[data-site-footer] div[class*="border-t"]{border-color:rgba(242,238,229,.14)!important}

[data-hidden-header-link]{background:#141312!important;color:#f2eee5!important;box-shadow:none!important}
body:has([data-hidden-header-link]) .iv{--iv-sticky:0px}
`;

export function ivoryEditorialCss(palette: IvPalette): string {
  return themeCss(palette) + CHROME_CSS;
}

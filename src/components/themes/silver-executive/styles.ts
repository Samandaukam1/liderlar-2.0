/**
 * SILVER EXECUTIVE — USLUBLAR.
 *
 * Hamma selektor `.se` ostida, keyframe nomlari `se-` bilan. `<style>`
 * dizayn ichida chiziladi — sahifadan chiqilganda DOM'dan ketadi.
 * Sayt headeri/footeri faqat shu dizayn ochiq turganda `data-site-*`
 * belgilari orqali moslanadi; `display` ga tegilmaydi ("Headerni
 * berkitish" ishlayveradi).
 */

export interface SePalette {
  page: string;
  navy: string;
  blue: string;
  electric: string;
}

const themeCss = (p: SePalette) => /* css */ `
.se{
  --se-page:${p.page};--se-card:#ffffff;--se-glass:rgba(255,255,255,.72);
  --se-navy:${p.navy};--se-ink:#33435f;--se-muted:#71809a;--se-faint:#a3afc2;
  --se-line:#e2e8f2;--se-line-2:#d3dcea;--se-silver:#c9d4e4;
  --se-blue:${p.blue};--se-electric:${p.electric};--se-blue-soft:rgba(37,99,235,.08);
  --se-edge:#f4f6fa;
  /* Ikonka idishi — HAMMASI BIR XIL qirollik ko'ki (kamalak ranglar yo'q). */
  --se-icon-a:#2563eb;--se-icon-b:#1d4ed8;
  --se-ease:cubic-bezier(.22,1,.36,1);
  --se-shadow:0 1px 2px rgba(11,31,68,.04),0 10px 30px -12px rgba(11,31,68,.12);
  --se-shadow-hover:0 2px 4px rgba(11,31,68,.05),0 22px 44px -16px rgba(29,78,216,.25);
  --se-gutter:clamp(1rem,4vw,2.5rem);
  position:relative;overflow-x:clip;background:var(--se-page);color:var(--se-navy);
  font-family:var(--se-sans),ui-sans-serif,system-ui,sans-serif;font-size:1rem;line-height:1.65;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.se a{color:inherit;text-decoration:none}
.se :focus-visible{outline:2px solid var(--se-electric);outline-offset:3px;border-radius:6px}
.se-wrap{width:100%;max-width:1240px;margin-inline:auto;padding-inline:var(--se-gutter)}
.se-icon{width:20px;height:20px;flex:none;stroke-width:2.2}
/* ---------------------------------------------------------- HERO */
.se-hero{position:relative;isolation:isolate;overflow:hidden;
  background:linear-gradient(180deg,var(--se-edge) 0%,var(--se-edge) 46%,var(--se-page) 100%);transition:background-color .8s var(--se-ease)}
.se-hero__deco{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
.se-shard{position:absolute;border:1px solid rgba(255,255,255,.75);
  background:linear-gradient(135deg,rgba(255,255,255,.75),rgba(214,226,246,.35));backdrop-filter:blur(2px)}
.se-shard--1{right:-6%;top:-18%;width:46%;height:120%;transform:skewX(-24deg);opacity:.7}
.se-shard--2{right:10%;top:-30%;width:16%;height:90%;transform:skewX(-24deg);
  background:linear-gradient(180deg,rgba(37,99,235,.08),rgba(37,99,235,0));border-color:rgba(37,99,235,.12)}
.se-beam{position:absolute;height:1px;width:42%;right:-4%;transform:rotate(-24deg);transform-origin:right;
  background:linear-gradient(90deg,transparent,rgba(37,99,235,.55),transparent)}
.se-beam--1{top:30%}
.se-beam--2{top:64%;width:30%;opacity:.6}
.se-hero__grid{position:relative;display:flex;flex-direction:column}
.se-figure{position:relative;height:clamp(340px,56svh,480px);margin-inline:calc(var(--se-gutter) * -1)}
.se-portrait{position:absolute;inset:0}
.se-portrait img{object-fit:cover;object-position:50% 12%;
  -webkit-mask-image:linear-gradient(180deg,#000 62%,transparent 98%);mask-image:linear-gradient(180deg,#000 62%,transparent 98%)}
.se-figure--initials{display:flex;align-items:center;justify-content:center}
.se-initials{font-size:clamp(5rem,22vw,9rem);font-weight:800;letter-spacing:-.04em;color:rgba(11,31,68,.08)}
.se-copy{position:relative;z-index:2;margin-top:-2.75rem;padding-bottom:2.25rem}
.se-badge{display:inline-flex;align-items:center;gap:.45rem;height:1.6rem;padding:0 .7rem;border-radius:999px;
  background:var(--se-blue-soft);border:1px solid rgba(37,99,235,.18);color:var(--se-blue);
  font-size:.66rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.se-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.se-name{margin-top:.9rem;font-size:clamp(2.1rem,1.35rem + 3.3vw,3.65rem);line-height:1.04;letter-spacing:-.035em;color:var(--se-navy);overflow-wrap:break-word}
.se-name b{display:block;font-weight:800}
.se-name span{display:block;font-weight:300;letter-spacing:-.025em}
.se-role{margin-top:.9rem;font-size:clamp(.98rem,.92rem + .3vw,1.12rem);font-weight:500;line-height:1.5;color:var(--se-ink)}
.se-role i{font-style:normal;color:var(--se-silver);margin:0 .5rem}
.se-meta{display:grid;gap:.85rem;margin-top:1.4rem}
.se-meta li{display:flex;align-items:center;gap:.7rem;min-width:0}
.se .se-meta__icon{display:grid;place-items:center;width:2.5rem;height:2.5rem;flex:none;border-radius:13px;color:#fff;
  background:linear-gradient(140deg,var(--se-icon-a),var(--se-icon-b));
  box-shadow:0 6px 16px -7px var(--se-icon-a),inset 0 1px 0 rgba(255,255,255,.3)}
.se .se-meta__icon .se-icon{width:18px;height:18px;color:#fff;stroke:#fff}
.se-meta b{display:block;font-size:.88rem;font-weight:600;line-height:1.35;color:var(--se-navy)}
.se-meta small{display:block;font-size:.75rem;font-weight:500;color:var(--se-muted)}
.se-quote{position:relative;margin-top:1.5rem;padding-left:2.4rem;font-size:clamp(1rem,.95rem + .25vw,1.12rem);line-height:1.55;font-weight:500;color:var(--se-ink)}
.se-quote::before{content:"\\201C";position:absolute;left:0;top:-.55rem;font-size:3rem;font-weight:800;line-height:1;color:var(--se-blue)}
.se-actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.6rem}
.se-btn{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;min-height:3rem;padding:0 1.35rem;border-radius:12px;
  font-size:.88rem;font-weight:600;cursor:pointer;border:1px solid transparent;
  transition:transform .35s var(--se-ease),box-shadow .35s var(--se-ease),background-color .35s var(--se-ease),border-color .35s var(--se-ease)}
.se-btn svg{width:18px;height:18px}
.se .se-btn--primary svg{color:#fff;stroke:#fff}
.se .se-btn--primary{background:linear-gradient(135deg,var(--se-blue),var(--se-electric));color:#fff;box-shadow:0 10px 24px -10px rgba(29,78,216,.6)}
.se .se-btn--primary:hover{transform:translateY(-2px);box-shadow:0 16px 30px -12px rgba(29,78,216,.7);filter:saturate(1.08)}
.se .se-btn--ghost{background:var(--se-glass);border-color:var(--se-line-2);color:var(--se-navy);backdrop-filter:blur(8px)}
.se .se-btn--ghost:hover{transform:translateY(-2px);border-color:rgba(37,99,235,.4);box-shadow:var(--se-shadow)}

@media (min-width:640px){
  .se-meta{display:flex;flex-wrap:wrap;gap:1rem 2.25rem}
  .se-figure{height:clamp(420px,58svh,560px)}
}
@media (min-width:1024px){
  .se-hero{background:linear-gradient(90deg,var(--se-edge) 0%,var(--se-edge) 30%,var(--se-page) 62%)}
  .se-hero__grid{position:static;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);align-items:center;min-height:clamp(560px,calc(100svh - 76px - 7rem),700px)}
  .se-figure{position:absolute;left:0;top:0;bottom:0;width:min(48vw,820px);height:auto;margin:0}
  .se-portrait img{object-position:50% 8%;
    -webkit-mask-image:linear-gradient(90deg,#000 60%,transparent 99%),linear-gradient(180deg,#000 72%,transparent 100%);
    mask-image:linear-gradient(90deg,#000 60%,transparent 99%),linear-gradient(180deg,#000 72%,transparent 100%);
    -webkit-mask-composite:source-in;mask-composite:intersect}
  .se-copy{grid-column:2;margin:0;padding:4rem 0 7.5rem}
}

/* ---------------------------------------------------------- STATS */
.se-stats{position:relative;z-index:3;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;overflow:hidden;
  border-radius:18px;background:var(--se-line);border:1px solid var(--se-line);box-shadow:var(--se-shadow)}
.se-stat{display:flex;align-items:center;gap:.8rem;min-width:0;padding:1rem;background:rgba(255,255,255,.92);
  transition:background-color .45s var(--se-ease)}
.se-stat:hover{background:#fff}
.se-stat>div{min-width:0}
.se-stat:last-child:nth-child(odd){grid-column:1/-1}
.se .se-stat__icon{display:grid;place-items:center;width:3rem;height:3rem;flex:none;border-radius:15px;color:#fff;
  background:linear-gradient(140deg,var(--se-icon-a),var(--se-icon-b));
  box-shadow:0 8px 20px -8px var(--se-icon-a),inset 0 1px 0 rgba(255,255,255,.32);
  transition:transform .5s var(--se-ease),box-shadow .5s var(--se-ease)}
.se .se-stat__icon .se-icon{width:22px;height:22px;color:#fff;stroke:#fff}
.se .se-stat:hover .se-stat__icon{transform:translateY(-2px) scale(1.04);box-shadow:0 12px 24px -8px var(--se-icon-a),inset 0 1px 0 rgba(255,255,255,.32)}
.se-stat b{display:flex;align-items:baseline;flex-wrap:wrap;gap:.1rem .35rem;min-width:0;font-size:clamp(1.15rem,1rem + .6vw,1.5rem);font-weight:800;line-height:1.15;letter-spacing:-.02em;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.se .se-stat b small{font-size:.72rem;font-weight:700;color:#16a34a}
.se .se-stat b small.down{color:#dc2626}
.se-stat span{display:block;margin-top:.15rem;font-size:.74rem;font-weight:500;color:var(--se-muted);line-height:1.3}
.se .se-stat i{font-style:italic;font-weight:600;font-size:.86rem;line-height:1.3;letter-spacing:0;color:var(--se-ink)}
@media (min-width:768px){.se-stats{grid-template-columns:repeat(min(var(--se-cols,3),3),minmax(0,1fr))}.se-stat{padding:1.25rem 1.4rem}
  .se-stat:last-child:nth-child(odd){grid-column:auto}}
@media (min-width:1200px){.se-stats{grid-template-columns:repeat(var(--se-cols,3),minmax(0,1fr))}}
@media (min-width:1024px){.se-stats{margin-top:-4.5rem}}

/* ---------------------------------------------------------- LAYOUT */
.se-body{display:grid;gap:1.5rem;padding-block:2rem 4.5rem}
.se-nav{position:sticky;top:64px;z-index:20;margin-inline:calc(var(--se-gutter) * -1);padding:.6rem var(--se-gutter);
  background:rgba(243,246,251,.88);backdrop-filter:blur(14px);border-bottom:1px solid var(--se-line)}
.se-nav ul{display:flex;gap:.4rem;overflow-x:auto;scrollbar-width:none}
.se-nav ul::-webkit-scrollbar{display:none}
.se-nav a{display:flex;align-items:center;min-height:2.5rem;padding:0 1rem;border-radius:10px;white-space:nowrap;
  font-size:.84rem;font-weight:600;color:var(--se-ink);transition:background-color .35s var(--se-ease),color .35s var(--se-ease),box-shadow .35s var(--se-ease)}
.se-nav a:hover{background:rgba(255,255,255,.9);color:var(--se-navy)}
.se-nav a[aria-current="true"]{background:linear-gradient(135deg,var(--se-blue),var(--se-electric));color:#fff;box-shadow:0 8px 18px -10px rgba(29,78,216,.7)}
body:has([data-hidden-header-link]) .se-nav{top:0;padding-left:calc(var(--se-gutter) + 8.5rem)}
.se-main{display:grid;gap:1.5rem;min-width:0}
@media (min-width:1024px){
  .se-body{grid-template-columns:13.5rem minmax(0,1fr) 19rem;align-items:start;gap:1.75rem;padding-top:2.5rem}
  .se-body>.se-nav{grid-column:1;grid-row:1}
  .se-body>.se-main{grid-column:2;grid-row:1}
  .se-body>.se-aside{grid-column:3;grid-row:1}
  .se-body--solo{grid-template-columns:minmax(0,1fr) 20rem}
  .se-body--solo>.se-main{grid-column:1}
  .se-body--solo>.se-aside{grid-column:2}
  .se-nav{position:sticky;top:88px;margin:0;padding:.6rem;border-radius:18px;border:1px solid var(--se-line);background:var(--se-glass);box-shadow:var(--se-shadow)}
  .se-nav ul{flex-direction:column;overflow:visible;gap:.15rem}
  .se-nav a{min-height:2.6rem}
  body:has([data-hidden-header-link]) .se-nav{top:24px;padding-left:.6rem}
  .se-body>.se-aside{position:sticky;top:88px}
}

/* ---------------------------------------------------------- CARDS */
.se-card{position:relative;padding:clamp(1.25rem,1rem + 1.2vw,2rem);border-radius:18px;background:var(--se-card);border:1px solid var(--se-line);box-shadow:var(--se-shadow);scroll-margin-top:140px}
@media (min-width:1024px){.se-card{scroll-margin-top:96px}}
.se-h2{display:flex;align-items:center;justify-content:space-between;gap:1rem;font-size:clamp(1.3rem,1.15rem + .6vw,1.6rem);font-weight:800;letter-spacing:-.025em;color:var(--se-navy)}

.se-h2-rule{display:block;width:2.5rem;height:3px;margin:.7rem 0 1.4rem;border-radius:3px;transform-origin:left;
  background:linear-gradient(90deg,var(--se-blue),var(--se-electric))}
.se-note{font-size:.75rem;font-weight:600;color:var(--se-muted)}
.se-prose{font-size:clamp(.96rem,.93rem + .15vw,1.02rem);line-height:1.8;color:var(--se-ink);overflow-wrap:break-word}
.se-prose p+p{margin-top:1em}
.se-part+.se-part{margin-top:1.75rem;padding-top:1.75rem;border-top:1px solid var(--se-line)}
.se-part h3{font-size:1.08rem;font-weight:700;letter-spacing:-.01em;color:var(--se-navy);margin-bottom:.5rem}
.se .se-part h3 small{margin-right:.6rem;font-size:.75rem;font-weight:700;color:var(--se-blue);font-variant-numeric:tabular-nums}
.se-lead{font-size:clamp(1.04rem,.98rem + .3vw,1.16rem);font-weight:500;color:var(--se-navy)}
.se-pull{margin:1.5rem 0 0;padding:1.25rem 1.4rem 1.25rem 3.2rem;position:relative;border-radius:14px;background:linear-gradient(135deg,#f5f8fe,#eef3fc);
  border:1px solid var(--se-line);font-size:1.02rem;font-weight:500;line-height:1.55;color:var(--se-navy)}
.se-pull::before{content:"\\201C";position:absolute;left:1rem;top:.6rem;font-size:2.6rem;font-weight:800;line-height:1;color:var(--se-blue)}

/* timeline */
.se-cols{display:grid;gap:1.75rem}
@media (min-width:768px){.se-cols--two{grid-template-columns:repeat(2,minmax(0,1fr))}}
.se-sub{display:flex;align-items:center;gap:.6rem;margin-bottom:1rem;font-size:.72rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--se-blue)}
.se-steps{position:relative;display:grid;gap:1.1rem}
.se-step{position:relative;padding-left:1.5rem}
.se-step::before{content:"";position:absolute;left:0;top:.45rem;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid var(--se-blue)}
.se-step::after{content:"";position:absolute;left:4px;top:1.2rem;bottom:-1.1rem;width:1px;background:var(--se-line-2)}
.se-step:last-child::after{display:none}
.se .se-when{font-size:.74rem;font-weight:700;color:var(--se-blue);font-variant-numeric:tabular-nums}
.se-step b{display:block;margin-top:.1rem;font-size:.98rem;font-weight:700;color:var(--se-navy)}
.se-step span{display:block;font-size:.86rem;color:var(--se-muted)}
.se-step p{margin-top:.35rem;font-size:.9rem;line-height:1.65;color:var(--se-ink);white-space:pre-line}

/* rows */
.se-rows{display:grid;gap:.6rem}
.se-row{display:flex;align-items:flex-start;gap:.9rem;padding:1rem;border-radius:14px;border:1px solid var(--se-line);background:#fbfcfe;
  transition:transform .4s var(--se-ease),box-shadow .4s var(--se-ease),border-color .4s var(--se-ease)}
.se-row:hover{transform:translateY(-2px);border-color:rgba(37,99,235,.28);box-shadow:var(--se-shadow-hover)}
.se .se-row__icon svg{color:#fff;stroke:#fff}
.se .se-row__icon{display:grid;place-items:center;width:2.7rem;height:2.7rem;flex:none;border-radius:13px;color:#fff;
  background:linear-gradient(140deg,var(--se-icon-a),var(--se-icon-b));
  box-shadow:0 6px 16px -7px var(--se-icon-a),inset 0 1px 0 rgba(255,255,255,.3);
  transition:transform .45s var(--se-ease)}
.se .se-row:hover .se-row__icon{transform:scale(1.07)}
.se-row__body{min-width:0;flex:1}
.se-row b{display:block;font-size:.96rem;font-weight:700;line-height:1.35;color:var(--se-navy)}
.se-row span{display:block;margin-top:.15rem;font-size:.84rem;color:var(--se-muted)}
.se-row p{margin-top:.35rem;font-size:.88rem;line-height:1.6;color:var(--se-ink);white-space:pre-line}
.se-row__aside{display:flex;flex-direction:column;align-items:flex-end;gap:.35rem;flex:none;text-align:right}
.se .se-chip{display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .55rem;border-radius:999px;font-size:.68rem;font-weight:700;background:#eef2f8;color:var(--se-muted);white-space:nowrap}
.se .se-chip--ok{background:rgba(22,163,74,.1);color:#15803d}
.se .se-link{font-size:.78rem;font-weight:700;color:var(--se-blue)}
.se .se-link:hover{text-decoration:underline;text-underline-offset:3px}

/* media */
.se-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}
@media (min-width:640px){.se-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}
.se-shot{position:relative;aspect-ratio:4/3;overflow:hidden;border-radius:14px;background:#e8eef7}
.se-shot img{object-fit:cover;object-position:50% 25%;transition:transform 1s var(--se-ease)}
.se-shot:hover img{transform:scale(1.06)}
.se-shot figcaption{position:absolute;inset:auto 0 0 0;padding:1.6rem .85rem .7rem;font-size:.82rem;font-weight:600;color:#fff;
  background:linear-gradient(180deg,transparent,rgba(11,31,68,.82))}
.se-entries{display:grid;gap:.6rem}
.se-entry{display:flex;align-items:center;gap:.9rem;padding:.75rem;border-radius:14px;border:1px solid var(--se-line);transition:border-color .4s var(--se-ease),box-shadow .4s var(--se-ease)}
.se-entry:hover{border-color:rgba(37,99,235,.3);box-shadow:var(--se-shadow-hover)}
.se-entry__thumb{position:relative;width:4.2rem;height:3.2rem;flex:none;overflow:hidden;border-radius:10px;background:#e8eef7}
.se-entry__thumb img{object-fit:cover;transition:transform .9s var(--se-ease)}
.se-entry:hover .se-entry__thumb img{transform:scale(1.07)}
.se-entry b{display:block;font-size:.94rem;font-weight:700;color:var(--se-navy)}
.se-entry span{display:block;font-size:.78rem;color:var(--se-muted)}
.se-shelf{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr));gap:1rem}
.se-book__cover{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;border-radius:10px;background:#e8eef7;box-shadow:var(--se-shadow)}
.se-book__cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s var(--se-ease)}
.se-book:hover .se-book__cover img{transform:scale(1.05)}
.se-book__blank{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:.75rem;text-align:center;font-size:.85rem;font-weight:700;color:var(--se-navy)}
.se-book b{display:block;margin-top:.6rem;font-size:.86rem;font-weight:700;line-height:1.3}
.se-book span{display:block;font-size:.76rem;color:var(--se-muted)}

/* aside */
.se-aside .se-h2{font-size:1.15rem}
.se-facts{display:grid;gap:1rem;margin-top:1rem}
.se-facts li{display:flex;gap:.8rem;min-width:0}
.se .se-facts__icon{display:grid;place-items:center;width:2.4rem;height:2.4rem;flex:none;border-radius:12px;color:#fff;
  background:linear-gradient(140deg,var(--se-icon-a),var(--se-icon-b));
  box-shadow:0 6px 14px -7px var(--se-icon-a),inset 0 1px 0 rgba(255,255,255,.3);
  transition:transform .45s var(--se-ease)}
.se .se-facts__icon .se-icon{width:18px;height:18px;color:#fff;stroke:#fff}
.se .se-facts li:hover .se-facts__icon{transform:scale(1.06)}
.se-facts b{display:block;font-size:.84rem;font-weight:700;color:var(--se-navy)}
.se-facts span{display:block;font-size:.8rem;line-height:1.45;color:var(--se-muted);white-space:pre-line;overflow-wrap:break-word}
.se-socials{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.5rem}
.se .se-socials a{display:inline-flex;align-items:center;min-height:2.25rem;padding:0 .8rem;border-radius:999px;border:1px solid var(--se-line-2);font-size:.78rem;font-weight:600;color:var(--se-navy);transition:border-color .3s,background-color .3s}
.se .se-socials a:hover{border-color:var(--se-blue);background:var(--se-blue-soft)}

/* ---------------------------------------------------------- MOTION */
@keyframes se-portrait{from{opacity:0;transform:translateX(-24px) scale(1.02)}to{opacity:1;transform:none}}
@keyframes se-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes se-line{from{transform:rotate(-24deg) scaleX(0)}to{transform:rotate(-24deg) scaleX(1)}}
@keyframes se-drift{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes se-rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes se-failsafe{to{opacity:1;transform:none}}
@media (prefers-reduced-motion:no-preference){
  .se-portrait{animation:se-portrait 1.3s var(--se-ease) .1s both}
  .se-seq{animation:se-up .9s var(--se-ease) both;animation-delay:calc(.25s + var(--i,0) * .08s)}
  .se-beam{animation:se-line 1.6s var(--se-ease) .6s both,se-drift 6s ease-in-out 2.4s infinite}
}
@media (prefers-reduced-motion:no-preference) and (scripting:enabled){
  .se [data-se-reveal]{opacity:0;transform:translateY(22px);
    transition:opacity .9s var(--se-ease) var(--d,0s),transform 1s var(--se-ease) var(--d,0s)}
  .se [data-se-reveal][data-se-in]{opacity:1;transform:none}
  .se [data-se-reveal] .se-h2-rule{transform:scaleX(0);transition:transform 1.1s var(--se-ease) .2s}
  .se [data-se-reveal][data-se-in] .se-h2-rule{transform:scaleX(1)}
  .se:not([data-se-ready]) [data-se-reveal]{animation:se-failsafe .8s var(--se-ease) 3s forwards}

  /*
   * BO'LIM ICHIDAGI ELEMENTLAR KETMA-KET CHIQADI.
   *
   * Animatsiya FAQAT "data-se-in" holatida e'lon qilingan, ya'ni odatdagi
   * holatda elementlar ko'rinib turadi — skript ishlamasa ham mazmun yo'qolmaydi.
   */
  .se [data-se-in] .se-row,
  .se [data-se-in] .se-step,
  .se [data-se-in] .se-entries li,
  .se [data-se-in] .se-shelf li,
  .se [data-se-in] .se-gallery li,
  .se [data-se-in] .se-facts li{animation:se-up .75s var(--se-ease) both;animation-delay:calc(.15s + var(--n,0) * .06s)}
  .se [data-se-in] .se-row:nth-child(1),.se [data-se-in] .se-step:nth-child(1),.se [data-se-in] .se-entries li:nth-child(1),.se [data-se-in] .se-shelf li:nth-child(1),.se [data-se-in] .se-gallery li:nth-child(1),.se [data-se-in] .se-facts li:nth-child(1){--n:0}
  .se [data-se-in] .se-row:nth-child(2),.se [data-se-in] .se-step:nth-child(2),.se [data-se-in] .se-entries li:nth-child(2),.se [data-se-in] .se-shelf li:nth-child(2),.se [data-se-in] .se-gallery li:nth-child(2),.se [data-se-in] .se-facts li:nth-child(2){--n:1}
  .se [data-se-in] .se-row:nth-child(3),.se [data-se-in] .se-step:nth-child(3),.se [data-se-in] .se-entries li:nth-child(3),.se [data-se-in] .se-shelf li:nth-child(3),.se [data-se-in] .se-gallery li:nth-child(3),.se [data-se-in] .se-facts li:nth-child(3){--n:2}
  .se [data-se-in] .se-row:nth-child(4),.se [data-se-in] .se-step:nth-child(4),.se [data-se-in] .se-entries li:nth-child(4),.se [data-se-in] .se-shelf li:nth-child(4),.se [data-se-in] .se-gallery li:nth-child(4),.se [data-se-in] .se-facts li:nth-child(4){--n:3}
  .se [data-se-in] .se-row:nth-child(n+5),.se [data-se-in] .se-step:nth-child(n+5),.se [data-se-in] .se-entries li:nth-child(n+5),.se [data-se-in] .se-shelf li:nth-child(n+5),.se [data-se-in] .se-gallery li:nth-child(n+5),.se [data-se-in] .se-facts li:nth-child(n+5){--n:4}

  /* Ko'rsatkichlar paneli ham ketma-ket. */
  .se-stat{animation:se-up .8s var(--se-ease) both;animation-delay:calc(.8s + var(--j,0) * .07s)}
  .se-stat:nth-child(2){--j:1}.se-stat:nth-child(3){--j:2}
  .se-stat:nth-child(4){--j:3}.se-stat:nth-child(5){--j:4}.se-stat:nth-child(6){--j:5}
}
@media (prefers-reduced-motion:reduce){
  .se *,.se *::before,.se *::after{animation-duration:.01ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;

/* Sayt qobig'i — faqat shu dizaynda: oq/kumush shisha, to'q ko'k matn, qirollik ko'k urg'u. */
const CHROME_CSS = /* css */ `
html body{background-color:#f3f6fb!important}
[data-site-header]{background:rgba(255,255,255,.82)!important;border-bottom-color:#e2e8f2!important}
[data-site-header] nav[aria-label]{background:#f4f7fc!important;border-color:#e2e8f2!important}
[data-site-header] nav[aria-label]>a{color:#33435f!important}
[data-site-header] nav[aria-label]>a:hover{color:#0b1f44!important}
[data-site-header] nav[aria-label]>a.text-white{color:#fff!important}
[data-site-header] .bg-gradient-blue{background:linear-gradient(135deg,#1d4ed8,#2f6bff)!important;box-shadow:0 8px 18px -10px rgba(29,78,216,.7)!important}
[data-site-header] nav[aria-label] button.text-electric-blue,[data-site-header] nav[aria-label] button[aria-expanded="true"]{background:rgba(37,99,235,.08)!important;color:#1d4ed8!important}
[data-site-header] a.bg-gradient-blue{border-radius:12px!important}
[data-site-mobile-nav] .bg-gradient-blue{background:linear-gradient(135deg,#1d4ed8,#2f6bff)!important}
[data-site-mobile-nav] .text-electric-blue{color:#1d4ed8!important}
[data-site-footer]{background:#0a1a3d!important;border-top:3px solid #1d4ed8!important}
[data-site-footer] ul a:hover{color:#8fb0ff!important}
`;

export function silverExecutiveCss(palette: SePalette): string {
  return themeCss(palette) + CHROME_CSS;
}

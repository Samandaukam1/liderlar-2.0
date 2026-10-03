/**
 * IMPERIAL GOLD — USLUBLAR.
 *
 * NEGA TAILWIND EMAS, ALOHIDA CSS:
 *
 *   - Animatsiyalar (`@keyframes`, `prefers-reduced-motion`, ketma-ket
 *     kechikishlar) va sayt headerini moslash utility klasslar bilan
 *     o'qib bo'lmas darajada uzun bo'lardi.
 *   - GLOBAL IFLOSLANISH YO'Q: har bir selektor `.ig` ostida, keyframe
 *     nomlari `ig-` bilan boshlanadi. `<style>` dizayn komponenti ichida
 *     chiziladi — sahifadan chiqilganda u ham DOM'dan ketadi.
 *
 * SAYT HEADERI, FOOTERI VA MOBIL MENYU: ular ildiz layout'da, dizayndan
 * tashqarida. Ularni faqat shu dizayn ochiq turganda moslash uchun
 * `data-site-*` belgilari ishlatiladi ("Headerni berkitish" ham xuddi
 * shu usulda ishlaydi). Uslub tuzilishga tegmaydi — faqat rang va shrift.
 * "Headerni berkitish" yoqilgan bo'lsa, header `display:none` bo'lib
 * qoladi: bu yerdagi qoidalar `display` ga tegmaydi.
 */

const INK = "#0b0a08";

/** Sayt logotipining oq varianti — optimizator orqali, 195 KB PNG emas. */
const LOGO_ON_DARK =
  "/_next/image?url=%2Fassets%2Fbrand%2Fozbekiston-lider-yoshlari%2Flogo-dark-transparent.png&w=640&q=75";

export interface IgPalette {
  ink: string;
  ivory: string;
  gold: string;
  goldHi: string;
}

const themeCss = (p: IgPalette) => /* css */ `
.ig{
  --ig-ink:${p.ink};--ig-ink-2:#110f0c;--ig-ink-3:#17140f;
  --ig-ivory:${p.ivory};--ig-ivory-2:#cfc5b2;--ig-ivory-3:#9d937f;--ig-ivory-4:#6f675a;
  --ig-gold:${p.gold};--ig-gold-hi:${p.goldHi};--ig-gold-lo:#8a7145;
  --ig-line:rgba(201,169,107,.2);--ig-line-faint:rgba(201,169,107,.1);--ig-hair:rgba(243,236,223,.07);
  --ig-ease:cubic-bezier(.16,1,.3,1);
  --ig-ease-io:cubic-bezier(.65,0,.35,1);
  --ig-sticky:64px;
  --ig-nav-h:3.5rem;
  --ig-gutter:clamp(1rem,4.4vw,3.5rem);
  position:relative;isolation:isolate;overflow-x:clip;
  background:var(--ig-ink);color:var(--ig-ivory);
  font-family:var(--ig-sans),ui-sans-serif,system-ui,sans-serif;
  font-size:1rem;line-height:1.7;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  text-rendering:optimizeLegibility;
}
.ig ::selection{background:rgba(201,169,107,.34);color:#fff}
.ig a{color:inherit;text-decoration:none}
.ig :focus-visible{outline:1px solid var(--ig-gold-hi);outline-offset:4px}
.ig-wrap{width:100%;max-width:1280px;margin-inline:auto;padding-inline:var(--ig-gutter)}
.ig-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ig-serif{font-family:var(--ig-serif),Georgia,serif}

/* ------------------------------------------------------------ HERO */
.ig-hero{position:relative;isolation:isolate;overflow:hidden}
.ig-hero__bg{position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:
    radial-gradient(70% 46% at 50% 26%,rgba(201,169,107,.15),rgba(201,169,107,.04) 48%,transparent 72%),
    radial-gradient(140% 70% at 50% 118%,rgba(0,0,0,.7),transparent 62%),
    linear-gradient(180deg,#0f0d0a 0%,${INK} 70%)}
.ig-hero__inner{position:relative;display:flex;flex-direction:column;padding-top:clamp(1.75rem,6vw,3rem);padding-bottom:clamp(3rem,9vw,4.5rem)}
.ig-hero__floor{position:absolute;left:0;right:0;bottom:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(138,113,69,.7) 18%,var(--ig-gold-hi) 50%,rgba(138,113,69,.7) 82%,transparent)}

.ig-figure{position:relative;display:flex;justify-content:center;align-items:flex-end;height:clamp(320px,50svh,470px)}
.ig-figure::after{content:"";position:absolute;left:-50%;right:-50%;bottom:0;height:26%;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(11,10,8,.85) 62%,${INK})}
.ig-stage{position:relative;height:100%;aspect-ratio:4/5;max-width:100%}
.ig-stage::before{content:"";position:absolute;left:50%;top:30%;width:130%;aspect-ratio:1;border-radius:50%;
  transform:translate(-50%,-50%);pointer-events:none;
  background:radial-gradient(closest-side,rgba(233,213,166,.2),rgba(201,169,107,.07) 52%,transparent 100%)}
.ig-beam{position:absolute;left:50%;top:-14%;width:62%;height:96%;transform:translateX(-50%);pointer-events:none;filter:blur(26px);
  background:linear-gradient(180deg,rgba(233,213,166,.13),rgba(233,213,166,.045) 55%,transparent)}
.ig-frame{position:absolute;top:25%;bottom:0;left:3%;right:3%;pointer-events:none}
.ig-frame__line{position:absolute;display:block}
.ig-frame__line--top{top:0;left:0;right:0;height:1px;transform-origin:center;
  background:linear-gradient(90deg,rgba(201,169,107,.55),var(--ig-gold-hi) 50%,rgba(201,169,107,.55))}
.ig-frame__line--left,.ig-frame__line--right{top:0;bottom:0;width:1px;transform-origin:top;
  background:linear-gradient(180deg,var(--ig-gold),rgba(201,169,107,.4) 55%,rgba(201,169,107,0))}
.ig-frame__line--left{left:0}
.ig-frame__line--right{right:0}
.ig-frame__ghost{position:absolute;top:calc(clamp(.9rem,2.4vw,1.5rem) * -1);left:calc(clamp(.9rem,2.4vw,1.5rem) * -1);right:calc(clamp(.9rem,2.4vw,1.5rem) * -1);bottom:0;
  border:1px solid rgba(201,169,107,.17);border-bottom:0;
  -webkit-mask-image:linear-gradient(180deg,#000 35%,transparent 92%);mask-image:linear-gradient(180deg,#000 35%,transparent 92%)}
.ig-frame__node{position:absolute;top:-3px;width:7px;height:7px;transform:rotate(45deg);background:var(--ig-ink);border:1px solid var(--ig-gold-hi)}
.ig-frame__node--l{left:-3px}
.ig-frame__node--r{right:-3px}

.ig-portrait{position:absolute;inset:6% 0 0 0}
.ig-portrait img{object-fit:contain;object-position:50% 100%;
  -webkit-mask-image:linear-gradient(180deg,#000 0%,#000 64%,rgba(0,0,0,.6) 82%,transparent 98%);
  mask-image:linear-gradient(180deg,#000 0%,#000 64%,rgba(0,0,0,.6) 82%,transparent 98%)}
.ig-portrait--framed{inset:calc(25% + 1.25rem) calc(3% + 1.25rem) 0 calc(3% + 1.25rem)}
.ig-portrait--framed img{object-fit:cover;object-position:50% 20%}
.ig-monogram{position:absolute;inset:32% 10% 18% 10%;display:flex;align-items:center;justify-content:center;
  font-family:var(--ig-serif),Georgia,serif;font-weight:300;font-size:clamp(4.5rem,18vw,9rem);line-height:1;
  letter-spacing:.04em;color:var(--ig-gold);opacity:.55}

.ig-copy{position:relative;z-index:2;margin-top:-3.5rem;min-width:0}
.ig-eyebrow{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem 1rem;
  font-size:.6875rem;font-weight:500;letter-spacing:.3em;line-height:1.4;text-transform:uppercase;color:var(--ig-gold)}
.ig-eyebrow__label{display:inline-flex;align-items:center;gap:.875rem}
.ig-eyebrow__label::before{content:"";flex:none;width:2.25rem;height:1px;background:currentColor;opacity:.75}
.ig-badge{display:inline-flex;align-items:center;gap:.5rem;height:1.75rem;padding:0 .8rem;border:1px solid var(--ig-line);
  font-size:.625rem;letter-spacing:.24em;color:var(--ig-gold-hi)}
.ig-name{margin:1.15rem 0 0;font-family:var(--ig-serif),Georgia,serif;font-weight:300;
  font-size:clamp(2.85rem,1.5rem + 5.6vw,7rem);line-height:.94;letter-spacing:-.03em;color:var(--ig-ivory);
  overflow-wrap:break-word}
.ig-name--long{font-size:clamp(2.45rem,1.3rem + 4.7vw,5.9rem)}
.ig-name__line{display:block;overflow:hidden;padding:.08em 0 .12em;margin:-.08em 0 -.12em}
.ig-name__line>span{display:inline-block}
.ig-name__sub{display:block;margin-top:.85rem;font-style:italic;font-weight:300;
  font-size:clamp(1.3rem,.95rem + 1.5vw,2.25rem);line-height:1.15;letter-spacing:-.012em;color:var(--ig-ivory-2)}
.ig-hero-rule{display:block;width:min(9rem,42%);height:1px;margin-top:1.75rem;transform-origin:left;
  background:linear-gradient(90deg,var(--ig-gold-hi),var(--ig-gold) 45%,rgba(201,169,107,0))}
.ig-role{margin-top:1.4rem;font-size:clamp(1.02rem,.96rem + .3vw,1.2rem);font-weight:400;line-height:1.45;letter-spacing:.01em;color:var(--ig-ivory)}
.ig-tags{overflow:hidden;margin-top:.55rem;font-size:.84rem;line-height:1.7;letter-spacing:.015em;color:var(--ig-ivory-3)}
.ig-tags ul{display:flex;flex-wrap:wrap;margin-left:-1.5rem}
.ig-tags li{display:inline-flex;align-items:center}
/* Ajratgich har qator BOSHIDA kesib tashlanadi (ul manfiy chekinish + overflow) — o'ralgan qator romb bilan boshlanmaydi. */
.ig-tags li::before{content:"";flex:none;width:4px;height:4px;margin:0 .7rem 0 calc(.8rem - 4px);background:var(--ig-gold);opacity:.8;transform:rotate(45deg)}
.ig-meta{display:flex;flex-wrap:wrap;gap:1rem 2.25rem;margin-top:1.6rem}
.ig-meta dt{font-size:.6rem;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:var(--ig-ivory-4)}
.ig-meta dd{margin-top:.2rem;font-size:.88rem;line-height:1.45;color:var(--ig-ivory-2)}

.ig-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:2.1rem;border-top:1px solid var(--ig-line);border-bottom:1px solid var(--ig-line)}
.ig-stat{display:flex;flex-direction:column-reverse;justify-content:flex-end;min-width:0;padding:1.1rem .5rem 1.15rem 0}
.ig-stat+.ig-stat{padding-left:clamp(.75rem,2.5vw,1.5rem);border-left:1px solid var(--ig-line-faint)}
.ig-stat__value{display:flex;align-items:baseline;flex-wrap:wrap;gap:.15rem;min-height:1em;
  font-family:var(--ig-serif),Georgia,serif;font-weight:300;font-size:clamp(1.8rem,1.3rem + 1.9vw,3rem);line-height:1;letter-spacing:-.025em;
  color:var(--ig-ivory);font-variant-numeric:lining-nums tabular-nums}
.ig-stat__unit{font-family:var(--ig-sans),sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.06em;color:var(--ig-gold)}
.ig-stat__word{display:block;font-family:var(--ig-serif),Georgia,serif;font-style:italic;font-weight:300;
  font-size:clamp(1rem,.9rem + .5vw,1.3rem);line-height:1.2;color:var(--ig-ivory-2)}
.ig-stat__label{margin-top:.65rem;font-size:.6rem;font-weight:500;line-height:1.35;letter-spacing:.2em;text-transform:uppercase;color:var(--ig-ivory-3)}

.ig-actions{display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.75rem;margin-top:2.1rem}
.ig-btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:.85rem;height:3.15rem;padding:0 1.6rem;overflow:hidden;
  border:1px solid rgba(201,169,107,.55);font-size:.7rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--ig-gold-hi);
  transition:color .7s var(--ig-ease),border-color .7s var(--ig-ease)}
.ig-btn::before{content:"";position:absolute;inset:0;z-index:-1;transform:scaleX(0);transform-origin:left;
  background:linear-gradient(100deg,#b4925a,#e9d5a6 52%,#c3a166);transition:transform .8s var(--ig-ease)}
.ig-btn svg{width:14px;height:14px;transition:transform .7s var(--ig-ease)}
.ig-btn:hover{color:var(--ig-ink);border-color:var(--ig-gold-hi)}
.ig-btn:hover::before{transform:scaleX(1)}
.ig-btn:hover svg{transform:translateY(2px)}
.ig-link{background-image:linear-gradient(currentColor,currentColor);background-repeat:no-repeat;background-position:0 100%;background-size:0 1px;
  padding-bottom:2px;transition:background-size .8s var(--ig-ease),color .5s var(--ig-ease)}
.ig-link:hover{background-size:100% 1px;color:var(--ig-gold-hi)}
.ig-textlink{display:inline-flex;align-items:center;gap:.6rem;font-size:.7rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--ig-ivory-2)}

@media (min-width:640px){
  .ig-figure{height:clamp(440px,62svh,620px)}
  .ig-copy{max-width:42rem;margin-top:-4.5rem}
}
@media (min-width:1024px){
  .ig-hero__bg{background:
    radial-gradient(48% 62% at 74% 40%,rgba(201,169,107,.15),rgba(201,169,107,.045) 50%,transparent 74%),
    radial-gradient(120% 60% at 50% 120%,rgba(0,0,0,.7),transparent 60%),
    linear-gradient(180deg,#0f0d0a 0%,${INK} 75%)}
  .ig-hero__inner{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);column-gap:clamp(2rem,4vw,4rem);align-items:end;
    min-height:clamp(660px,calc(100svh - 76px),920px);padding-top:clamp(2.5rem,6vh,4rem);padding-bottom:0}
  .ig-copy{order:1;max-width:none;margin-top:0;padding-bottom:clamp(3.5rem,8vh,6rem);align-self:end}
  .ig-figure{order:2;height:auto;align-self:stretch;min-height:600px}
  .ig-stage{position:absolute;left:50%;bottom:0;height:min(90%,820px);transform:translateX(-50%)}
  .ig-figure::after{left:-20%;right:-20%;height:24%}
  .ig-monogram{font-size:10rem}
}

/* ------------------------------------------------------------ SECTION NAV */
.ig-nav{position:sticky;top:var(--ig-sticky);z-index:30;
  background:rgba(11,10,8,.84);-webkit-backdrop-filter:blur(18px) saturate(1.1);backdrop-filter:blur(18px) saturate(1.1);
  border-top:1px solid var(--ig-line-faint);border-bottom:1px solid var(--ig-line-faint)}
.ig-nav__track{position:relative;display:flex;align-items:center;gap:clamp(1.6rem,3.2vw,3rem);height:var(--ig-nav-h);
  overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 var(--ig-gutter),#000 calc(100% - var(--ig-gutter)),transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0,#000 var(--ig-gutter),#000 calc(100% - var(--ig-gutter)),transparent 100%)}
.ig-nav__track::-webkit-scrollbar{display:none}
.ig-nav__track::after{content:"";flex:none;width:1px}
.ig-nav a{position:relative;flex:none;display:flex;align-items:center;height:100%;white-space:nowrap;
  font-size:.66rem;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:var(--ig-ivory-3);transition:color .6s var(--ig-ease)}
.ig-nav a:hover{color:var(--ig-ivory)}
.ig-nav a[aria-current="true"]{color:var(--ig-gold-hi)}
.ig-nav__ink{position:absolute;left:0;bottom:0;height:1px;width:var(--ig-ink-w,0px);transform:translateX(var(--ig-ink-x,0px));
  opacity:var(--ig-ink-o,0);pointer-events:none;
  background:linear-gradient(90deg,var(--ig-gold-lo),var(--ig-gold-hi) 50%,var(--ig-gold-lo));
  transition:transform .8s var(--ig-ease),width .8s var(--ig-ease),opacity .6s var(--ig-ease)}

/* ------------------------------------------------------------ CHAPTERS */
.ig-chapter{position:relative;padding-block:clamp(4.25rem,2.75rem + 6vw,8.5rem);scroll-margin-top:calc(var(--ig-sticky) + var(--ig-nav-h) - 1px)}
.ig-chapter+.ig-chapter,.ig-interlude+.ig-chapter{border-top:1px solid var(--ig-line-faint)}
.ig-chapter__grid{display:grid;gap:2.5rem}
.ig-chapter__index{display:flex;align-items:center;gap:1rem;font-size:.66rem;font-weight:500;letter-spacing:.32em;color:var(--ig-gold);font-variant-numeric:tabular-nums}
.ig-rule{flex:none;display:block;width:3.75rem;height:1px;transform-origin:left;background:linear-gradient(90deg,var(--ig-gold),rgba(201,169,107,.12))}
.ig-h2{margin-top:1.15rem;font-family:var(--ig-serif),Georgia,serif;font-weight:300;font-size:clamp(2.15rem,1.45rem + 2.7vw,3.7rem);
  line-height:1.02;letter-spacing:-.025em;color:var(--ig-ivory);text-wrap:balance}
.ig-chapter__note{margin-top:1.1rem;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ig-ivory-3)}
.ig-sub{display:flex;align-items:center;gap:1rem;margin:0 0 1.5rem;font-size:.66rem;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:var(--ig-gold)}
.ig-sub::after{content:"";flex:1;height:1px;background:var(--ig-hair)}
.ig-block+.ig-block,.ig-rows+.ig-block{margin-top:clamp(3rem,2rem + 3vw,4.5rem)}
@media (min-width:1024px){
  .ig-chapter__grid{grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(3rem,5vw,6rem)}
  .ig-chapter__head{position:sticky;top:calc(var(--ig-sticky) + var(--ig-nav-h) + 2.75rem);align-self:start}
  .ig-chapter--wide .ig-chapter__grid{grid-template-columns:minmax(0,1fr);gap:3.25rem}
  .ig-chapter--wide .ig-chapter__head{position:static}
}

/* facts */
.ig-facts{display:grid;grid-template-columns:minmax(0,1fr);border-top:1px solid var(--ig-line)}
.ig-fact{padding:1.15rem 0 1.25rem;border-bottom:1px solid var(--ig-hair)}
.ig-fact dt{font-size:.6rem;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:var(--ig-gold)}
.ig-fact dd{margin-top:.5rem;font-size:.98rem;line-height:1.65;color:var(--ig-ivory);white-space:pre-line}
.ig-langs{display:flex;flex-wrap:wrap;gap:.5rem}
.ig-langs span{padding:.28rem .8rem;border:1px solid var(--ig-line);font-size:.8rem;letter-spacing:.03em;color:var(--ig-ivory-2);white-space:normal}
@media (min-width:640px){
  .ig-facts{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:2.75rem}
  .ig-fact--wide{grid-column:1/-1}
}

/* story */
.ig-story{max-width:41rem}
.ig-story__part+.ig-story__part{margin-top:clamp(2.75rem,2rem + 2.2vw,4rem)}
.ig-story__head{display:flex;align-items:baseline;gap:1rem}
.ig-story__num{flex:none;min-width:1.75rem;font-family:var(--ig-serif),Georgia,serif;font-style:italic;font-size:1rem;letter-spacing:.04em;color:var(--ig-gold)}
.ig-story h3{font-family:var(--ig-serif),Georgia,serif;font-weight:400;font-size:clamp(1.4rem,1.18rem + .85vw,1.85rem);line-height:1.18;letter-spacing:-.015em;color:var(--ig-ivory);text-wrap:balance}
.ig-prose{margin-top:1rem;font-size:clamp(1rem,.97rem + .18vw,1.075rem);line-height:1.86;color:var(--ig-ivory-2);hyphens:auto;text-wrap:pretty;overflow-wrap:break-word}
.ig-prose p+p{margin-top:1.15em}
.ig-lead{font-family:var(--ig-serif),Georgia,serif;font-weight:300;font-size:clamp(1.18rem,1rem + .9vw,1.65rem);line-height:1.5;letter-spacing:-.006em;color:var(--ig-ivory)}
.ig-lead::first-letter{float:left;margin:.06em .13em 0 0;font-size:3.5em;line-height:.8;font-weight:300;color:var(--ig-gold-hi)}
@media (min-width:768px){.ig-story__body{padding-left:2.75rem}}

/* interlude quote */
.ig-interlude{position:relative;padding-block:clamp(5rem,3.5rem + 7vw,9.5rem);text-align:center;overflow:hidden;
  border-top:1px solid var(--ig-line-faint);background:radial-gradient(46% 58% at 50% 50%,rgba(201,169,107,.075),transparent 72%)}
.ig-quote-mark{display:block;width:2.4rem;height:2.4rem;margin:0 auto 1.75rem;color:var(--ig-gold)}
.ig-quote{max-width:54rem;margin-inline:auto;font-family:var(--ig-serif),Georgia,serif;font-style:italic;font-weight:300;
  font-size:clamp(1.6rem,1.1rem + 2.3vw,3.05rem);line-height:1.3;letter-spacing:-.014em;color:var(--ig-ivory);text-wrap:balance}
.ig-quote-by{display:inline-flex;align-items:center;gap:1rem;margin-top:2.25rem;font-size:.66rem;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:var(--ig-gold)}
.ig-quote-by::before,.ig-quote-by::after{content:"";width:1.75rem;height:1px;background:currentColor;opacity:.6}
.ig-quotes{display:grid;gap:clamp(2.5rem,2rem + 2vw,3.5rem)}
.ig-quotes blockquote{font-family:var(--ig-serif),Georgia,serif;font-style:italic;font-weight:300;font-size:clamp(1.3rem,1.05rem + 1vw,1.9rem);line-height:1.38;color:var(--ig-ivory);
  padding-left:1.5rem;border-left:1px solid var(--ig-gold)}

/* path / timeline */
.ig-path{display:grid;gap:3.25rem}
@media (min-width:768px){.ig-path--two{grid-template-columns:repeat(2,minmax(0,1fr));gap:3rem}}
.ig-steps{border-left:1px solid var(--ig-line)}
.ig-step{position:relative;padding:0 0 2.4rem 1.75rem}
.ig-step:last-child{padding-bottom:0}
.ig-step::before{content:"";position:absolute;left:-4px;top:.5rem;width:7px;height:7px;transform:rotate(45deg);
  background:var(--ig-ink);border:1px solid var(--ig-gold);transition:background-color .7s var(--ig-ease),box-shadow .7s var(--ig-ease)}
.ig-step:hover::before{background:var(--ig-gold);box-shadow:0 0 14px rgba(233,213,166,.45)}
.ig-when{font-size:.72rem;font-weight:500;letter-spacing:.16em;color:var(--ig-gold);font-variant-numeric:tabular-nums}
.ig-step__title{margin-top:.4rem;font-family:var(--ig-serif),Georgia,serif;font-size:1.3rem;line-height:1.25;letter-spacing:-.01em;color:var(--ig-ivory)}
.ig-step__sub{margin-top:.3rem;font-size:.9rem;line-height:1.55;color:var(--ig-ivory-3)}
.ig-step__desc{margin-top:.65rem;font-size:.95rem;line-height:1.75;color:var(--ig-ivory-2);white-space:pre-line}

/* honours list */
.ig-rows{border-top:1px solid var(--ig-line)}
.ig-row{display:grid;grid-template-columns:2.75rem minmax(0,1fr);column-gap:1rem;padding:1.5rem 0 1.6rem;border-bottom:1px solid var(--ig-hair);
  transition:background-color .7s var(--ig-ease)}
.ig-row:hover{background:linear-gradient(90deg,rgba(201,169,107,.045),transparent 70%)}
.ig-row__n{font-family:var(--ig-serif),Georgia,serif;font-weight:300;font-size:1.55rem;line-height:1.05;color:var(--ig-gold-lo);
  font-variant-numeric:lining-nums tabular-nums;transition:color .7s var(--ig-ease)}
.ig-row:hover .ig-row__n{color:var(--ig-gold-hi)}
.ig-row__title{font-family:var(--ig-serif),Georgia,serif;font-size:clamp(1.15rem,1.05rem + .4vw,1.4rem);line-height:1.3;letter-spacing:-.01em;color:var(--ig-ivory)}
.ig-row__sub{margin-top:.35rem;font-size:.9rem;line-height:1.6;color:var(--ig-ivory-3)}
.ig-row__desc{margin-top:.6rem;font-size:.95rem;line-height:1.75;color:var(--ig-ivory-2);white-space:pre-line}
.ig-row__aside{grid-column:2;margin-top:.7rem;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1.4rem}
@media (min-width:640px){
  .ig-row{grid-template-columns:4rem minmax(0,1fr) auto}
  .ig-row__aside{grid-column:3;margin-top:0;align-self:baseline;justify-content:flex-end;text-align:right}
}
.ig-trust{display:inline-flex;align-items:center;gap:.5rem;font-size:.6rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--ig-ivory-3)}
.ig-trust::before{content:"";width:5px;height:5px;transform:rotate(45deg);border:1px solid currentColor}
.ig-trust--ok{color:var(--ig-gold-hi)}
.ig-trust--ok::before{background:currentColor}
.ig-arrow{display:inline-flex;align-items:center;gap:.45rem;font-size:.66rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--ig-ivory-2);transition:color .5s var(--ig-ease)}
.ig-arrow svg{width:12px;height:12px;transition:transform .7s var(--ig-ease)}
.ig-arrow:hover{color:var(--ig-gold-hi)}
.ig-arrow:hover svg{transform:translate(2px,-2px)}

/* entries (journal, podcasts) */
.ig-entries{border-top:1px solid var(--ig-line)}
.ig-entry{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:1.25rem;padding:1.25rem 0;border-bottom:1px solid var(--ig-hair)}
.ig-entry__thumb{position:relative;width:4.5rem;aspect-ratio:4/5;overflow:hidden;background:var(--ig-ink-3);border:1px solid var(--ig-hair)}
.ig-entry__thumb img{object-fit:cover;transition:transform 1.4s var(--ig-ease)}
.ig-entry:hover .ig-entry__thumb img{transform:scale(1.07)}
.ig-entry__title{font-family:var(--ig-serif),Georgia,serif;font-size:clamp(1.1rem,1rem + .4vw,1.35rem);line-height:1.3;color:var(--ig-ivory);transition:color .5s var(--ig-ease)}
.ig-entry:hover .ig-entry__title{color:var(--ig-gold-hi)}
.ig-entry__meta{margin-top:.35rem;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ig-ivory-3)}
.ig-entry__go{width:2.5rem;height:2.5rem;display:grid;place-items:center;border:1px solid var(--ig-line);color:var(--ig-gold);
  transition:border-color .6s var(--ig-ease),transform .7s var(--ig-ease)}
.ig-entry__go svg{width:12px;height:12px}
.ig-entry:hover .ig-entry__go{border-color:var(--ig-gold-hi);transform:translateX(3px)}

/* books */
.ig-shelf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2rem 1rem}
@media (min-width:640px){.ig-shelf{grid-template-columns:repeat(3,minmax(0,1fr));gap:2.25rem 1.5rem}}
@media (min-width:1280px){.ig-shelf{grid-template-columns:repeat(4,minmax(0,1fr))}}
.ig-book{display:block}
.ig-book__cover{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;background:var(--ig-ink-3);border:1px solid var(--ig-hair)}
.ig-book__cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.5s var(--ig-ease)}
.ig-book:hover .ig-book__cover img{transform:scale(1.06)}
.ig-book__blank{position:absolute;inset:.6rem;display:flex;align-items:center;justify-content:center;padding:1rem;border:1px solid var(--ig-line);
  font-family:var(--ig-serif),Georgia,serif;font-style:italic;font-size:1rem;line-height:1.3;text-align:center;color:var(--ig-gold)}
.ig-book__title{display:block;margin-top:.95rem;font-family:var(--ig-serif),Georgia,serif;font-size:1.05rem;line-height:1.3;color:var(--ig-ivory);transition:color .5s var(--ig-ease)}
.ig-book:hover .ig-book__title{color:var(--ig-gold-hi)}
.ig-book__author{display:block;margin-top:.25rem;font-size:.8rem;color:var(--ig-ivory-3)}
.ig-simple{border-top:1px solid var(--ig-line)}
.ig-simple li{display:flex;flex-wrap:wrap;align-items:baseline;gap:.25rem .75rem;padding:1rem 0;border-bottom:1px solid var(--ig-hair)}
.ig-simple b{font-family:var(--ig-serif),Georgia,serif;font-weight:400;font-size:1.1rem;color:var(--ig-ivory)}
.ig-simple span{font-size:.9rem;color:var(--ig-ivory-3)}

/* gallery */
.ig-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}
.ig-shot{position:relative;display:block;width:100%;aspect-ratio:4/5;overflow:hidden;background:var(--ig-ink-3)}
.ig-shot__btn{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;background:none;cursor:zoom-in}
.ig-shot__btn:focus-visible{outline-offset:-6px}
.ig-shot img{object-fit:cover;object-position:50% 22%;transition:transform 1.6s var(--ig-ease),filter 1.2s var(--ig-ease);filter:saturate(.92)}
.ig-shot::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .9s var(--ig-ease);
  background:linear-gradient(180deg,transparent 45%,rgba(11,10,8,.72))}
.ig-shot::after{content:"";position:absolute;inset:.55rem;z-index:1;pointer-events:none;border:1px solid rgba(233,213,166,0);
  transition:border-color .9s var(--ig-ease),inset .9s var(--ig-ease)}
.ig-shot:hover img,.ig-shot:focus-within img{transform:scale(1.06);filter:saturate(1)}
.ig-shot:hover::before,.ig-shot:focus-within::before{opacity:1}
.ig-shot:hover::after,.ig-shot:focus-within::after{inset:.85rem;border-color:rgba(233,213,166,.5)}
.ig-shot__more{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;
  background:rgba(11,10,8,.62);font-family:var(--ig-serif),Georgia,serif;font-weight:300;font-size:2.3rem;line-height:1;color:var(--ig-ivory)}
.ig-shot__more small{font-family:var(--ig-sans),sans-serif;font-size:.6rem;letter-spacing:.26em;text-transform:uppercase;color:var(--ig-gold)}
.ig-shot--lead,.ig-shot--wide{grid-column:span 2;aspect-ratio:3/2}
@media (min-width:768px){
  .ig-gallery{grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:clamp(9.5rem,13.5vw,13.5rem);grid-auto-flow:row dense;gap:.75rem}
  .ig-shot,.ig-shot--lead,.ig-shot--wide{grid-column:span 2;aspect-ratio:auto;height:100%}
  .ig-shot--big{grid-column:span 4;grid-row:span 2}
  .ig-shot--big-r{grid-column:3/span 4;grid-row:span 2}
  .ig-shot--half{grid-column:span 3;grid-row:span 2}
  .ig-shot--solo{grid-column:span 6;grid-row:span 3}
}

/* lightbox */
.ig-lightbox{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;
  padding:4.5rem 1rem 5.5rem;background:rgba(7,6,5,.95);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.ig-lightbox__frame{position:relative;flex:1 1 auto;min-height:0;width:min(100%,1120px)}
.ig-lightbox__frame img{object-fit:contain}
.ig-lightbox__cap{max-width:42rem;text-align:center;font-size:.85rem;line-height:1.6;color:var(--ig-ivory-2)}
.ig-lightbox__count{position:absolute;top:1.6rem;left:50%;transform:translateX(-50%);font-size:.66rem;font-weight:500;letter-spacing:.3em;color:var(--ig-gold);font-variant-numeric:tabular-nums}
.ig-lb-btn{position:absolute;display:grid;place-items:center;width:3rem;height:3rem;border:1px solid var(--ig-line);background:rgba(11,10,8,.5);
  color:var(--ig-ivory);cursor:pointer;transition:border-color .5s var(--ig-ease),color .5s var(--ig-ease),background-color .5s var(--ig-ease)}
.ig-lb-btn:hover{border-color:var(--ig-gold-hi);color:var(--ig-gold-hi)}
.ig-lb-btn svg{width:16px;height:16px}
.ig-lb-close{top:1rem;right:1rem}
.ig-lb-prev{bottom:1.25rem;left:calc(50% - 3.5rem)}
.ig-lb-next{bottom:1.25rem;right:calc(50% - 3.5rem)}
@media (min-width:768px){
  .ig-lightbox{padding:4.5rem 6rem 4rem}
  .ig-lb-prev{left:1.5rem;bottom:auto;top:50%;transform:translateY(-50%)}
  .ig-lb-next{right:1.5rem;bottom:auto;top:50%;transform:translateY(-50%)}
}

/* outro */
.ig-outro{position:relative;padding-block:clamp(5rem,3.5rem + 6vw,8.5rem) clamp(4rem,3rem + 4vw,6rem);text-align:center;overflow:hidden;border-top:1px solid var(--ig-line-faint);
  background:radial-gradient(50% 60% at 50% 0%,rgba(201,169,107,.07),transparent 70%)}
.ig-outro__mark{width:22px;height:22px;margin:0 auto;color:var(--ig-gold)}
.ig-outro__mark svg{width:100%;height:100%;overflow:visible}
.ig-outro__mark rect{fill:none;stroke:currentColor;stroke-width:1}
.ig-outro__mark circle{fill:currentColor}
.ig-outro__name{margin-top:1.6rem;font-family:var(--ig-serif),Georgia,serif;font-weight:300;font-size:clamp(1.85rem,1.3rem + 2.2vw,3.25rem);line-height:1.06;letter-spacing:-.022em;color:var(--ig-ivory);text-wrap:balance}
.ig-outro__role{margin-top:.9rem;font-size:.72rem;letter-spacing:.26em;text-transform:uppercase;color:var(--ig-ivory-3)}
.ig-socials{display:flex;flex-wrap:wrap;justify-content:center;gap:.9rem 2.25rem;margin-top:2.25rem}
.ig-socials a{display:inline-flex;align-items:center;gap:.5rem;font-size:.7rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--ig-ivory-2)}
.ig-socials svg{width:11px;height:11px;color:var(--ig-gold)}
.ig-promo{max-width:27rem;margin:3rem auto 0;padding:1.75rem 1.25rem;border-top:1px solid var(--ig-line);border-bottom:1px solid var(--ig-line)}
.ig-promo__label{font-size:.6rem;font-weight:500;letter-spacing:.3em;text-transform:uppercase;color:var(--ig-gold)}
.ig-promo__row{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:.9rem}
.ig-promo__code{font-size:clamp(1.35rem,1.2rem + .6vw,1.65rem);font-weight:500;letter-spacing:.22em;color:var(--ig-ivory);font-variant-numeric:tabular-nums}
.ig-promo__copy{display:grid;place-items:center;width:2.4rem;height:2.4rem;border:1px solid var(--ig-line);color:var(--ig-gold-hi);cursor:pointer;
  background:transparent;transition:border-color .5s var(--ig-ease),background-color .5s var(--ig-ease)}
.ig-promo__copy:hover{border-color:var(--ig-gold-hi);background:rgba(201,169,107,.08)}
.ig-promo__copy svg{width:15px;height:15px}
.ig-promo__text{margin-top:.8rem;font-size:.85rem;line-height:1.55;color:var(--ig-ivory-3)}
.ig-promo__cta{margin-top:1.1rem}

/* ------------------------------------------------------------ MOTION */
@keyframes ig-rise{from{transform:translateY(108%)}to{transform:none}}
@keyframes ig-fade-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes ig-fade{from{opacity:0}to{opacity:1}}
@keyframes ig-expand{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes ig-expand-y{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes ig-node{from{opacity:0;transform:rotate(45deg) scale(.4)}to{opacity:1;transform:rotate(45deg)}}
@keyframes ig-portrait{
  from{opacity:0;transform:translateY(2.5%) scale(1.035);clip-path:inset(100% -30% 0 -30%)}
  to{opacity:1;transform:none;clip-path:inset(-30% -30% 0 -30%)}}
@keyframes ig-portrait-framed{from{opacity:0;transform:translateY(2.5%) scale(1.04)}to{opacity:1;transform:none}}
@keyframes ig-glow{from{opacity:0;transform:translate(-50%,-50%) scale(.82)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes ig-failsafe{to{opacity:1;transform:none}}
@keyframes ig-failsafe-rule{to{transform:scaleX(1)}}
@keyframes ig-lightbox{from{opacity:0}to{opacity:1}}
@keyframes ig-lightbox-img{from{opacity:0;transform:scale(.975)}to{opacity:1;transform:none}}

@media (prefers-reduced-motion:no-preference){
  .ig-eyebrow{animation:ig-fade 1.4s var(--ig-ease) .15s both}
  .ig-name__line>span{animation:ig-rise 1.35s var(--ig-ease) both;animation-delay:calc(.3s + var(--i,0) * .13s)}
  .ig-name__sub{animation:ig-fade-up 1.3s var(--ig-ease) .66s both}
  .ig-hero-rule{animation:ig-expand 1.7s var(--ig-ease) .8s both}
  .ig-seq{animation:ig-fade-up 1.2s var(--ig-ease) both;animation-delay:calc(.9s + var(--i,0) * .11s)}
  .ig-portrait{animation:ig-portrait 2.1s var(--ig-ease) .2s both}
  .ig-portrait--framed{animation-name:ig-portrait-framed}
  .ig-monogram{animation:ig-fade 2s var(--ig-ease) .4s both}
  .ig-stage::before{animation:ig-glow 2.6s var(--ig-ease) .1s both}
  .ig-beam{animation:ig-fade 2.8s var(--ig-ease) .2s both}
  .ig-frame__line--top{animation:ig-expand 1.9s var(--ig-ease-io) .35s both}
  .ig-frame__line--left,.ig-frame__line--right{animation:ig-expand-y 2.2s var(--ig-ease) 1s both}
  .ig-frame__ghost{animation:ig-fade 2.4s var(--ig-ease) 1.4s both}
  .ig-frame__node{animation:ig-node 1.2s var(--ig-ease) 1.6s both}
  .ig-hero__floor{transform-origin:center;animation:ig-expand 2.4s var(--ig-ease) .5s both}
  .ig-lightbox{animation:ig-lightbox .5s var(--ig-ease) both}
  .ig-lightbox__frame{animation:ig-lightbox-img .7s var(--ig-ease) both}
}

/*
 * SCROLL BO'YICHA OCHILISH.
 *
 * Yashirin holat FAQAT skript ishlaydigan brauzerda (scripting: enabled)
 * va harakat cheklanmagan bo'lsa. Skript umuman yuklanmasa, 3 soniyadan
 * keyin hammasi o'zi ko'rinadi (failsafe) — mazmun hech qachon yashirin
 * qolib ketmaydi. Skript ulangach (\`data-ig-ready\`) failsafe o'chadi.
 */
@media (prefers-reduced-motion:no-preference) and (scripting:enabled){
  .ig [data-ig-reveal]{opacity:0;transform:translateY(30px);
    transition:opacity 1.3s var(--ig-ease) var(--d,0s),transform 1.5s var(--ig-ease) var(--d,0s)}
  .ig [data-ig-reveal][data-ig-in]{opacity:1;transform:none}
  .ig [data-ig-reveal] .ig-rule{transform:scaleX(0);transition:transform 1.8s var(--ig-ease) calc(var(--d,0s) + .25s)}
  .ig [data-ig-reveal][data-ig-in] .ig-rule{transform:scaleX(1)}
  .ig:not([data-ig-ready]) [data-ig-reveal]{animation:ig-failsafe 1s var(--ig-ease) 3s forwards}
  .ig:not([data-ig-ready]) [data-ig-reveal] .ig-rule{animation:ig-failsafe-rule 1s var(--ig-ease) 3s forwards}
}

@media (prefers-reduced-motion:reduce){
  .ig *,.ig *::before,.ig *::after{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important}
  .ig-shot:hover img,.ig-book:hover .ig-book__cover img,.ig-entry:hover .ig-entry__thumb img{transform:none}
}

`;

/*
 * SAYT HEADERI / FOOTERI / MOBIL MENYU — faqat shu dizayn ochiq turganda.
 *
 * `!important` majburiy: header Tailwind utility klasslari bilan chizilgan
 * va ularning ustunligi bilan teng selektor yutib chiqmasdi.
 */
function chromeCss(sansFamily: string): string {
  return /* css */ `
html body{background-color:${INK}!important}

[data-site-header]{background:rgba(11,10,8,.82)!important;border-bottom-color:rgba(201,169,107,.15)!important;box-shadow:none!important;
  -webkit-backdrop-filter:blur(18px) saturate(1.1)!important;backdrop-filter:blur(18px) saturate(1.1)!important;font-family:${sansFamily}}
[data-site-logo]{background:url("${LOGO_ON_DARK}") left center/contain no-repeat}
[data-site-logo] img{opacity:0}
[data-site-header] nav[aria-label]{background:rgba(243,236,223,.02)!important;border-color:rgba(201,169,107,.17)!important;box-shadow:none!important}
[data-site-header] nav[aria-label]>a,[data-site-header] nav[aria-label] button{color:#b3a996!important;font-weight:500!important;letter-spacing:.045em;transition:color .5s ease}
[data-site-header] nav[aria-label]>a:hover,[data-site-header] nav[aria-label] button:hover{color:#f3ecdf!important}
[data-site-header] nav[aria-label]>a.text-white{color:#e9d5a6!important}
[data-site-header] nav[aria-label]>a .bg-gradient-blue{background:rgba(201,169,107,.12)!important;box-shadow:inset 0 0 0 1px rgba(201,169,107,.45)!important}
[data-site-header] nav[aria-label] button[aria-expanded="true"],[data-site-header] nav[aria-label] button.text-electric-blue{background:rgba(201,169,107,.1)!important;color:#e9d5a6!important}
[data-site-header] [role="menu"]{background:rgba(17,15,12,.97)!important;border-color:rgba(201,169,107,.2)!important;box-shadow:0 30px 80px rgba(0,0,0,.6)!important}
[data-site-header] [role="menu"] p{color:#8f8573!important}
[data-site-header] [role="menu"] a{color:#cfc5b2!important}
[data-site-header] [role="menu"] a:hover{background:rgba(201,169,107,.07)!important}
[data-site-header] [role="menu"] a>span:first-child{background:rgba(201,169,107,.1)!important;color:#c9a96b!important}
[data-site-header] [role="menu"] a:hover>span:first-child{background:#c9a96b!important;color:${INK}!important}
[data-site-header] [role="menu"] a>span:last-child>span:first-child{color:#f3ecdf!important}
[data-site-header] [role="menu"] a>span:last-child>span:last-child{color:#8f8573!important}
[data-site-header] a[aria-label="Qidiruv"],[data-site-header] a[aria-label="Jaxongir AI"]{background:transparent!important;border:1px solid rgba(201,169,107,.24)!important;color:#cfc5b2!important}
[data-site-header] a[aria-label="Qidiruv"]:hover,[data-site-header] a[aria-label="Jaxongir AI"]:hover{border-color:rgba(233,213,166,.65)!important;color:#e9d5a6!important}
[data-site-header] a.bg-transparent{color:#cfc5b2!important}
[data-site-header] a.bg-transparent:hover{background:rgba(201,169,107,.08)!important}
[data-site-header] a.bg-transparent svg{color:#c9a96b!important}
[data-site-header] a.bg-paper{background:transparent!important;border-color:rgba(201,169,107,.32)!important;color:#f3ecdf!important;box-shadow:none!important}
[data-site-header] a.bg-paper:hover{border-color:rgba(233,213,166,.7)!important}
[data-site-header] a.bg-gradient-blue{background:linear-gradient(100deg,#b4925a,#e3cb95 52%,#c3a166)!important;color:${INK}!important;box-shadow:none!important}

[data-site-mobile-nav]{background:rgba(14,12,10,.92)!important;border-color:rgba(201,169,107,.2)!important;box-shadow:0 18px 50px rgba(0,0,0,.6)!important;font-family:${sansFamily}}
[data-site-mobile-nav] a,[data-site-mobile-nav] button{color:#9d937f!important;letter-spacing:.04em}
[data-site-mobile-nav] .text-electric-blue{color:#e9d5a6!important}
[data-site-mobile-nav] .bg-gradient-blue{background:rgba(201,169,107,.14)!important;color:#e9d5a6!important;box-shadow:inset 0 0 0 1px rgba(201,169,107,.45)!important}
[data-site-mobile-nav] span.absolute{background:rgba(201,169,107,.06)!important}

[data-site-footer]{background:#080706!important;border-top:1px solid rgba(201,169,107,.15)!important;color:#9d937f!important;font-family:${sansFamily}}
[data-site-footer] h4{color:#c9a96b!important;font-weight:500!important;letter-spacing:.26em!important}
[data-site-footer] p{color:#857b6b!important}
[data-site-footer] ul a{color:#b3a996!important;transition:color .5s ease}
[data-site-footer] ul a:hover{color:#e9d5a6!important}
[data-site-footer] a.rounded-full{background:transparent!important;border:1px solid rgba(201,169,107,.26);color:#cfc5b2}
[data-site-footer] a.rounded-full:hover{border-color:rgba(233,213,166,.7);color:#e9d5a6}
[data-site-footer] div[class*="border-t"]{border-color:rgba(201,169,107,.12)!important}

[data-hidden-header-link]{background:rgba(11,10,8,.66)!important;border:1px solid rgba(201,169,107,.34);color:#e9d5a6!important;box-shadow:none!important;
  font-family:${sansFamily};font-weight:500!important;letter-spacing:.08em}
body:has([data-hidden-header-link]) .ig{--ig-sticky:0px;--ig-nav-h:4rem}
body:has([data-hidden-header-link]) .ig-nav__track{padding-left:calc(var(--ig-gutter) + 8.5rem)}
`;
}

export function imperialGoldCss({ sansFamily, palette }: { sansFamily: string; palette: IgPalette }): string {
  return themeCss(palette) + chromeCss(sansFamily);
}

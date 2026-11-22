# Portfolio hero animations

Two animations: a **name** that gets bolder near your cursor, and a **photo** that floats, morphs, tilts and catches light.
Uses the variable font *Bricolage Grotesque* (weight 200–800, width 75–100).

Add to `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&display=swap" rel="stylesheet">
```

---

## 1. Name animation

### HTML

```html
<h1 id="name" aria-label="Alex Rivera">
  <span class="row" data-t="Alex" aria-hidden="true"></span>
  <span class="row" data-t="Rivera" aria-hidden="true"></span>
</h1>
```

### CSS

```css
h1{position:relative;z-index:2;font-family:"Bricolage Grotesque",system-ui,sans-serif;
  font-size:clamp(64px,17vw,300px);line-height:.86;letter-spacing:-.03em;user-select:none}
h1 .row{display:block;overflow:hidden;padding-bottom:.06em}
h1 .ch{display:inline-block;transform:translateY(105%);font-weight:200;will-change:font-variation-settings}

/* page-load: letters rise one by one (add class "in" to <body>) */
.in .ch{animation:rise .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:calc(var(--i)*45ms)}
@keyframes rise{to{transform:translateY(0)}}

@media (prefers-reduced-motion:reduce){.ch{transform:none!important;animation:none!important}}
```

### JavaScript

```js
(function(){
  var h1=document.getElementById('name'), chars=[], i=0;
  h1.querySelectorAll('.row').forEach(function(row){
    row.dataset.t.split('').forEach(function(c){
      var s=document.createElement('span'); s.className='ch'; s.textContent=c; s.style.setProperty('--i',i++);
      row.appendChild(s); chars.push({el:s,w:200,cx:0,cy:0});
    });
  });
  requestAnimationFrame(function(){document.body.classList.add('in')});

  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var px=-1e4, py=-1e4, active=false, t0=performance.now();
  function measure(){chars.forEach(function(c){var r=c.el.getBoundingClientRect();c.cx=r.left+r.width/2;c.cy=r.top+r.height/2})}
  addEventListener('resize',measure); setTimeout(measure,1200);
  addEventListener('pointermove',function(e){px=e.clientX;py=e.clientY;active=true;measure()},{passive:true});
  addEventListener('pointerleave',function(){active=false});
  addEventListener('scroll',measure,{passive:true});

  function frame(now){
    var t=(now-t0)/1000, radius=Math.max(180,innerWidth*.16);
    chars.forEach(function(c,k){
      var target;
      if(active){                      // near the cursor = bolder + wider
        var d=Math.hypot(px-c.cx,(py-c.cy)*.8);
        var f=Math.max(0,1-d/radius); f=f*f*(3-2*f);
        target=200+600*f;
      }else{                           // idle = slow wave through the letters
        target=200+300*(0.5+0.5*Math.sin(t*1.6-k*.55));
      }
      c.w+=(target-c.w)*.14;           // smoothing
      c.el.style.fontVariationSettings='"wght" '+c.w.toFixed(0)+', "wdth" '+(75+25*((c.w-200)/600)).toFixed(0);
    });
    requestAnimationFrame(frame);
  }
  if(reduce){chars.forEach(function(c){c.el.style.fontWeight=600})}else{requestAnimationFrame(frame)}
})();
```

Tweak: `radius` = how far the cursor reaches, `200+600*f` = min/max weight, `.14` = smoothing (lower is slower).

---

## 2. Photo animation

Effects: upward wipe reveal, floating, morphing shape, 3D tilt toward the cursor, moving light sheen, grayscale to colour on hover, and a spinning "Open for work" badge.

### HTML

```html
<div class="photo">
  <div class="frame" id="frame">
    <img id="pic" src="your-photo.jpg" alt="Portrait of Alex Rivera">
  </div>
  <svg class="badge" viewBox="0 0 120 120" aria-hidden="true">
    <defs><path id="ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
    <text><textPath href="#ring">Open for work • Open for work • </textPath></text>
    <circle cx="60" cy="60" r="7" fill="var(--accent)"/>
  </svg>
</div>
```

### CSS

```css
:root{--bg:#2A2FE0;--ink:#F3F0FF;--soft:#B9BCFF;--accent:#FFB4C8}

.photo{position:absolute;z-index:1;right:clamp(20px,6vw,100px);top:50%;
  width:clamp(170px,27vw,440px);aspect-ratio:4/5;
  margin-top:calc(clamp(170px,27vw,440px)*-.56);
  clip-path:inset(100% 0 0 0);perspective:900px}

/* 1. reveal: wipes up after the page loads */
.in .photo{animation:reveal 1.3s .55s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes reveal{to{clip-path:inset(-30% -30% -30% -30%)}}

.frame{display:block;position:relative;width:100%;height:100%;overflow:hidden;background:var(--soft);
  border-radius:50% 50% 6% 6% / 40% 40% 5% 5%;
  /* 2. morph + float, always running */
  animation:morph 9s ease-in-out infinite, float 6s ease-in-out infinite;
  /* 3. tilt toward the cursor (values set by JS) */
  transform:rotateY(var(--ry,0deg)) rotateX(var(--rx,0deg));
  transition:transform .25s ease-out}
@keyframes morph{
  0%,100%{border-radius:50% 50% 6% 6% / 40% 40% 5% 5%}
  50%{border-radius:42% 58% 48% 52% / 50% 36% 64% 50%}}
@keyframes float{0%,100%{translate:0 0}50%{translate:0 -14px}}

.frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  filter:grayscale(1) contrast(1.05);transition:filter .5s}   /* 4. colour on hover */
.frame:hover img{filter:none}

/* 5. light sheen that follows the cursor (--mx / --my set by JS) */
.frame::after{content:"";position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;
  background:radial-gradient(circle at var(--mx,50%) var(--my,25%),rgba(255,255,255,.7),transparent 50%)}

/* 6. spinning badge */
.badge{position:absolute;left:-12%;bottom:-5%;width:30%;animation:spin 14s linear infinite;
  fill:var(--ink);font-size:11px;font-weight:600;letter-spacing:.14em}
@keyframes spin{to{rotate:360deg}}

@media (max-width:600px){.photo{width:46vw;margin-top:-30vw}}
@media (prefers-reduced-motion:reduce){
  .photo{clip-path:none!important;animation:none!important}
  .frame{transform:none!important;animation:none!important}
  .badge{animation:none}}
```

### JavaScript (tilt + sheen)

```js
var fr=document.getElementById('frame');
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
addEventListener('pointermove',function(e){
  if(reduce) return;
  fr.style.setProperty('--ry',((e.clientX/innerWidth-.5)*14).toFixed(1)+'deg');
  fr.style.setProperty('--rx',((.5-e.clientY/innerHeight)*10).toFixed(1)+'deg');
  var r=fr.getBoundingClientRect();
  fr.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(0)+'%');
  fr.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(0)+'%');
},{passive:true});
```

Tweak: `*14` and `*10` = tilt strength in degrees, `9s` = morph speed, `-14px` = float height, `14s` = badge spin speed.

---

## Notes

- Both animations respect `prefers-reduced-motion`.
- The photo's `.hero` parent needs `position:relative`, and `nav` / `.foot` should have `position:relative;z-index:3` so they sit above the photo.
- Change the badge text and the colours (`--bg`, `--accent`) to match your brand.
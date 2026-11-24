# Music section: vinyl player
 
A self-contained music section with a spinning vinyl record, an animated equalizer, a track list and a player bar. Paste the three parts (HTML, CSS, JS) into your own page.
 
## 0. Requirements
 
Add these colour variables if your page doesn't have them (change the values to match your site):
 
```css
:root{--bg:#2A2FE0;--ink:#F3F0FF;--soft:#B9BCFF;--accent:#FFB4C8}
body{background:var(--bg);color:var(--ink)}
```
 
Optional font (the same one used in the hero):
 
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&display=swap" rel="stylesheet">
```
 
```css
body{font-family:"Bricolage Grotesque",system-ui,sans-serif}
```
 
---
 
## 1. HTML
 
Put this where you want the section to appear.
 
```html
<section id="music" aria-labelledby="mt">
  <div class="deck" id="deck">
    <div class="record" aria-hidden="true"></div>
    <div class="sleeve" id="sleeve">Pick a track</div>
  </div>
  <div>
    <h2 id="mt">Music</h2>
    <p class="sub">Tracks I’ve written and produced. Press play.</p>
    <ul class="tracks" id="tracks"></ul>
    <div class="ctl">
      <button id="pp">Play</button>
      <div class="bar"><span id="fill"></span></div>
      <time id="tm">0:00 / 0:00</time>
    </div>
  </div>
</section>
```
 
---
 
## 2. CSS
 
```css
*{box-sizing:border-box;margin:0}
 
#music{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,6vw,100px);align-items:center;
  padding:clamp(70px,10vw,150px) clamp(20px,3vw,40px);
  border-top:1px solid color-mix(in srgb,var(--ink) 25%,transparent)}
@media (max-width:800px){#music{grid-template-columns:1fr}}
 
/* record + sleeve */
.deck{position:relative;aspect-ratio:1;width:100%;max-width:540px}
.sleeve{position:absolute;inset:0 16% 0 0;z-index:2;border-radius:18px;padding:22px;
  display:flex;align-items:flex-end;color:#1B1FA8;font-weight:700;
  font-size:clamp(24px,3.2vw,46px);line-height:.95;letter-spacing:-.02em;
  background:radial-gradient(circle at 25% 20%,#fff6 0,#fff0 40%),
             linear-gradient(135deg,var(--accent),#8A6CFF 65%,#4B50FF);
  box-shadow:0 30px 60px #0005}
.record{position:absolute;z-index:1;top:4%;bottom:4%;right:0;aspect-ratio:1;border-radius:50%;
  transform:translateX(-14%);                       /* hidden inside the sleeve */
  transition:transform .9s cubic-bezier(.2,.8,.2,1);
  animation:spin 3s linear infinite;animation-play-state:paused;
  background:conic-gradient(transparent 0 18%,#fff3 25%,transparent 32% 68%,#fff3 75%,transparent 82%),
             repeating-radial-gradient(circle,#0c0c14 0 2px,#1b1b26 2px 4px)}
.record::after{content:"";position:absolute;inset:36%;border-radius:50%;
  background:var(--accent);box-shadow:0 0 0 6px #0c0c14 inset}
.playing .record{transform:translateX(0);animation-play-state:running}   /* slides out and spins */
@keyframes spin{to{rotate:360deg}}
 
/* heading */
#music h2{font-size:clamp(44px,7vw,110px);line-height:.9;letter-spacing:-.03em;font-weight:700}
.sub{margin:14px 0 28px;color:var(--soft);font-size:clamp(17px,1.6vw,22px)}
 
/* track list */
.tracks{list-style:none;padding:0}
.track{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:14px;width:100%;
  padding:18px 6px;background:none;border:0;
  border-top:1px solid color-mix(in srgb,var(--ink) 20%,transparent);
  color:inherit;font:inherit;text-align:left;cursor:pointer}
.track .n{font-weight:500;font-size:clamp(20px,2.4vw,32px);transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.track:hover .n,.track.on .n{transform:translateX(10px)}
.track small{display:block;color:var(--soft);font-size:15px;font-weight:400;margin-top:2px}
.track:focus-visible{outline:3px solid var(--accent);outline-offset:-3px}
 
/* equalizer bars (only visible on the active track) */
.eq{display:flex;gap:3px;align-items:flex-end;height:22px;opacity:0}
.on .eq{opacity:1}
.eq i{width:4px;height:25%;background:var(--accent);animation:bar .8s ease-in-out infinite alternate;animation-play-state:paused}
.playing .on .eq i{animation-play-state:running}
.eq i:nth-child(2){animation-delay:-.3s}
.eq i:nth-child(3){animation-delay:-.6s}
.eq i:nth-child(4){animation-delay:-.15s}
@keyframes bar{to{height:100%}}
 
/* player bar */
.ctl{display:flex;align-items:center;gap:16px;margin-top:20px}
.ctl button{background:var(--accent);color:#1B1FA8;border:0;border-radius:999px;padding:12px 24px;
  font-weight:600;font-size:16px;font-family:inherit;cursor:pointer}
.ctl button:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
.bar{flex:1;height:4px;border-radius:4px;background:color-mix(in srgb,var(--ink) 25%,transparent);overflow:hidden}
.bar span{display:block;height:100%;width:0;background:var(--accent)}
.ctl time{font-variant-numeric:tabular-nums;color:var(--soft);min-width:84px;text-align:right}
 
@media (prefers-reduced-motion:reduce){.record,.eq i{animation:none}.record{transition:none}}
```
 
---
 
## 3. JavaScript
 
Put this just before `</body>`.
 
```html
<script>
(function(){
  /* EDIT YOUR TRACKS HERE
     t = title, m = genre and year, d = length in seconds
     src = path to your audio file, e.g. "audio/night-bus-home.mp3"
     Leave src empty and it runs as a visual demo with no sound. */
  var T=[
    {t:'Night Bus Home',m:'Ambient, 2026',d:214,src:''},
    {t:'Paper Lanterns',m:'Lo-fi, 2025',d:187,src:''},
    {t:'Slow Static',m:'Electronic, 2025',d:241,src:''},
    {t:'Kathmandu Rain',m:'Cinematic, 2024',d:268,src:''}
  ];
 
  var ul=document.getElementById('tracks'),deck=document.getElementById('deck'),sl=document.getElementById('sleeve'),
      pp=document.getElementById('pp'),fill=document.getElementById('fill'),tm=document.getElementById('tm');
  var cur=-1,playing=false,pos=0,au=null;
 
  function f(s){s=Math.floor(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
 
  T.forEach(function(x,i){
    var li=document.createElement('li'),b=document.createElement('button');b.className='track';
    b.innerHTML='<span class="eq"><i></i><i></i><i></i><i></i></span><span class="n">'+x.t+'<small>'+x.m+'</small></span><span>'+f(x.d)+'</span>';
    b.onclick=function(){i===cur?toggle():load(i,true)};
    li.appendChild(b);ul.appendChild(li);
  });
 
  function paint(){
    ul.querySelectorAll('.track').forEach(function(b,i){b.classList.toggle('on',i===cur)});
    deck.classList.toggle('playing',playing);
    document.getElementById('music').classList.toggle('playing',playing);
    pp.textContent=playing?'Pause':'Play';
    sl.textContent=cur<0?'Pick a track':T[cur].t;
  }
  function load(i,go){
    if(au){au.pause();au=null}
    cur=i;pos=0;
    if(T[i].src){au=new Audio(T[i].src)}
    playing=!!go;
    if(au&&go)au.play().catch(function(){});
    paint();
  }
  function toggle(){
    if(cur<0){load(0,true);return}
    playing=!playing;
    if(au){playing?au.play().catch(function(){}):au.pause()}
    paint();
  }
  pp.onclick=toggle;
 
  setInterval(function(){
    if(cur<0)return;
    var d=T[cur].d;
    if(au){pos=au.currentTime;d=au.duration||d}else if(playing){pos+=.25}
    fill.style.width=Math.min(100,pos/d*100)+'%';
    tm.textContent=f(pos)+' / '+f(d);
    if(playing&&pos>=d){load((cur+1)%T.length,true)}   /* next track */
  },250);
})();
</script>
```
 
---
 
## Customising
 
| What | Where |
|---|---|
| Track names, genre, length | the `T` array in the JS |
| Real audio | add `src:"path/to/file.mp3"` to a track |
| Sleeve colours (album cover) | the `linear-gradient` in `.sleeve` |
| Sleeve with a real cover image | replace the `background` in `.sleeve` with `background:url(cover.jpg) center/cover` |
| Record speed | `3s` in `.record` (`animation:spin 3s`) |
| Colours | the four variables in `:root` |
 
## Notes
 
- The record slides out and spins when a track plays and stops when you pause.
- The motion stops for people who have "reduce motion" turned on.
- If your page already has `*{box-sizing:border-box;margin:0}` or its own `@keyframes spin`, you can remove the duplicates.
 
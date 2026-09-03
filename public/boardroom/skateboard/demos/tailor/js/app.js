const track = document.getElementById('track');
const progress = document.getElementById('progress');
const chapterInd = document.getElementById('chapter-ind');
const counter = document.getElementById('counter');
const wheelHint = document.getElementById('wheel-hint');
const visitScroll = document.getElementById('visit-scroll');
const chapterPrev = document.getElementById('chapter-prev');
const chapterNext = document.getElementById('chapter-next');
const chapters = track ? Array.from(track.querySelectorAll('.chapter')) : [];
const total = chapters.length || 5;
let currentIndex = 0;
let targetIndex = 0;
let isAnimating = false;
let currentX = 0;
let targetX = 0;
const chaptersMeta = [
  {n:'01', name:'Arrival'},
  {n:'02', name:'Atelier'},
  {n:'03', name:'Collection'},
  {n:'04', name:'Details'},
  {n:'05', name:'Boutiques'}
];

function isMobile(){ return window.innerWidth <= 900 }
function pad(n){ return String(n).padStart(2,'0') }

function updateUI(idx){
  const topnav = document.getElementById('topnav');
  if(topnav) topnav.style.color = idx === 3 ? '#B8B3A8' : '';
  document.querySelectorAll('nav#topnav .links a[data-goto]').forEach(link=>{
    const isCurrent = parseInt(link.dataset.goto,10) === idx && idx > 0;
    link.classList.toggle('is-current', isCurrent);
    link.toggleAttribute('aria-current', isCurrent);
  });
  const m = chaptersMeta[idx];
  if(chapterInd && m) chapterInd.innerHTML = `<div class="cur">${m.n}</div><div class="meta">${m.name}<br>${pad(idx+1)} / ${pad(total)}</div>`;
  if(counter) counter.textContent = `${pad(idx+1)} — ${pad(total)}`;
  if(progress){
    const p = total > 1 ? idx/(total-1) : 1;
    progress.style.setProperty('--p', p);
    progress.style.transform = `scaleX(${p})`;
  }
  if(chapterPrev) chapterPrev.hidden = idx <= 0;
  if(chapterNext) chapterNext.hidden = idx >= total-1;
  chapters.forEach((ch,i)=>{
    ch.classList.toggle('active', i===idx);
    if(i===idx){
      ch.querySelectorAll('.reveal').forEach((el,j)=>setTimeout(()=>el.classList.add('in'),j*120));
      ch.querySelectorAll('.img-reveal').forEach((el,j)=>setTimeout(()=>el.classList.add('in'),j*150+200));
    }
  });
}

function goTo(index){
  if(!track) return;
  index = Math.max(0, Math.min(total-1, index));

  if(isMobile()){
    targetIndex=index;
    currentIndex=index;
    isAnimating=false;
    wheelHint?.classList.add('hide');
    chapters[index]?.scrollIntoView({behavior:'smooth',block:'start'});
    updateUI(index);
    return;
  }

  if(index===targetIndex && isAnimating) return;
  targetIndex=index;
  targetX=-index*window.innerWidth;
  isAnimating=true;
  wheelHint?.classList.add('hide');
}

function lerp(a,b,t){ return a+(b-a)*t }
function animate(){
  if(track){    currentX=lerp(currentX,targetX,0.08);
    if(Math.abs(currentX-targetX)<0.5){
      currentX=targetX;
      if(isAnimating){ currentIndex=targetIndex; updateUI(currentIndex); isAnimating=false; }
    }
    track.style.transform=`translate3d(${currentX}px,0,0)`;
  }
  requestAnimationFrame(animate);
}
function getInitialChapterIndex(){
  if(location.hash==='#boutiques') return total-1;
  if(location.hash==='#collection') return 2;
  return 0;
}
if(track){
  const initialIndex = getInitialChapterIndex();
  currentIndex = initialIndex;
  targetIndex = initialIndex;
  currentX = -initialIndex * window.innerWidth;
  targetX = currentX;
  track.style.transform = `translate3d(${currentX}px,0,0)`;
  animate();
  updateUI(initialIndex);
}

let wheelAcc=0;
let wheelTimeout=null;
function handleWheel(e){
  if(!track || isMobile()) return;
  if(isAnimating){ e.preventDefault(); return; }

  // Final chapter opens vertically: Wāperiki -> Milan.
  // At the very top, an upward scroll returns to Craft.
  if(targetIndex===total-1 && visitScroll){
    if(e.deltaY < 0 && visitScroll.scrollTop <= 1){
      e.preventDefault();
      goTo(total-2);
    }
    return;
  }

  e.preventDefault();
  wheelAcc += e.deltaY;
  clearTimeout(wheelTimeout);
  wheelTimeout=setTimeout(()=>{wheelAcc=0},300);
  if(Math.abs(wheelAcc)<40) return;
  goTo(wheelAcc>0 ? targetIndex+1 : targetIndex-1);
  wheelAcc=0;
}
window.addEventListener('wheel',handleWheel,{passive:false});

let touchStartX=0,touchStartY=0;
window.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY},{passive:true});
window.addEventListener('touchend',e=>{
  if(!track) return;
  const dx=e.changedTouches[0].clientX-touchStartX;
  const dy=e.changedTouches[0].clientY-touchStartY;

  if(isMobile()){
    // Mobile uses the browser's native vertical chapter scroll.
    return;
  }

  if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>60){
    goTo(dx<0 ? targetIndex+1 : targetIndex-1);
  }
},{passive:true});

chapterPrev?.addEventListener('click',()=>goTo(targetIndex-1));
chapterNext?.addEventListener('click',()=>goTo(targetIndex+1));
document.querySelectorAll('[data-goto]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goTo(parseInt(a.dataset.goto,10))}));
window.addEventListener('keydown',e=>{
  if(!track) return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='PageDown') goTo(targetIndex+1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='PageUp') goTo(targetIndex-1);
});

// Collection lookbook: explicit controls only. The wheel remains chapter navigation.
const lookSlides=Array.from(document.querySelectorAll('.lookbook-slide'));
const lookCount=document.getElementById('look-count');
let lookIndex=0;
function showLook(index){
  if(!lookSlides.length) return;
  lookIndex=(index+lookSlides.length)%lookSlides.length;
  lookSlides.forEach((slide,i)=>slide.classList.toggle('active',i===lookIndex));
  if(lookCount) lookCount.textContent=`${pad(lookIndex+1)} / ${pad(lookSlides.length)}`;
}
document.getElementById('look-prev')?.addEventListener('click',()=>showLook(lookIndex-1));
document.getElementById('look-next')?.addEventListener('click',()=>showLook(lookIndex+1));
showLook(0);

// Mobile Visit is a simple two-panel horizontal ending.
const visitTabs=Array.from(document.querySelectorAll('[data-visit-panel]'));
function showVisitPanel(index, smooth=true){
  if(!visitScroll) return;
  const panel=Math.max(0,Math.min(1,index));
  visitScroll.scrollTo({left:panel*visitScroll.clientWidth,top:0,behavior:smooth?'smooth':'auto'});
  visitTabs.forEach((button,i)=>button.classList.toggle('active',i===panel));
}
visitTabs.forEach((button,i)=>button.addEventListener('click',()=>showVisitPanel(i)));
visitScroll?.addEventListener('scroll',()=>{
  if(!isMobile()) return;
  const panel=visitScroll.clientWidth ? Math.round(visitScroll.scrollLeft/visitScroll.clientWidth) : 0;
  visitTabs.forEach((button,i)=>button.classList.toggle('active',i===panel));
},{passive:true});

// Reset to Wāperiki whenever Visit is entered directly.
document.querySelector('a[data-goto="4"]')?.addEventListener('click',()=>showVisitPanel(0,false));

window.addEventListener('resize',()=>{
  if(track){
    targetX=-targetIndex*window.innerWidth;
    currentX=targetX;
    track.style.transform=`translate3d(${currentX}px,0,0)`;
  }
});



if(isMobile() && chapters.length){
  const chapterObserver=new IntersectionObserver(entries=>{
    const visible=entries
      .filter(entry=>entry.isIntersecting)
      .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    const idx=chapters.indexOf(visible.target);
    if(idx>=0 && idx!==currentIndex){
      currentIndex=idx;
      targetIndex=idx;
      updateUI(idx);
    }
  },{threshold:[.45,.6,.75]});
  chapters.forEach(chapter=>chapterObserver.observe(chapter));
}

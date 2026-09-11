(()=>{
const data=JSON.parse(document.querySelector('#stage-data').textContent),planes=[...document.querySelectorAll('[data-plane]')],copies=[...document.querySelectorAll('[data-copy]')],dots=[...document.querySelectorAll('[data-index]')];
const count=planes.length,reduced=matchMedia('(prefers-reduced-motion: reduce)');
let target=0,position=0,from=0,start=0,frame=0,moving=false,lastWheel=0,wheelSum=0,gestureUsed=false,touch=null,expanded=false,closing=false,releaseTimer=0,detailReadyTimer=0;
const saved=Number(new URLSearchParams(location.hash.slice(1)).get('project'));
if(Number.isInteger(saved)&&saved>=1&&saved<=count)position=target=saved-1;
const rgb=h=>h.match(/[a-f\d]{2}/gi).map(n=>parseInt(n,16));
function render(){
 const a=Math.max(0,Math.min(count-1,Math.floor(position))),b=Math.min(count-1,a+1),mix=Math.max(0,Math.min(1,position-a)),c1=rgb(data.colors[a%data.colors.length]),c2=rgb(data.colors[b%data.colors.length]);
 document.body.style.backgroundColor=`rgb(${c1.map((v,i)=>Math.round(v+(c2[i]-v)*mix)).join(',')})`;
 const mobile=innerWidth<=760,step=innerHeight*(mobile?.57:.72),speed=moving?Math.sin(Math.PI*Math.min(1,(performance.now()-start)/880)):0;
 planes.forEach((el,i)=>{const d=i-position;el.style.transform=`translate3d(${-d*(mobile?35:75)}px,${d*step}px,${-Math.abs(d)*85}px) rotateZ(${-3-speed*1.5}deg) rotateY(${-5+speed*2}deg) skewX(${-16-speed*3}deg)`;el.style.opacity=String(Math.max(0,1-Math.abs(d)*.55));el.style.pointerEvents=i===target?'auto':'none';el.tabIndex=i===target?0:-1;el.setAttribute('aria-hidden',String(i!==target));});
 copies.forEach((el,i)=>{const d=i-position;el.style.opacity=String(Math.max(0,1-Math.abs(d)*2.5));el.style.transform=`translate3d(0,${d*(mobile?45:75)}px,0)`;});
}
function announce(){copies.forEach((el,i)=>{el.inert=i!==target;el.setAttribute('aria-hidden',String(i!==target))});dots.forEach((el,i)=>i===target?el.setAttribute('aria-current','true'):el.removeAttribute('aria-current'));document.querySelector('#announcement').textContent=`${target+1} / ${count}，${data.projects[target]}`;history.replaceState(null,'','#project='+(target+1));}
function tick(now){const t=Math.min(1,(now-start)/880),ease=1-Math.pow(1-t,4);position=from+(target-from)*ease;render();if(t<1)frame=requestAnimationFrame(tick);else{moving=false;position=target;render();}}
function go(n){if(expanded||closing)return;n=Math.max(0,Math.min(count-1,n));if(n===target)return;clearTimeout(releaseTimer);cancelAnimationFrame(frame);from=position;target=n;announce();if(reduced.matches){position=n;moving=false;render();return}moving=true;start=performance.now();frame=requestAnimationFrame(tick)}
// A short gesture previews the next card against resistance, then settles back.
function settle(){
 cancelAnimationFrame(frame);wheelSum=0;
 if(reduced.matches){position=target;render();return}
 const origin=position,began=performance.now();
 function rebound(now){
  const t=Math.min(1,(now-began)/460);
  position=target+(origin-target)*(1-t)**3;
  render();if(t<1)frame=requestAnimationFrame(rebound);else{position=target;render()}
 }
 frame=requestAnimationFrame(rebound);
}
addEventListener('wheel',e=>{
 if(expanded)return;
 if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 e.preventDefault();const now=performance.now();
 if(now-lastWheel>180){wheelSum=0;gestureUsed=false}
 lastWheel=now;if(moving||closing||gestureUsed)return;
 clearTimeout(releaseTimer);cancelAnimationFrame(frame);
 const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
 if(Math.sign(wheelSum)!==Math.sign(delta))wheelSum=0;
 wheelSum+=delta;
 const direction=Math.sign(wheelSum),next=target+direction,edge=next<0||next>=count;
 if(Math.abs(wheelSum)>=185&&!edge){gestureUsed=true;go(next);wheelSum=0;return}
 if(!reduced.matches){
  const resistance=(1-Math.exp(-Math.abs(wheelSum)/220))*(edge?.06:.21);
  position=target+direction*resistance;render();
 }
 releaseTimer=setTimeout(settle,150);
},{passive:false});
addEventListener('keydown',e=>{if(expanded){if(e.key==='Escape'){e.preventDefault();closeProject();}return;}if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(['ArrowDown','PageDown','ArrowUp','PageUp','Home','End'].includes(e.key)){e.preventDefault();if(moving)return;go(e.key==='Home'?0:e.key==='End'?count-1:target+(['ArrowDown','PageDown'].includes(e.key)?1:-1))}});
dots.forEach((el,i)=>el.addEventListener('click',()=>go(i)));
addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null},{passive:true});
addEventListener('touchend',e=>{if(!touch||moving||expanded)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx))go(target+(dy<0?1:-1))},{passive:true});
const homeControl=document.querySelector('#home-control'),homeLabel=homeControl.textContent;
const pagination=document.querySelector('.pagination');
const stage=document.querySelector('.stage'),details=[...document.querySelectorAll('[data-detail]')];
const storyCards=[...document.querySelectorAll('.story-card')];
if(reduced.matches||!('IntersectionObserver' in globalThis))storyCards.forEach(el=>el.classList.add('is-visible'));
else{
 const storyObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');storyObserver.unobserve(entry.target)}}),{root:stage,threshold:.18});
 storyCards.forEach(el=>storyObserver.observe(el));
}
const scrollCue=document.querySelector('.scroll-cue');
scrollCue.addEventListener('click',()=>{if(expanded)stage.scrollTo({top:innerHeight,behavior:reduced.matches?'instant':'smooth'})});
let detailScrollFrame=0;
function updateDetailScroll(){
 detailScrollFrame=0;
 const y=Math.max(0,stage.scrollTop);
 const cueSize=scrollCue.offsetWidth;
 const cueShift=Math.min(y*.65,cueSize);
 stage.style.setProperty('--cue-shift',cueShift+'px');
 scrollCue.inert=cueShift>=cueSize*.85;
 if(y>1&&!document.body.classList.contains('detail-ready')){
  clearTimeout(detailReadyTimer);
  document.body.classList.add('detail-ready');
 }
 const titleProgress=Math.max(0,Math.min(1,(y-innerHeight*.04)/(innerHeight*.32)));
 stage.style.setProperty('--cover-shift',Math.min(y,innerHeight*1.2)*.78+'px');
 stage.style.setProperty('--title-shift',-titleProgress*90+'px');
 stage.style.setProperty('--title-opacity',String(1-titleProgress));
}
stage.addEventListener('scroll',()=>{
 if(expanded&&!detailScrollFrame)detailScrollFrame=requestAnimationFrame(updateDetailScroll);
},{passive:true});
function openProject(e){
 e.preventDefault();if(expanded||closing||moving)return;
 clearTimeout(releaseTimer);cancelAnimationFrame(frame);position=target;render();
 expanded=true;
 details.forEach((el,i)=>{el.hidden=i!==target});
 stage.scrollTop=0;
 stage.style.setProperty('--cue-shift','0px');scrollCue.inert=false;
 stage.style.setProperty('--cover-shift','0px');
 stage.style.setProperty('--title-shift','0px');
 stage.style.setProperty('--title-opacity','1');
 document.body.style.setProperty('--detail-bg',['#60f5d4','#cfbd94','#d7c4ec'][target%3]);
 planes[target].classList.add('selected-plane');
 document.body.classList.add('project-expanded');
 clearTimeout(detailReadyTimer);
 detailReadyTimer=setTimeout(()=>{if(expanded)document.body.classList.add('detail-ready')},900);
 homeControl.textContent='← BACK HOME';
 pagination.inert=true;
 copies[target].querySelector('a').tabIndex=-1;
 document.querySelector('#announcement').textContent=data.projects[target]+'，已展开。按 Escape 返回。';
 homeControl.focus({preventScroll:true});
}
function closeProject(){
 if(!expanded)return;
 expanded=false;closing=true;
 clearTimeout(detailReadyTimer);
 document.body.classList.remove('detail-ready');
 stage.style.setProperty('--cover-shift','0px');
 stage.style.setProperty('--title-shift','0px');
 stage.style.setProperty('--title-opacity','1');
 stage.scrollTop=0;details.forEach(el=>{el.hidden=true});
 planes[target].classList.add('returning-plane');
 setTimeout(()=>{planes.forEach(el=>el.classList.remove('returning-plane'));closing=false},1000);
 document.body.classList.remove('project-expanded');
 planes.forEach(el=>el.classList.remove('selected-plane'));
 homeControl.textContent=homeLabel;pagination.inert=false;
 copies[target].querySelector('a').tabIndex=0;
 planes[target].focus({preventScroll:true});
 announce();render();
}
homeControl.addEventListener('click',e=>{e.preventDefault();closeProject()});
planes.forEach(el=>el.addEventListener('click',openProject));
copies.forEach(el=>el.querySelector('a').addEventListener('click',openProject));
addEventListener('resize',()=>{render();if(expanded)updateDetailScroll()});addEventListener('pageshow',()=>{render()});announce();render();

document.querySelectorAll('[data-rail]').forEach(block=>{
 const track=block.querySelector('[data-track]');
 if(!track)return;
 const items=[...track.querySelectorAll('figure')];
 if(!items.length)return;
 const counter=block.querySelector('[data-rail-counter]');
 const prevBtn=block.querySelector('[data-rail-prev]');
 const nextBtn=block.querySelector('[data-rail-next]');
 const total=String(items.length).padStart(2,'0');
 const padLeft=()=>parseFloat(getComputedStyle(track).paddingLeft)||0;
 const instant=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function nearest(){
  const base=track.getBoundingClientRect().left+padLeft();
  let best=Infinity,idx=0;
  items.forEach((el,i)=>{const d=Math.abs(el.getBoundingClientRect().left-base);if(d<best){best=d;idx=i}});
  if(track.scrollLeft+track.clientWidth>=track.scrollWidth-2)idx=items.length-1;
  return idx;
 }
 function sync(){
  if(counter)counter.textContent='('+String(nearest()+1).padStart(2,'0')+' / '+total+')';
  if(prevBtn)prevBtn.disabled=track.scrollLeft<=2;
  if(nextBtn)nextBtn.disabled=track.scrollWidth>0&&track.scrollLeft+track.clientWidth>=track.scrollWidth-2;
 }
 function go(step){
  const i=Math.min(items.length-1,Math.max(0,nearest()+step));
  const left=track.scrollLeft+items[i].getBoundingClientRect().left-track.getBoundingClientRect().left-padLeft();
  track.scrollTo({left:left,behavior:instant()?'instant':'smooth'});
 }
 if(prevBtn)prevBtn.addEventListener('click',()=>go(-1));
 if(nextBtn)nextBtn.addEventListener('click',()=>go(1));
 track.addEventListener('scroll',sync,{passive:true});
 track.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'){e.preventDefault();go(1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}
 });
 addEventListener('resize',sync);
 if(window.IntersectionObserver)new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))sync()}).observe(block);
 sync();
});
})();

document.querySelectorAll('[data-pal-track]').forEach(track=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let down=false,startX=0,startLeft=0;
 track.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch')return;
  down=true;startX=e.clientX;startLeft=track.scrollLeft;
  track.classList.add('dragging');
  try{track.setPointerCapture(e.pointerId)}catch(_){}
 });
 track.addEventListener('pointermove',e=>{if(down)track.scrollLeft=startLeft-(e.clientX-startX)});
 const release=e=>{
  if(!down)return;down=false;track.classList.remove('dragging');
  try{track.releasePointerCapture(e.pointerId)}catch(_){}
 };
 track.addEventListener('pointerup',release);
 track.addEventListener('pointercancel',release);
 track.addEventListener('dragstart',e=>e.preventDefault());
 track.addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
  e.preventDefault();
  const step=track.clientWidth*.7*(e.key==='ArrowRight'?1:-1);
  track.scrollBy({left:step,behavior:reduced?'instant':'smooth'});
 });
});

/* 换页滑动：遮罩从右往左扫过；离开时从右边盖过来，进入时继续往左退开 */
(function(){
 var root=document.documentElement;
 if(!root.classList.contains('anim'))return;
 if(!document.querySelector('.page-veil')||matchMedia('(prefers-reduced-motion: reduce)').matches){
  root.classList.remove('anim');return;
 }
 var settle=function(){root.classList.remove('ready');root.classList.add('idle')};
 requestAnimationFrame(function(){requestAnimationFrame(function(){
  root.classList.add('ready');
  setTimeout(settle,580);
 })});
 addEventListener('pageshow',function(e){
  if(e.persisted){root.classList.remove('leaving');root.classList.add('idle')}
 });
 window.wipeTo=function(href){
  root.classList.remove('ready');root.classList.remove('idle');
  root.classList.add('leaving');
  setTimeout(function(){location.href=href},380);
 };
 document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[data-wipe]');
  if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();
  window.wipeTo(a.getAttribute('href'));
 });
})();

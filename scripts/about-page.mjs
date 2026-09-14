import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';

export function buildAbout(profile){
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 writeFileSync('out/about.css',readFileSync('app/about.css','utf8'));
 writeFileSync('out/about.js',readFileSync('scripts/about.js','utf8'));

 const photos=(profile.photos||[]).map((ph,i)=>`<img class="ph ph-${i+1}" src="${esc(ph.image)}" alt="${esc(ph.alt)}" loading="lazy" decoding="async">`).join('');

 const edu=(profile.education||[]).map(e=>`<article class="entry"><div><h3>${esc(e.school)}${e.schoolEn?`<small>${esc(e.schoolEn)}</small>`:''}</h3>${e.degree?`<p class="line">${esc(e.degree)}</p>`:''}${e.note?`<p class="note">${esc(e.note)}</p>`:''}</div><span class="entry-period">${esc(e.period)}</span></article>`).join('');

 const skills=(profile.skills||[]).map(s=>`<article class="entry"><div><h3>${esc(s.title)}</h3>${s.items?`<p class="line">${esc(s.items)}</p>`:''}${s.note?`<p class="note">${esc(s.note)}</p>`:''}</div></article>`).join('');

 const pals=(profile.companions||[]).map(c=>`<article class="pal"><h3>${esc(c.name)}</h3><div class="pal-track" data-pal-track tabindex="0" role="group" aria-label="${esc(c.name)}的照片，可左右滑动">${c.photos.map(ph=>`<img src="${esc(ph.image)}" alt="${esc(ph.alt||c.name)}" loading="lazy" decoding="async" draggable="false">`).join('')}</div></article>`).join('');
 const palsBlock=pals?`<div class="about-pals"><h2>Companions<small>我的伙伴</small></h2>${pals}</div>`:'<div></div>';

 const body=`<header class="about-head"><a href="/" data-wipe>${esc(profile.name)}</a><a class="back" href="/" data-wipe>WORK <span aria-hidden="true">↗</span></a></header>`
  +`<main class="about">`
  +`<p class="about-kicker">ABOUT ME</p>`
  +`<section class="about-block"><div class="about-left">${photos?`<div class="about-photos">${photos}</div>`:''}<h1 class="about-lead">你好，我是${esc(profile.nameZh||profile.firstName)}。</h1></div><div class="about-block-body"><h2>Education<small>教育背景</small></h2><div class="about-entries">${edu}</div></div></section>`
  +`<section class="about-block">${palsBlock}<div class="about-block-body"><h2>Skills<small>技能</small></h2><div class="about-entries">${skills}</div></div></section>`
  +`</main>`;

 mkdirSync('out/about',{recursive:true});
 writeFileSync('out/about/index.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>关于我 — ${esc(profile.name)}</title><meta name="description" content="${esc(profile.nameZh||profile.name)}的教育背景与技能"><link rel="stylesheet" href="/about.css"><script>document.documentElement.className+=' anim'</script><script>var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?442192775c6eee370de389c41f57b351";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();</script></head><body><div class="page-veil" aria-hidden="true"></div>${body}<script src="/about.js" defer></script></body></html>`);
}

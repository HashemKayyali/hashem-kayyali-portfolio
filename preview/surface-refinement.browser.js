async page=>{
 await page.bringToFront();await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:5176/preview/en/');
 const state=await page.evaluate(async()=>{
  const {THEMES,applyTheme}=await import('/preview/themes.ts');applyTheme('rose',false);
  const expected=THEMES.find(t=>t.id==='rose').colors.panel;
  const resolve=hex=>{const e=document.createElement('i');e.style.color=hex;document.body.append(e);const v=getComputedStyle(e).color;e.remove();return v;};
  const title=document.querySelector('#vision-work-title'),s=getComputedStyle(title);
  return {expected:resolve(expected),eventies:getComputedStyle(document.querySelector('.pulse-scene--0 .pulse-scene-surface')).backgroundColor,board:getComputedStyle(document.querySelector('.story-board')).backgroundColor,caption:getComputedStyle(document.querySelector('.shared-hero-portrait figcaption')).backgroundColor,titleHeight:title.getBoundingClientRect().height,lineHeight:parseFloat(s.lineHeight),illustrations:[...document.querySelectorAll('.story-sheet-image img')].map(i=>i.getAttribute('src'))};
 });
 if(state.eventies!==state.expected||state.board!==state.expected||state.caption!=='rgba(0, 0, 0, 0)'||state.titleHeight>state.lineHeight+1||state.illustrations.some(p=>!p.startsWith('/engineering-process/')))throw Error(JSON.stringify(state));
 return {passed:true,state};
}

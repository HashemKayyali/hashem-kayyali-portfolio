async(page)=>{
 const ids=['bike-tower','terminal-nfc','eventies','glitzz-lab','basket-beats','vr-cycling','bike-land-trainer','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics'],rows=[],errors=[];
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await context.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const locale of ['en','ar','de','fr','es'])for(const id of ids){
  await p.goto('http://127.0.0.1:4176/preview/'+locale+'/projects/'+id+'/');await p.locator('.signature-case').waitFor();await p.waitForTimeout(300);
  rows.push(await p.evaluate(({locale,id})=>({locale,id,dir:document.documentElement.dir,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),h1:document.querySelector('h1').textContent,narrative:document.querySelectorAll('.case-chapter').length,privateImages:[...document.querySelectorAll('img')].map(x=>x.currentSrc).filter(x=>x.includes('umniah-youthconnect/screenshot')||/glitzz-lab.*screenshot-0[67]/.test(x))}),{locale,id}));
 }
 await context.close();
 const modes=[];
 for(const mode of ['reduced','low-power','worker-unavailable','high-dpr']){
  const c=await page.context().browser().newContext({viewport:{width:mode==='high-dpr'?1920:390,height:mode==='high-dpr'?1000:844},isMobile:mode!=='high-dpr',hasTouch:mode!=='high-dpr',reducedMotion:mode==='reduced'?'reduce':'no-preference',deviceScaleFactor:mode==='high-dpr'?3:1});
  if(mode==='low-power')await c.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2}));
  if(mode==='worker-unavailable')await c.addInitScript(()=>{window.Worker=class{constructor(){throw Error('Worker unavailable for controlled fallback check');}};});
  const q=await c.newPage();await q.goto('http://127.0.0.1:4176/preview/ar/');await q.waitForTimeout(2300);
  const row=await q.evaluate(()=>({state:document.querySelector('.home-silk').dataset.motion,canvasWidth:document.querySelector('.home-silk canvas').width,canvasHeight:document.querySelector('.home-silk canvas').height,background:getComputedStyle(document.querySelector('.home-silk')).backgroundImage,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)}));modes.push({mode,...row,workers:q.workers().length});
  await q.screenshot({path:'C:/Users/hashe/Desktop/site-v2-light-burgundy/output/playwright/design-intelligence/after-ar-'+mode+'.png'});await c.close();
 }
 return {rows,modes,errors,failures:rows.filter(r=>r.overflow||!r.h1||r.narrative<3||r.privateImages.length)};
}

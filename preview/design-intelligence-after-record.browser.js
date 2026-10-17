async(page)=>{
 const out='C:/Users/hashe/Desktop/site-v2-light-burgundy/output/playwright/design-intelligence',rows=[];
 for(const locale of ['en','ar'])for(const width of [1440,390]){
  const height=width<700?844:1000;
  const context=await page.context().browser().newContext({viewport:{width,height},reducedMotion:'no-preference',recordVideo:{dir:out+'/raw',size:{width,height}}});
  await context.addInitScript(()=>{window.designProbe={frames:[],tasks:[]};new PerformanceObserver(l=>window.designProbe.tasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});let previous=0;requestAnimationFrame(function frame(t){if(t<7000){const h=document.querySelector('.hero');window.designProbe.frames.push({t,gap:previous?t-previous:0,progress:window.__portfolioMotion?.().timelines.find(x=>x.id==='home:portrait:reveal')?.progress,clip:document.querySelector('.portrait-reveal')?.style.clipPath,finished:h?.dataset.portraitFinished,smoke:document.querySelector('.home-silk canvas')?.dataset.frame});previous=t;requestAnimationFrame(frame)}});});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4176/preview/'+locale+'/');await p.waitForTimeout(6500);
  await p.screenshot({path:out+'/after-'+locale+'-'+width+'-hero.png'});
  const probe=await p.evaluate(()=>window.designProbe),video=p.video();await p.close();await video.saveAs(out+'/after-'+locale+'-'+width+'-smoke-portrait.webm');await context.close();
  rows.push({locale,width,probe,errors});
 }
 return rows;
}

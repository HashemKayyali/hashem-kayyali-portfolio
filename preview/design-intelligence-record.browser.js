async (page) => {
 const out = 'C:/Users/hashe/Desktop/site-v2-light-burgundy/output/playwright/design-intelligence';
 const rows=[];
 for(const version of ['v1','before']) for(const width of [1440,390]) {
  const height=width<700?844:1000;
  const context=await page.context().browser().newContext({viewport:{width,height},reducedMotion:'no-preference',recordVideo:{dir:out+'/raw',size:{width,height}}});
  await context.addInitScript(()=>{
   window.designProbe={frames:[],tasks:[]};
   new PerformanceObserver(l=>window.designProbe.tasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
   let previous=0;
   requestAnimationFrame(function frame(t){if(t<7500){const hero=document.querySelector('.hero');window.designProbe.frames.push({t,gap:previous?t-previous:0,clip:document.querySelector('.portrait-reveal')?.style.clipPath,ready:hero?.dataset.portraitReady,finished:hero?.dataset.portraitFinished,smoke:document.querySelector('.home-silk canvas')?.dataset.frame,progress:window.__portfolioMotion?.().timelines.find(x=>x.id==='home:portrait:reveal')?.progress});previous=t;requestAnimationFrame(frame);}});
  });
  const p=await context.newPage();
  await p.goto(version==='v1'?'http://127.0.0.1:8781/':'http://127.0.0.1:4176/preview/en/');
  await p.waitForTimeout(7000);
  const result=await p.evaluate(()=>({probe:window.designProbe,hero:document.querySelector('.hero')?.dataset,source:document.querySelector('[data-warp-source]')?.getAttribute('data-warp-source')}));
  await p.screenshot({path:out+'/'+version+'-en-'+width+'-entrance.png'});
  const video=p.video();await p.close();await video.saveAs(out+'/'+version+'-en-'+width+'-smoke-portrait.webm');await context.close();rows.push({version,width,...result});
 }
 return rows;
}

async page=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/projects/eventies/cover.webp',async route=>{await new Promise(r=>setTimeout(r,1700));await route.continue();});
 try{
  await page.goto('http://127.0.0.1:4176/preview/en/projects/');await page.locator('[data-gallery-project=eventies]').scrollIntoViewIfNeeded();await page.waitForTimeout(800);
  await page.evaluate(()=>{window.__readiness=[];window.__rd=true;const tick=()=>{const image=document.querySelector('.case-opening-visual img');if(image)window.__readiness.push({phase:document.documentElement.dataset.projectTransit??'idle',overlay:!!document.querySelector('.project-transit-image'),ready:image.complete&&image.naturalWidth>0});if(window.__rd)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  await page.locator('[data-gallery-project=eventies]').click();await page.waitForURL('**/projects/eventies/');await page.waitForTimeout(2400);
  const r=await page.evaluate(()=>{window.__rd=false;return {frames:window.__readiness.length,blankFrames:window.__readiness.filter(x=>!x.overlay&&!x.ready).length,final:window.__readiness.at(-1)};});
  if(r.frames<50||r.blankFrames||!r.final.ready||r.final.overlay)throw Error('Unsafe texture handoff '+JSON.stringify(r));return {passed:true,...r};
 }finally{await page.unroute('**/projects/eventies/cover.webp');}
}

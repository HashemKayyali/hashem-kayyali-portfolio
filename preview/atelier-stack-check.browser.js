async(page)=>{
 await page.bringToFront();const errors=[];page.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:4176/preview/',states=[];
 for(const locale of ['en','ar'])for(const width of [320,390,768,1366,1920,2560]){
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width,height:width<=768?844:1000});await page.goto(base+locale+'/');await page.locator('.pulse-identity').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);
  const r=await page.evaluate(()=>{const a=document.querySelector('.pulse-roles').getBoundingClientRect(),b=document.querySelector('.pulse-name').getBoundingClientRect(),c=document.querySelector('.pulse-statement').getBoundingClientRect();return {roleGap:b.top-a.bottom,descriptionGap:c.top-b.bottom,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,stack:document.querySelector('.pulse-scenes').dataset.stack,cards:[...document.querySelectorAll('[data-home-scene]')].map(e=>({id:e.dataset.homeScene,images:e.querySelectorAll('img').length,height:e.offsetHeight}))};});
  if(r.overflow>1||r.roleGap>9||r.descriptionGap>12||r.cards.some(c=>c.images!==1))throw Error(JSON.stringify({locale,width,r}));
  const marker=await page.evaluate(()=>{const e=document.querySelector('[data-scene-marker=basket-beats]');return scrollY+e.getBoundingClientRect().top-110;});await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),marker);await page.waitForTimeout(650);
  if(r.stack==='active'){
   const s=await page.evaluate(()=>[...document.querySelectorAll('[data-home-scene]')].map(e=>({top:e.getBoundingClientRect().top,scale:parseFloat(getComputedStyle(e.querySelector('.pulse-scene-surface')).transform.split('(')[1]),progress:Number(e.dataset.stackProgress??0)})));
   if(s[0].progress<.95||s[1].progress<.95||s[0].top>=s[1].top||s[1].top>=s[2].top||s[0].scale>=.99)throw Error('Deck did not stack '+JSON.stringify({locale,width,s}));
  }
  states.push({locale,width,...r});
 }
 for(const locale of ['en','ar'])for(const width of [390,1366]){
  await page.setViewportSize({width,height:844});await page.goto(base+locale+'/projects/');await page.locator('.gallery-feature').first().waitFor();
  const counts=await page.locator('[data-gallery-project]').evaluateAll(es=>es.map(e=>e.querySelectorAll('img').length));if(counts.some(n=>n!==1))throw Error('Gallery has multiple card photos');states.push({locale,width,route:'projects',counts});
  for(const id of ['eventies','bike-tower','basket-beats']){await page.goto(base+locale+'/projects/'+id+'/');await page.locator('.case-title-text').waitFor();if(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)>1)throw Error('Case overflow');const evidence=await page.locator('.case-build img').count();if(id!=='basket-beats'&&evidence!==4)throw Error('Detail evidence removed');states.push({locale,width,route:id,evidence});}
 }
 await page.setViewportSize({width:844,height:390});await page.goto(base+'en/');await page.locator('.pulse-identity').waitFor();await page.waitForTimeout(1500);if(await page.locator('.pulse-scenes').getAttribute('data-stack')!=='static')throw Error('Short landscape should use readable flow');
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('.pulse-identity').waitFor();if(await page.locator('.pulse-scene').first().evaluate(e=>getComputedStyle(e).position)!=='relative')throw Error('Reduced sticky');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.waitForTimeout(1500);if(await page.locator('.pulse-scenes').getAttribute('data-stack')!=='active')throw Error('Live motion preference did not restore deck');
 if(errors.length)throw Error(JSON.stringify(errors));return {passed:true,states:states.length,responsiveAndReducedChecks:3,errors};
}

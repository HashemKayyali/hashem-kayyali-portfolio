async page=>{
 const result=[],errors=[];page.on('pageerror',e=>errors.push(e.message));const check=(ok,m)=>{if(!ok)throw Error(m);};
 await page.setViewportSize({width:1440,height:900});
 for(const locale of ['en','ar']){
  await page.goto(`http://127.0.0.1:5176/preview/${locale}/`);await page.waitForTimeout(1400);
  const proof=await page.evaluate(async()=>{
   const sleep=ms=>new Promise(r=>setTimeout(r,ms));const source=await (await fetch('/preview/home-story-motion.ts')).text(),url=source.match(/from\s+"([^"]*deps\/gsap_ScrollTrigger[^\"]*)"/)[1];const {ScrollTrigger}=await import(url);
   const triggers=ScrollTrigger.getAll().filter(t=>t.vars.id?.startsWith('home-story:'));
   const target=ScrollTrigger.getById('home-story:sheets'),samples=[];
   scrollTo({top:target.start-10,behavior:"instant"});await sleep(550);
   for(let i=0;i<=60;i++){scrollTo({top:target.start+(target.end-target.start)*i/60/2.35,behavior:"instant"});await new Promise(requestAnimationFrame);const a=document.querySelector('[data-story-sheet="1"]');samples.push({progress:target.progress,alpha:Number(getComputedStyle(a).opacity),transform:getComputedStyle(a).transform});}
   scrollTo({top:target.start+(target.end-target.start)*1.1/2.35,behavior:"instant"});await sleep(650);const image=document.querySelector('[data-story-sheet="1"] img');await image.decode();
   const a=image.getBoundingClientRect(),b=image.parentElement.getBoundingClientRect();
   const geometry={uncropped:a.width>0&&a.height>0&&a.height<=b.height+2&&a.width<=b.width+2,ratio:(image.offsetWidth-8)/(image.offsetHeight-8),native:image.naturalWidth/image.naturalHeight};
   return {triggers:triggers.length,states:new Set(samples.map(s=>s.transform)).size,intermediate:samples.filter(s=>s.alpha>.05&&s.alpha<.95).length,settled:Number(getComputedStyle(document.querySelector('[data-story-sheet="1"]')).opacity),geometry};
  });check(proof.triggers===11&&proof.states>30&&proof.intermediate>20&&proof.settled>.99&&proof.geometry.uncropped,`motion ${locale}: ${JSON.stringify(proof)}`);result.push({locale,...proof});
  await page.locator('header nav a[href$="about/"]').click();await page.waitForTimeout(850);const cleaned=await page.evaluate(async()=>{const source=await (await fetch('/preview/home-story-motion.ts')).text(),url=source.match(/from\s+"([^"]*deps\/gsap_ScrollTrigger[^\"]*)"/)[1];const {ScrollTrigger}=await import(url);return ScrollTrigger.getAll().filter(t=>t.vars.id?.startsWith('home-story:')).length;});check(cleaned===0,'story trigger cleanup');result.push({locale,departureTriggers:cleaned});
 }
 await page.goto('http://127.0.0.1:5176/preview/en/');await page.waitForTimeout(1400);await page.emulateMedia({reducedMotion:'reduce'});const reduced=await page.evaluate(async()=>{const source=await (await fetch('/preview/home-story-motion.ts')).text(),url=source.match(/from\s+"([^"]*deps\/gsap_ScrollTrigger[^\"]*)"/)[1];const {ScrollTrigger}=await import(url);return {owned:ScrollTrigger.getAll().filter(t=>t.vars.id?.startsWith('home-story:')).length,mode:document.querySelector('.home-story').dataset.storyMotion};});check(reduced.owned===0&&reduced.mode==='static','live reduced cleanup');result.push({reduced});await page.emulateMedia({reducedMotion:'no-preference'});
 check(!errors.length,`errors ${errors}`);return {passed:result.length,result,errors};
}

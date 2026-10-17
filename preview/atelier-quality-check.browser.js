async(page)=>{
 await page.bringToFront();
 const base='http://127.0.0.1:4176/preview/',errors=[],bad=[],states=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url());});
 const clickVisible=async locator=>{const r=await locator.boundingBox();if(!r)throw Error('Missing control');await page.mouse.click(r.x+r.width/2,r.y+r.height/2);};
 for(const width of [1366,390])for(const locale of ['en','ar','de','fr','es'])for(const route of ['', 'projects/', 'projects/eventies/', 'projects/bike-tower/', 'projects/basket-beats/']){
  await page.setViewportSize({width,height:width===390?844:768});
  await page.goto(base+locale+'/'+route);await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(100);
  const result=await page.evaluate(()=>{
   const images=[...document.querySelectorAll('.project-media-set img,.gallery-media-depth img,.case-opening-visual img,.case-evidence img,.neighbor-visual img')];
   const oversized=images.filter(e=>{const r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return r.width>p.width+1||r.height>p.height+1;}).map(e=>e.getAttribute('src'));
   return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,h1:document.querySelectorAll('main h1').length,font:getComputedStyle(document.querySelector('main h1')).fontFamily,wrongFits:images.filter(e=>getComputedStyle(e).objectFit!=='contain').map(e=>e.getAttribute('src')),oversized,smoke:document.querySelectorAll('.home-silk').length,order:[...document.querySelectorAll('[data-home-scene],.gallery-feature')].map(e=>e.dataset.homeScene??e.dataset.project),portrait:document.querySelector('.pulse-portrait')?.getBoundingClientRect().right};
  });
  if(result.overflow>1||result.h1!==1||result.wrongFits.length||result.oversized.length||!result.font.includes(locale==='ar'?'Almarai':'Libre Caslon Condensed'))throw Error(JSON.stringify({width,locale,route,result}));
  if(!route&&result.order.join(',')!=='eventies,bike-tower,basket-beats')throw Error('Featured ordering');
  if(route&&result.smoke)throw Error('Smoke outside hero');
  states.push({width,locale,route,...result});
 }
 // Existing cases, tablet and smallest mobile; every opening uses a full image frame.
 for(const id of ['terminal-nfc','glitzz-lab','umniah-youthconnect','vr-cycling','bike-land-trainer','financial-operations','outreach-automation','traffic-flow-analytics']){
  await page.setViewportSize({width:320,height:750});await page.goto(base+'ar/projects/'+id+'/');await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(over>1)throw Error(id+' overflows '+over);states.push({width:320,route:id,overflow:over});
 }
 for(const width of [320,768,1920,2560,3440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'en/');await page.locator('.pulse-name').waitFor();await page.evaluate(()=>document.fonts.ready);
  if(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)>1)throw Error('Home overflow '+width);const geometry=await page.evaluate(()=>({width:document.querySelector('.pulse-opening').getBoundingClientRect().width,portrait:document.querySelector('.pulse-portrait').getBoundingClientRect().width,words:[...document.querySelectorAll('.pulse-name .pulse-line-mask')].map(e=>e.getBoundingClientRect().top)}));
  if(width>=1366&&Math.abs(geometry.words[0]-geometry.words[1])>1)throw Error('Name wraps '+width);
  if(width>=2560&&(geometry.width<2300||geometry.portrait<390))throw Error('Wide layout did not grow');
  states.push({width,route:'home',geometry});
 }
 for(const locale of ['en','ar'])for(const width of [1920,2560]){
  await page.setViewportSize({width,height:1440});await page.goto(base+locale+'/projects/');await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(over>1)throw Error('Wide gallery '+locale+width);states.push({locale,width,route:'projects',overflow:over});
 }
 for(const width of [1920,2560]){
  await page.setViewportSize({width,height:1440});await page.goto(base+'ar/');await page.locator('.pulse-name').waitFor();await page.evaluate(()=>document.fonts.ready);
  const ys=await page.locator('.pulse-name .pulse-line-mask').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));if(Math.abs(ys[0]-ys[1])>1)throw Error('Arabic name split on wide display');states.push({locale:'ar',width,route:'home'});
 }
 for(const locale of ['en','ar'])for(const route of ['about','experience','skills','contact']){
  await page.setViewportSize({width:2560,height:1440});await page.goto(base+locale+'/'+route+'/');await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(over>1)throw Error('Wide profile '+locale+route);states.push({locale,width:2560,route,overflow:over});
 }
 // Every actual media frame fits its photo, with just3px padding plus1px border.
 for(const route of ['', 'projects/', 'projects/eventies/', 'projects/bike-tower/']){
  await page.setViewportSize({width:1366,height:768});await page.goto(base+'en/'+route);await page.locator('main h1').waitFor();await page.waitForTimeout(1300);
  const frames=await page.evaluate(()=>[...document.querySelectorAll('.project-media-primary,.project-media-tile,.gallery-media-mask,.case-opening-visual .case-image-depth,.case-evidence .case-image-depth')].map(e=>{const img=e.querySelector('img');if(!img)return null;const a=e.getBoundingClientRect(),b=img.getBoundingClientRect();return {x:a.width-b.width,y:a.height-b.height,src:img.getAttribute('src')};}).filter(Boolean));
  if(frames.some(e=>Math.abs(e.x-8)>1||Math.abs(e.y-8)>1))throw Error('Oversized picture frame '+JSON.stringify(frames));
 }
 // Mobile name and photo share the same row, with no image above the identity.
 await page.setViewportSize({width:390,height:844});await page.goto(base+'ar/');await page.locator('.pulse-name').waitFor();await page.waitForTimeout(1100);
 const adjacent=await page.evaluate(()=>{let a=document.querySelector('.pulse-name').getBoundingClientRect(),b=document.querySelector('.pulse-portrait').getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom;});if(!adjacent)throw Error('Mobile portrait detached from name');
 // Physical pointer coordinates avoid Playwright's artificial sticky-header centering.
 await page.setViewportSize({width:1366,height:768});await page.goto(base+'ar/');await page.locator('.pulse-name').waitFor();await page.waitForTimeout(1300);
 await page.evaluate(()=>scrollTo({top:1100,behavior:'instant'}));await page.waitForTimeout(300);
 const before=await page.evaluate(()=>({y:scrollY,top:document.querySelector('[data-home-scene=eventies]').getBoundingClientRect().top}));
 await clickVisible(page.locator('.language-trigger'));await page.waitForTimeout(100);
 if(Math.abs(await page.evaluate(()=>scrollY)-before.y)>1)throw Error('Opening language menu scrolls');
 await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');
 if(await page.locator('.language-trigger').getAttribute('aria-expanded')!=='false')throw Error('Escape does not close');
 await clickVisible(page.locator('.language-trigger'));await page.keyboard.press('Home');await page.keyboard.press('Enter');await page.waitForURL('**/preview/en/');await page.waitForTimeout(1300);
 const after=await page.evaluate(()=>({top:document.querySelector('[data-home-scene=eventies]').getBoundingClientRect().top,focus:document.activeElement.className}));
 if(Math.abs(after.top-before.top)>3||after.focus!=='language-trigger')throw Error('Translation lost reading/focus '+JSON.stringify({before,after}));
 await page.goto(base+'en/projects/');await page.locator('.gallery-feature').first().waitFor();await page.waitForTimeout(1100);
 await page.locator('[data-gallery-filter=webPlatform]').click();await page.waitForTimeout(300);
 const filtered=await page.locator('[data-gallery-project]').count();
 if(filtered!==2)throw Error('Wrong filtered result '+filtered);
 await page.locator('[data-gallery-project=eventies]').click();await page.waitForURL('**/projects/eventies/');await page.locator('.signature-case').waitFor();await page.waitForTimeout(1200);
 await page.goBack();await page.locator('.project-exhibition').waitFor();await page.waitForTimeout(1100);
 if(await page.locator('.project-exhibition').getAttribute('data-gallery-filter-state')!=='webPlatform')throw Error('Back lost filter');
 await page.goto(base+'en/projects/bike-tower/');await page.locator('.case-evidence-button').first().waitFor();await page.locator('.case-evidence-button').first().click();
 if(!await page.locator('dialog').evaluate(e=>e.open))throw Error('Image viewer failed');await page.keyboard.press('Escape');
 if(!await page.locator('.case-evidence-button').first().evaluate(e=>e===document.activeElement))throw Error('Viewer focus lost');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'ar/');await page.locator('.navigation-toggle').waitFor();await page.locator('.navigation-toggle').click();
 if(await page.locator('#primary-navigation').getAttribute('data-open')!=='true')throw Error('Mobile menu');await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('.pulse-name').waitFor();await page.waitForTimeout(300);
 if(await page.locator('.home-silk').getAttribute('data-motion')!=='reduced')throw Error('Smoke reduced-motion');
 await page.emulateMedia({reducedMotion:'no-preference'});
 if(errors.length||bad.length)throw Error(JSON.stringify({errors,bad}));
 return {passed:true,states:states.length,interactionChecks:17,language:{before,after},errors,bad};
}

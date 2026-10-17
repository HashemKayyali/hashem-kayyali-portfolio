// Executed through Playwright MCP browser_run_code_unsafe(filename).
async (page) => {
 const results=[];
 const ready=async()=>{await page.locator('main h1').waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>{const h=document.querySelector('.hero');return !h||h.dataset.portraitFinished==='complete'&&h.dataset.entrance==='complete'||matchMedia('(prefers-reduced-motion:reduce)').matches;});};
 for(const [width,height] of [[1280,720],[1366,768],[1440,900],[1536,864],[1920,1080],[2560,1440],[390,844],[320,740]]){
  await page.setViewportSize({width,height});
  for(const locale of ['en','ar'])for(const slug of ['', 'projects/']){
   const errors=[];const handle=error=>errors.push(error.message);page.on('pageerror',handle);
   await page.goto('http://127.0.0.1:4176/preview/creative/'+locale+'/'+slug);await ready();if(slug)await page.waitForTimeout(1100);
   const name='lab-final-'+locale+'-'+(slug?'gallery':'home')+'-'+width;
   await page.screenshot({path:'output/playwright/creative-director/'+name+'.png'});
   results.push(await page.evaluate(({name,errors})=>({name,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length,copyWidth:document.querySelector('.hero-copy')?.getBoundingClientRect().width,layoutWidth:document.querySelector('.hero-layout')?.getBoundingClientRect().width,hero:document.querySelector('.hero')?.dataset,headerHeight:document.querySelector('.site-header').getBoundingClientRect().height,projects:document.querySelectorAll('[data-gallery-project]').length,eager:document.querySelectorAll('[data-gallery-project] img[loading=eager]').length,errors}),{name,errors}));
   const marker=slug?'[data-project="eventies"]':'#projects';await page.locator(marker).scrollIntoViewIfNeeded();await page.waitForTimeout(1100);await page.screenshot({path:'output/playwright/creative-director/'+name+'-work.png'});
   if([1366,390].includes(width)){for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=height*.8){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(80);}await page.waitForTimeout(1100);await page.evaluate(()=>scrollTo(0,0));if(!slug){await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);}await page.screenshot({path:'output/playwright/creative-director/'+name+(slug?'-full.png':'-full-reduced.png'),fullPage:true});if(!slug)await page.emulateMedia({reducedMotion:'no-preference'});}
   page.off('pageerror',handle);
  }
 }
 return results;
}

async (page) => {
 const out = 'C:/Users/hashe/Desktop/site-v2-light-burgundy/output/playwright/design-intelligence';
 const phase = 'after', rows = [], errors = [];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 for(const locale of ['en','ar']) for(const width of [1920,1440,390,320]) {
  await page.setViewportSize({width,height:width<700?844:1000});
  for(const route of ['','projects/','projects/bike-tower/','about/','experience/','skills/','contact/']) {
   await page.goto('http://127.0.0.1:4176/preview/'+locale+'/'+route);
   await page.locator('main h1').waitFor();
   await page.waitForTimeout(route?850:2200);
   const name=route.replaceAll('/','-').replace(/-$/,'')||'home';
   await page.screenshot({path:out+'/'+phase+'-'+locale+'-'+width+'-'+name+'.png',fullPage:true});
   rows.push(await page.evaluate(({locale,width,route})=>({locale,width,route,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelector('h1')?.textContent,header:document.querySelector('.site-header').getBoundingClientRect().height,small:[...document.querySelectorAll('main p')].filter(x=>parseFloat(getComputedStyle(x).fontSize)<12).length,fields:[...document.querySelectorAll('.motion-field')].map(x=>({look:x.dataset.look,motion:x.dataset.motion}))}),{locale,width,route}));
  }
 }
 return {phase,rows,layouts:rows.length,overflow:rows.filter(r=>r.overflow>0),errors};
}

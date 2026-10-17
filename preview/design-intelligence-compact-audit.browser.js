async(page)=>{
 const out='C:/Users/hashe/Desktop/site-v2-light-burgundy/output/playwright/design-intelligence',rows=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const locale of ['en','ar'])for(const width of [1920,1440,390,320]){
  await page.setViewportSize({width,height:width<700?844:1000});
  for(const route of ['','projects/','projects/bike-tower/','about/','experience/','skills/','contact/']){
   await page.goto('http://127.0.0.1:4176/preview/'+locale+'/'+route,{waitUntil:'domcontentloaded'});await page.locator('main h1').waitFor();await page.waitForTimeout(route?350:2300);
   const name=route.replaceAll('/','-').replace(/-$/,'')||'home';await page.screenshot({path:out+'/after-'+locale+'-'+width+'-'+name+'-viewport.png'});
   rows.push(await page.evaluate(({locale,width,route})=>({locale,width,route,dir:document.documentElement.dir,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),h1:document.querySelector('h1').textContent,header:document.querySelector('.site-header').getBoundingClientRect().height}),{locale,width,route}));
  }
 }
 return {layouts:rows.length,rows,failures:rows.filter(r=>r.overflow||!r.h1||r.dir!==(r.locale==='ar'?'rtl':'ltr')),errors};
}

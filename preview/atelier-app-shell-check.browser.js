async(page)=>{
 await page.bringToFront();const base='http://127.0.0.1:5176/preview/',states=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const locale of ['en','ar','de','fr','es'])for(const width of [320,768,1366,2560])for(const route of ['','about/','projects/','projects/glitzz-lab/']){
  await page.setViewportSize({width,height:900});await page.goto(base+locale+'/'+route);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1300);
  const r=await page.evaluate(()=>{const hero=document.querySelector('.pulse-opening,.atelier-about-opening,.gallery-intro,.case-opening'),a=document.querySelector('.app-atmosphere').getBoundingClientRect(),b=hero.getBoundingClientRect();return {surfaces:document.querySelectorAll('.home-silk').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,bounds:Math.max(Math.abs(a.top-b.top),Math.abs(a.height-b.height)),footerOutside:!document.querySelector('.route-stage .compact-footer'),covers:[...document.querySelectorAll('.app-cover')].map(e=>e.getBoundingClientRect().bottom-b.bottom),smokeSide:getComputedStyle(document.querySelector('.app-atmosphere-paint')).left};});
  if(r.surfaces!==1||r.overflow>1||r.bounds>1||!r.footerOutside||r.covers.some(v=>v>1))throw Error('Hero '+JSON.stringify({locale,width,route,r}));states.push({locale,width,route});
 }
 if(errors.length)throw Error(JSON.stringify(errors));return {passed:true,states:states.length,errors};
}

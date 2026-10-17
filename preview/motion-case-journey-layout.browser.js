async page=>{
 const locale='en',base='http://127.0.0.1:4176/preview/';
 const sizes=[[320,740],[390,844],[768,1024],[820,1180],[1024,768],[1180,820],[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160]];
 const routes=['','about/','projects/','skills/','experience/','contact/','projects/eventies/','projects/umniah-youthconnect/'];
 const rows=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.bringToFront();await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height]of sizes)for(const route of routes){
  await page.setViewportSize({width,height});await page.goto(base+locale+'/'+route);
  await page.waitForSelector('main h1',{state:'attached'});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(65);
  const result=await page.evaluate(()=>{
   const selectors='.case-body h2,.case-body p,.journey-opening h1,.journey-opening p,.journey-company-title,.wb-hero h1,.desk-header h1,.pulse-name,.atelier-about-copy h1,.app-collection-copy h1';
   const text=[...document.querySelectorAll(selectors)].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height;});
   const clipped=text.filter(e=>e.scrollWidth>e.clientWidth+3&&getComputedStyle(e).display!=='inline').map(e=>({selector:e.className,text:e.textContent.slice(0,70),width:e.clientWidth,scroll:e.scrollWidth}));
   const hero=document.querySelector('.case-opening,.journey-opening,.app-home-hero,.atelier-about-opening,.app-collection-hero');
   return {overflow:document.documentElement.scrollWidth>innerWidth,clipped,heroHeight:hero?Math.round(hero.getBoundingClientRect().height):null,title:document.querySelector('main h1').textContent,mainCount:document.querySelectorAll('main').length,headerOpacity:getComputedStyle(document.querySelector('.site-header')).opacity};
  });
  rows.push({locale,width,height,route,...result});
  if([390,820,1180,1920].includes(width)&&!route.includes('umniah'))await page.screenshot({path:`output/qa-2026-10-15-${locale}-${width}-${route.replaceAll('/','-')||'home'}.png`});
 }
 const failures=rows.filter(r=>r.overflow||r.clipped.length||r.mainCount!==1||r.headerOpacity!=='1');
 await page.emulateMedia({reducedMotion:'no-preference'});
 return {states:rows.length,errors,failures,heroes:rows.filter(r=>['','experience/','projects/eventies/'].includes(r.route)).map(({width,height,route,heroHeight})=>({width,height,route,heroHeight}))};
}

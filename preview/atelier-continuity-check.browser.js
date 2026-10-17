async(page)=>{
 await page.bringToFront();const base='http://127.0.0.1:4176/preview/',results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const configs=['en','ar'].flatMap(locale=>[320,390,1440,1920].map(width=>({locale,width}))).concat(['de','fr','es'].flatMap(locale=>[390,1440].map(width=>({locale,width}))));
 for(const {locale,width} of configs){
  await page.setViewportSize({width,height:width<800?844:1000});let firstHeight,firstPortrait;
  for(const route of ['','about/','projects/','projects/glitzz-lab/']){
   await page.goto(base+locale+'/'+route);await page.locator('.app-home-hero,.atelier-about-opening,.gallery-intro,.case-opening').waitFor();await page.locator('.route-stage[data-route-ready=ready]').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);
   const r=await page.evaluate(()=>{const hero=document.querySelector('.app-home-hero,.atelier-about-opening,.gallery-intro,.case-opening').getBoundingClientRect(),p=document.querySelector('.shared-hero-portrait[data-visible=true]')?.getBoundingClientRect(),h=document.querySelector('h1'),smoke=document.querySelector('.app-atmosphere').getBoundingClientRect();return {height:hero.height,top:hero.top,smokeError:Math.max(Math.abs(smoke.height-hero.height),Math.abs(smoke.top-hero.top)),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,portrait:p?{x:p.x,y:p.y,width:p.width,height:p.height}:null,titleHeight:h.getBoundingClientRect().height,lineHeight:parseFloat(getComputedStyle(h).lineHeight)};});
   if(firstHeight===undefined)firstHeight=r.height;if(route==='')firstPortrait=r.portrait;
   if(r.overflow>1||r.smokeError>1||Math.abs(r.height-firstHeight)>1)throw Error('Hero '+JSON.stringify({locale,width,route,r,firstHeight}));
   if(route==='about/'&&Object.keys(firstPortrait).some(k=>Math.abs(firstPortrait[k]-r.portrait[k])>1))throw Error('Portrait geometry');
   if(route==='projects/'&&width>=1440&&['ar','en'].includes(locale)&&r.titleHeight>r.lineHeight+2)throw Error('Projects title wraps');results.push({locale,width,route,height:r.height});
  }
 }
 const ids=['eventies','bike-tower','basket-beats','terminal-nfc','glitzz-lab','vr-cycling','bike-land-trainer','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics'];
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const locale of ['en','ar'])for(const id of ids){await page.setViewportSize({width:320,height:844});await page.goto(base+locale+'/projects/'+id+'/');await page.locator('.case-title-text').waitFor();await page.evaluate(()=>document.fonts.ready);const r=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,visualBottom:document.querySelector('.case-opening-visual').getBoundingClientRect().bottom,footerTop:document.querySelector('.case-opening-footer').getBoundingClientRect().top,copyBottom:document.querySelector('.case-opening-copy').getBoundingClientRect().bottom,visualTop:document.querySelector('.case-opening-visual').getBoundingClientRect().top}));if(r.overflow>1||r.visualBottom>r.footerTop+1||r.copyBottom>r.visualTop+1)throw Error('Narrow case collision '+JSON.stringify({locale,id,r}));results.push({locale,id,narrow:true});}
 await page.emulateMedia({reducedMotion:'no-preference'});if(errors.length)throw Error(JSON.stringify(errors));return {passed:true,states:results.length,errors};
}

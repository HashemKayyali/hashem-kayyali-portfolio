async page=>{
 await page.bringToFront();await page.emulateMedia({reducedMotion:'reduce'});
 const results=[],errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const configs=['en','ar'].flatMap(locale=>[320,390,1440,1920].map(width=>({locale,width}))).concat(['de','fr','es'].flatMap(locale=>[390,1440].map(width=>({locale,width}))));
 try{
  for(const {locale,width} of configs){
   await page.setViewportSize({width,height:width<800?844:1080});
   const routes=['en','ar'].includes(locale)?['','experience/','skills/','contact/','projects/','about/','projects/eventies/']:['','experience/','skills/','contact/'];
   for(const route of routes){
    await page.goto(`http://127.0.0.1:4176/preview/${locale}/${route}`);await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
    const state=await page.evaluate(()=>{
     const title=document.querySelector('#vision-work-title'),photo=document.querySelector('.shared-hero-portrait'),hero=document.querySelector('.app-home-hero,.atelier-about-opening,.app-collection-hero');
     return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,title:title?{height:title.getBoundingClientRect().height,line:parseFloat(getComputedStyle(title).lineHeight)}:null,caption:photo?.dataset.visible==='true'?getComputedStyle(photo.querySelector('figcaption')).backgroundColor:null,hero:hero?.getBoundingClientRect().height,
      buttons:[...document.querySelectorAll('main .pulse-primary,main .pulse-resume,main .button-primary,main .pulse-case-link,header .theme-trigger,header .language-trigger')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height;}).map(e=>{const r=e.getBoundingClientRect();return {class:e.className,height:r.height,left:r.left,right:r.right,radius:getComputedStyle(e).borderTopLeftRadius,shadow:getComputedStyle(e).boxShadow};})};
    });
    if(state.overflow>1||locale==='en'&&state.title&&state.title.height>state.title.line+1||state.caption&&state.caption!=='rgba(0, 0, 0, 0)'||state.buttons.some(b=>b.height<43||b.left<-.5||b.right>width+.5||b.shadow==='none'))throw Error(JSON.stringify({locale,width,route,state}));
    if(!route){await page.locator('.story-board').scrollIntoViewIfNeeded();await page.locator('.story-sheet-image img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.locator('.story-sheet-image img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));const images=await page.locator('.story-sheet-image img').evaluateAll(imgs=>imgs.map(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight,fit:getComputedStyle(i).objectFit})));if(images.length!==3||images.some(i=>!i.src.startsWith('/engineering-process/')||!i.width||i.fit!=='contain'))throw Error(JSON.stringify(images));state.images=images;}
    results.push({locale,width,route,...state});
   }
  }
  if(errors.length)throw Error(JSON.stringify(errors));return {passed:true,groups:results.length,results,errors};
 }finally{page.off('pageerror',onError);await page.emulateMedia({reducedMotion:'no-preference'});}
}

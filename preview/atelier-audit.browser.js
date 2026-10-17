async(page)=>{
 const rows=[],errors=[],failed=[],contrast=[];const error=e=>errors.push(e.message),response=r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});};
 page.on('pageerror',error);page.on('response',response);await page.bringToFront();await page.emulateMedia({reducedMotion:'reduce'});
 const pages=['','about/','experience/','skills/','contact/','projects/'];
 const cases=['bike-tower','terminal-nfc','eventies','basket-beats','glitzz-lab','umniah-youthconnect','vr-cycling','bike-land-trainer','financial-operations','outreach-automation','traffic-flow-analytics'];
 const visit=async(locale,route,width,height,prefix='',capture=false)=>{
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5176/preview/'+prefix+locale+'/'+route);await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(120);
  const result=await page.evaluate(()=>{
   const doc=document.documentElement,content=[...document.querySelectorAll('main h1,main input,main textarea,main button,main summary,main p')];
   const clipped=content.filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&s.display!=='none'&&(r.left< -1||r.right>doc.clientWidth+1);}).slice(0,6).map(e=>({tag:e.tagName,text:e.textContent.slice(0,70)}));
   return{overflow:doc.scrollWidth-doc.clientWidth,headings:document.querySelectorAll('main h1').length,lang:doc.lang,dir:doc.dir,theme:document.querySelector('.luxury-portfolio')!==null,clipped};
  });
  if(result.overflow>0||result.headings!==1||!result.theme||result.clipped.length)throw Error(JSON.stringify({locale,route,width,prefix,result}));rows.push({locale,route,width,prefix,...result});
  if(capture){
   await page.evaluate(()=>Promise.race([Promise.all([...document.images].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&r.top<innerHeight;}).map(e=>e.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,2000))]));
   const key=route.replaceAll('/','-').replace(/-$/,'')||'home';await page.screenshot({path:'output/playwright/atelier/final-'+key+'-'+locale+'-'+width+(prefix?'creative':'')+'.png'});
  }
  if(locale==='en'&&width===1366&&!prefix){
   contrast.push(...await page.evaluate(()=>{
    const rgb=v=>v.match(/[\d.]+/g)?.map(Number),lum=a=>{const c=a.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
    const problems=[];for(const e of document.querySelectorAll('main p,main h1,main h2,main h3,main a,main button,main label,main summary,main span')){
     const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(!r.width||!r.height||r.top>innerHeight||r.bottom<0||s.opacity<.95||!e.textContent.trim()||!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
     let parent=e,bg;while(parent){bg=rgb(getComputedStyle(parent).backgroundColor);if(bg&&bg.length===3||bg?.[3]===1)break;parent=parent.parentElement;}const fg=rgb(s.color);if(!bg||!fg||!parent)continue;const values=[lum(fg),lum(bg)].sort((a,b)=>b-a),ratio=(values[0]+.05)/(values[1]+.05),large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.67&&Number(s.fontWeight)>=700);
     if(ratio<(large?3:4.5))problems.push({path:location.pathname,class:e.className,text:e.textContent.trim().slice(0,70),fg:s.color,bg:getComputedStyle(parent).backgroundColor,ratio});
    }return problems;
   }));
  }
 };
 try{
  for(const locale of ['en','ar','de','fr','es'])for(const width of [320,768,1366])for(const route of pages)await visit(locale,route,width,width===320?740:width===768?1024:768,'',locale==='en'||locale==='ar');
  for(const locale of ['en','ar'])for(const width of [390,1920])for(const route of pages)await visit(locale,route,width,width===390?844:1080,'',true);
  for(const locale of ['en','ar','de','fr','es'])for(const id of cases)await visit(locale,'projects/'+id+'/',1366,768,'',locale==='en'||locale==='ar');
  for(const id of cases)for(const width of [390,1366])await visit('en','projects/'+id+'/',width,width===390?844:768,'creative/',true);
  for(const locale of ['en','ar','de','fr','es'])await visit(locale,'projects/',390,844,'creative/',true);
  return{rows,errors,failed,contrast};
 }finally{page.off('pageerror',error);page.off('response',response);}
}

async(page)=>{
 const out='C:/Users/hashe/Desktop/site-v2-light-burgundy/output/playwright/design-intelligence',rows=[];
 for(const locale of ['en','ar']){
  const width=locale==='en'?1440:390,height=locale==='en'?1000:844;
  const context=await page.context().browser().newContext({viewport:{width,height},recordVideo:{dir:out+'/raw',size:{width,height}}}),p=await context.newPage();
  await p.goto('http://127.0.0.1:4176/preview/'+locale+'/');await p.waitForTimeout(2300);
  for(const id of ['bike-tower','terminal-nfc','eventies']){
   await p.locator('[data-project="'+id+'"]').scrollIntoViewIfNeeded();await p.waitForTimeout(1100);
   await p.screenshot({path:out+'/after-'+locale+'-'+width+'-home-'+id+'.png'});
  }
  await p.goto('http://127.0.0.1:4176/preview/'+locale+'/projects/');await p.waitForTimeout(1100);
  for(const id of ['bike-tower','glitzz-lab','basket-beats','umniah-youthconnect','traffic-flow-analytics']){
   await p.locator('[data-gallery-project="'+id+'"]').scrollIntoViewIfNeeded();await p.waitForTimeout(800);
   await p.screenshot({path:out+'/after-'+locale+'-'+width+'-gallery-'+id+'.png'});
  }
  const integrity=await p.evaluate(()=>({projects:document.querySelectorAll('[data-gallery-project]').length,loadedImages:[...document.querySelectorAll('.gallery-artwork img')].filter(x=>x.complete&&x.naturalWidth>0).length,overflow:document.documentElement.scrollWidth-innerWidth}));
  rows.push({locale,width,...integrity});const video=p.video();await p.close();await video.saveAs(out+'/after-scroll-tour-'+locale+'.webm');await context.close();
 }
 return rows;
}

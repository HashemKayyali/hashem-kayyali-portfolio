async page=>{
 const out=[];
 await page.setViewportSize({width:1440,height:900});
 const inspect=()=>page.evaluate(()=>{
  const rgb=v=>{const c=v.match(/[\d.]+/g)?.map(Number);return c?[c[0],c[1],c[2],c[3]??1]:[0,0,0,0];};
  const lum=a=>{const c=a.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  const failures=[],pairs=[];
  const elements=[...document.querySelectorAll('.theme-trigger,.language-trigger,.site-header nav a,.story-chapter p,.story-chapter h3,.story-board-heading,.story-sheet-top,.story-career-role h4,.story-career-entry p,.story-career-period,.story-contact-prompt,.story-contact-intro,.story-contact-action,.story-correspondence a,.pulse-scene-copy h3,.pulse-scene-copy p,.pulse-scene-top,.pulse-scene-bottom,.gallery-project-title,.gallery-project-meta,.gallery-filters button,.desk-channel-copy bdi,.desk-compose h2,.desk-form label,.desk-form input,.desk-form .button-primary,.form-help,.case-chapter h2,.case-wayfinding a,.evidence-controls button,.profile-company h3,.dossier-folio h2,.dossier-folio p')];
  for(const el of elements){const s=getComputedStyle(el),r=el.getBoundingClientRect();if(!r.width||!r.height||s.visibility==='hidden')continue;
   const color=rgb(s.color),layers=[];let e=el;while(e){const b=rgb(getComputedStyle(e).backgroundColor);if(b[3])layers.push(b);e=e.parentElement;}let bg=[255,255,255,1];for(const b of layers.reverse())bg=[...b.slice(0,3).map((v,i)=>v*b[3]+bg[i]*(1-b[3])),1];
   const ratio=(Math.max(lum(color),lum(bg))+.05)/(Math.min(lum(color),lum(bg))+.05),min=parseFloat(s.fontSize)>=24||parseFloat(s.fontSize)>=18.66&&Number(s.fontWeight)>=700?3:4.5;
   const p={text:el.textContent.trim().slice(0,48)||el.tagName,selector:el.className,ratio:+ratio.toFixed(2),color:s.color,bg:bg.slice(0,3).map(Math.round),min};pairs.push(p);if(ratio<min)failures.push(p);
  }return {theme:document.documentElement.dataset.theme,checked:pairs.length,failures};
 });
 for(const id of ['atelier','burgundy','onyx','rose','metal'])for(const path of ['contact/']){
  await page.goto('http://127.0.0.1:4176/preview/en/'+path);await page.waitForTimeout(1200);await page.locator('.theme-trigger').click();await page.locator(`[data-theme-choice=${id}]`).click();await page.waitForTimeout(500);out.push({path,...await inspect()});
 }
 if(out.some(p=>p.failures.length))throw Error(JSON.stringify(out.filter(p=>p.failures.length)));
 return {groups:out.length,checked:out.reduce((n,p)=>n+p.checked,0),failed:out.filter(p=>p.failures.length),out};
}

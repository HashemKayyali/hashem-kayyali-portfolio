async page=>{
 const results=[];
 for(const locale of ['en','ar']){await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5176/preview/'+locale+'/');await page.locator('.skill-toolbelt').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(400);
  const proof=await page.evaluate(async()=>{
   const source=await fetch('/preview/SkillToolbelt.tsx').then(r=>r.text()),path=source.match(/from\s+["']([^"']*\/gsap\.js[^"']*)["']/)?.[1];if(!path)throw Error('Actual Vite GSAP import missing');
   const {gsap}=await import(path),states=[];
   const visible=window=>[...window.querySelectorAll('.toolbelt-item')].map(e=>({name:e.querySelector('bdi').textContent,x:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.right>0&&e.x<document.documentElement.clientWidth).sort((a,b)=>a.x-b.x);
   for(const [index,window] of [...document.querySelectorAll('.toolbelt-window')].entries()){
    const tween=gsap.getById('home:toolbelt:'+index);if(!tween)throw Error('Actual rail tween missing');const time=tween.totalTime(),paused=tween.paused(),duration=tween.duration();tween.pause();tween.totalTime(duration-.005);const before=visible(window);tween.totalTime(duration+.005);const after=visible(window);tween.totalTime(time);tween.paused(paused);
    const same=before.length===after.length&&before.every((item,i)=>item.name===after[i].name),delta=same?Math.max(...before.map((item,i)=>Math.abs(item.x-after[i].x))):Infinity;
    states.push({index,same,delta,visible:after.length,duration});
   }return states;
  });if(proof.some(r=>!r.same||r.delta>1||!r.visible))throw Error('Loop seam '+JSON.stringify({locale,proof}));results.push({locale,proof});
 }
 return {passed:true,results};
}

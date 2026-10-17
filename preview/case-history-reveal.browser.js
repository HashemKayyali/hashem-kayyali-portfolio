async page=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4176/preview/en/projects/terminal-nfc/');await page.locator('.case-opening-visual img').waitFor();await page.waitForTimeout(1400);
 await page.locator('#primary-navigation a[href="/preview/en/contact/"]').click();await page.waitForURL('**/contact/');await page.waitForTimeout(550);
 await page.evaluate(()=>{window.__caseBack={run:true,frames:[]};const tick=t=>{const v=document.querySelector('.case-opening-visual'),i=v?.querySelector('img');if(v)window.__caseBack.frames.push({t,clip:getComputedStyle(v).clipPath,decoded:i?.complete&&i.naturalWidth>0});if(window.__caseBack.run)requestAnimationFrame(tick)};requestAnimationFrame(tick)});
 await page.goBack();await page.waitForURL('**/projects/terminal-nfc/');await page.waitForTimeout(1400);
 return await page.evaluate(()=>{const p=window.__caseBack;p.run=false;const first=p.frames[0],mid=p.frames.filter(x=>x.t-first.t>=150&&x.t-first.t<=800);return {passed:new Set(mid.map(x=>x.clip)).size>10&&p.frames.at(-1).clip==='none',sampled:p.frames.length,midRevealStates:new Set(mid.map(x=>x.clip)).size,decodedFromStart:p.frames.every(x=>x.decoded),final:p.frames.at(-1).clip}});
}

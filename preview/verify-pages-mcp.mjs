import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
import {projectAssets,filterOrder} from '../data/projectAssets.ts';
import {profile,RESUME_PDF,RESUME_DOCX} from '../data/profile.ts';
const client=await connect('playwright'),records=[];
const call=async(name,args)=>{const result=await client.call(name,args);records.push({name,result});if(result.isError)throw new Error(JSON.stringify(result));return result;};
try {
 await call('browser_navigate',{url:'http://127.0.0.1:4176/preview/en/'});
 await call('browser_emulate_media',{reducedMotion:'reduce'});
 for(const locale of process.argv[2]==='flows'?[]:['en','ar','de','fr','es']) {
  const dictionary=(await import(`../content/locales/${locale}.ts`)).default;
  const expected={about:dictionary.about.sections.flatMap(section=>section.paragraphs),skills:dictionary.about.skills.flat(),education:dictionary.resume.education,experience:dictionary.resume.experience,ids:projectAssets.map(asset=>asset.id)};
  await call('browser_run_code_unsafe',{code:`async(page)=>{
   const expected=${JSON.stringify(expected)},layouts=[];const assert=(state,message)=>{if(!state)throw new Error(message);};
   for(const section of ['home','projects','skills','contact','about','experience'])for(const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4176/preview/${locale}/'+(section==='home'?'':section+'/'));await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
    const state=await page.evaluate(()=>({dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('main h1').length,canonical:document.querySelector('link[rel=canonical]')?.href,alternates:document.querySelectorAll('link[hreflang]').length,active:document.querySelector('nav a[aria-current=page]')?.getAttribute('href'),broken:[...document.images].filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.src)}));
    assert(!state.overflow&&state.h1===1&&!state.broken.length&&state.dir===('${locale}'==='ar'?'rtl':'ltr'),JSON.stringify({section,width,state}));
    assert(state.active.endsWith('/${locale}/'+(section==='home'?'':section+'/')),'Incorrect active navigation');assert(state.alternates===5,'Missing locale alternate');
    if(section==='home')assert(await page.locator('[data-project]').count()===3,'Home featured projects');
    if(section==='projects'){const ids=await page.locator('[data-project]').evaluateAll(els=>els.map(el=>el.dataset.project));assert(ids.length===11&&expected.ids.every(id=>ids.includes(id)),'Project collection lost approved data');}
    if(section==='skills')assert(JSON.stringify(await page.locator('.skill-matrix .skill-tags li').allTextContents())===JSON.stringify(expected.skills),'Skills differ from approved content');
    if(section==='about')assert(JSON.stringify(await page.locator('[data-about-paragraph]').allTextContents())===JSON.stringify(expected.about),'About differs from approved content');
    if(section==='experience'){
     assert(await page.locator('[data-company]').count()===4,'Company groups');assert(await page.locator('[data-company="terminal"] .experience-role').count()===3,'Terminal progression');assert(await page.locator('[data-company="terminal"] img').count()===1,'Terminal logo duplication');
     assert(await page.locator('.graduated').textContent()===expected.education.status,'Graduation changed');
     for(const entry of expected.experience){const roles=entry.roles??[{title:entry.role,period:entry.period,employment:entry.employment,points:entry.points}];const group=page.locator('[data-company="'+entry.id+'"]');assert(JSON.stringify(await group.locator('.experience-role__title').allTextContents())===JSON.stringify(roles.map(role=>role.title)),'Role titles changed');for(const role of roles){const text=await group.textContent();assert([role.period,role.employment,role.points[0]].every(value=>text.includes(value)),'Role facts changed');}}
    }
    layouts.push({section,width,...state});
   }
   return layouts;
  }`});console.log(locale+': 30 multi-page layouts verified');
 }
 const english=(await import('../content/locales/en.ts')).default;
 const cases=Object.fromEntries(projectAssets.map(asset=>[asset.id,{...english.projects[asset.id],live:asset.liveUrl??null}]));
 await call('browser_run_code_unsafe',{code:`async(page)=>{
  const assert=(state,message)=>{if(!state)throw new Error(message);};const cases=${JSON.stringify(cases)};
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4176/preview/en/projects/');await page.locator('.filters').waitFor();
  const categories=${JSON.stringify(filterOrder)},assets=${JSON.stringify(projectAssets.map(asset=>({id:asset.id,category:asset.categoryKey})))};
  for(let i=0;i<categories.length;i++){await page.locator('.filters button').nth(i).click();assert(await page.locator('[data-project]').count()===assets.filter(asset=>categories[i]==='all'||asset.category===categories[i]).length,'Filter count');}
  for(const id of Object.keys(cases)){await page.goto('http://127.0.0.1:4176/preview/en/projects/'+id+'/');await page.locator('.case-reading').waitFor();assert(await page.locator('.case-reading>section').count()===3,'Missing engineering narrative: '+id);assert(await page.locator('.case-intro h1').textContent()===cases[id].title,'Project title changed');assert(JSON.stringify(await page.locator('.case-reading>section>p').allTextContents())===JSON.stringify(['purpose','contribution','engineering'].map(key=>cases[id][key])),'Approved case narrative changed');const live=page.locator('.case-actions a');assert(await live.count()===(cases[id].live?1:0),'Public/private project distinction');if(cases[id].live)assert(await live.getAttribute('href')===cases[id].live,'Live URL changed');}
  await page.goto('http://127.0.0.1:4176/preview/en/projects/terminal-nfc/');const image=page.locator('.gallery-image').first();await image.focus();await page.keyboard.press('Enter');await page.locator('dialog[open]').waitFor();assert((await page.locator('dialog img').getAttribute('src')).includes('/v2-media/'),'Unredacted viewer');await page.keyboard.press('Escape');assert(await image.evaluate(el=>el===document.activeElement),'Dialog focus restoration');
  await page.goto('http://127.0.0.1:4176/preview/en/');await page.locator('main h1').waitFor();await page.locator('nav a[href="/preview/en/projects/"]').click();await page.waitForURL('**/preview/en/projects/');await page.locator('[data-project]').first().waitFor();assert(await page.locator('main h1').evaluate(el=>el===document.activeElement),'Page heading focus');await page.goBack();await page.locator('.hero').waitFor();await page.goForward();await page.locator('.filters').waitFor();await page.reload();await page.locator('.filters').waitFor();
  await page.locator('select').selectOption('ar');await page.waitForURL('**/preview/ar/projects/');assert(await page.locator('html').getAttribute('dir')==='rtl','Language did not retain page');
  await page.setViewportSize({width:390,height:844});const menu=page.locator('.navigation-toggle');await menu.click();assert(await menu.getAttribute('aria-expanded')==='true','Menu not open');await page.keyboard.press('Escape');assert(await menu.getAttribute('aria-expanded')==='false'&&await menu.evaluate(el=>el===document.activeElement),'Escape menu focus');await menu.click();await page.locator('nav a[href="/preview/ar/skills/"]').click();await page.locator('.skill-matrix').waitFor();assert(await menu.getAttribute('aria-expanded')==='false','Menu not closed after navigation');
  await page.goto('http://127.0.0.1:4176/preview/en/contact/');await page.locator('form').waitFor();await page.locator('button[type=submit]').click();assert(await page.locator('.prepared-draft').count()===0,'Empty form accepted');
  await page.locator('#contact-name').fill('Portfolio Review');await page.locator('#contact-email').fill('review@example.com');await page.locator('#contact-message').fill('Reviewing the local engineering portfolio preview.');await page.locator('button[type=submit]').click();await page.locator('.prepared-draft').waitFor();const mailto=await page.locator('.prepared-draft').getAttribute('href');assert(mailto.startsWith('mailto:${profile.email}?')&&new URL(mailto).searchParams.get('body').includes('review@example.com'),'Draft recipient or body incorrect');await page.locator('#contact-message').fill('Changed');assert(await page.locator('.prepared-draft').count()===0,'Stale draft retained after edits');
  assert(await page.locator('a[href="${profile.social.email}"]').count()===1,'Real email link missing');
  await page.goto('http://127.0.0.1:4176/preview/en/experience/');await page.locator('.education').waitFor();assert(await page.locator('a[href="${RESUME_PDF}"]').count()===1&&await page.locator('a[href="${RESUME_DOCX}"]').count()===1,'Resume links missing');
  await page.goto('http://127.0.0.1:4176/preview/ar/projects/unknown/');await page.locator('.not-found').waitFor();await page.locator('.not-found a').click();await page.locator('.hero').waitFor();
  return {filters:6,cases:11,history:true,reload:true,localizedNavigation:true,headingFocus:true,mobileMenu:true,dialogKeyboard:true,contactDraftValidated:true,resumeLinks:true,recoverableNotFound:true};
 }`});console.log('Navigation, all 11 cases, contact and keyboard flows passed');
 const consoleResult=await call('browser_console_messages',{level:'error',all:true});
 await writeFile('output/playwright/motion-lab/pages-console.json',JSON.stringify(consoleResult,null,2));
} finally {await writeFile('output/playwright/motion-lab/'+(process.argv[2]==='flows'?'mcp-page-flows.json':'mcp-pages-verification.json'),JSON.stringify(records,null,2));await client.call('browser_close');client.close();}

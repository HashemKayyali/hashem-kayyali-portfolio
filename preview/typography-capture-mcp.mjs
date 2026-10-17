import {connect} from './mcp-client.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {projectAssets} from '../data/projectAssets.ts';
const phase=process.argv[2]??'before',dir='output/playwright/typography',c=await connect('playwright');await mkdir(dir,{recursive:true});
const cases=projectAssets.map(a=>'projects/'+a.id+'/'),routes=['','about/','projects/','experience/','skills/','contact/',...cases];
try{
 const result=await c.call('browser_run_code_unsafe',{code:`async(page)=>{
 const rows=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,390]){
 await page.setViewportSize({width,height:width===1440?1000:844});await page.emulateMedia({reducedMotion:'reduce'});
 for(const route of ${JSON.stringify(routes)}){
 await page.goto('http://127.0.0.1:4176/preview/ar/'+route);await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
 const styles=await page.evaluate(()=>[...document.querySelectorAll('header,main,footer')].flatMap(root=>[...root.querySelectorAll('*')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>{const s=getComputedStyle(e);return {tag:e.tagName,cls:e.className,text:e.textContent.trim(),font:s.fontFamily,weight:s.fontWeight,size:s.fontSize,line:s.lineHeight,spacing:s.letterSpacing};})));
 rows.push({width,route,styles});}
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const locale of ['en','ar'])for(const route of (locale==='en'?['','about/','projects/','experience/','skills/','contact/','projects/bike-tower/']:['','contact/'])){
 await page.goto('http://127.0.0.1:4176/preview/'+locale+'/'+route);await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1800);
 const name=locale+'-'+width+'-'+(route.replaceAll('/','-')||'home');await page.screenshot({path:'${dir}/${phase}-'+name+'.png'});
 }
 }return {rows,errors};}`});
 await writeFile(dir+'/'+phase+'-capture.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result).slice(-250));
}finally{await c.call('browser_close');c.close();}

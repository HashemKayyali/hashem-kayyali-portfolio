import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');let result;
try {
 await client.call('browser_navigate',{url:'http://127.0.0.1:4176/preview/en/skills/'});
 result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{await page.locator('.skill-matrix').waitFor();await page.locator('nav a[href="/preview/en/"]').click();await page.locator('.hero').waitFor();if(!await page.locator('.hero h1').evaluate(el=>el===document.activeElement))throw new Error('Home title did not receive keyboard focus');await page.locator('.hero-footnote a').click();await page.waitForURL('**/preview/en/#projects');await page.reload();await page.locator('.hero').waitFor();await page.locator('nav a[href="/preview/en/projects/"]').click();await page.locator('.filters').waitFor();await page.goBack();await page.locator('.hero').waitFor();if(!await page.locator('.hero h1').evaluate(el=>el===document.activeElement))throw new Error('History Home focus');return {homeFocus:true,historyHomeFocus:true,homeFragmentReload:true};}`});
 if(result.isError)throw new Error(JSON.stringify(result));console.log('Home and browser-history heading focus passed');
} finally {await writeFile('output/playwright/motion-lab/review-regressions.json',JSON.stringify(result,null,2));await client.call('browser_close');client.close();}

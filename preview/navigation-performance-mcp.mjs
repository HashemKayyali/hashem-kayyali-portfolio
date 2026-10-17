import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('devtools'),records=[];
const label=process.argv[2]??'navigation';
const text=result=>result.content.filter(item=>item.type==='text').map(item=>item.text).join('\n');
const call=async(name,args)=>{console.log('DevTools navigation:',name);const result=await client.call(name,args);records.push({name,args,result});if(result.isError)throw new Error(JSON.stringify(result));return result;};
try {
 await call('new_page',{url:'http://127.0.0.1:4176/preview/en/'});
 const pageId=Number(text(await call('list_pages',{})).match(/(?:^|\n)(\d+):.*4176/)?.[1]);if(!Number.isFinite(pageId))throw new Error('Missing target page');
 await call('emulate',{pageId,viewport:'390x844x1,mobile,touch',cpuThrottlingRate:4});
 await call('navigate_page',{pageId,url:'http://127.0.0.1:4176/preview/en/',type:'url'});
 await call('evaluate_script',{pageId,waitForStableDom:false,function:`()=>{window.navigationEvents=[];window.navigationObserver=new PerformanceObserver(list=>window.navigationEvents.push(...list.getEntries().map(entry=>({name:entry.name,duration:entry.duration,interactionId:entry.interactionId}))));window.navigationObserver.observe({type:'event',buffered:false,durationThreshold:16});}`});
 await call('performance_start_trace',{pageId,reload:false,autoStop:false});
 for(const label of ['Projects','Skills','Contact','Home']) {
  const menuSnapshot=text(await call('take_snapshot',{pageId}));
  const menu=menuSnapshot.match(/uid=(\S+) button "Open navigation"/);if(!menu)throw new Error(menuSnapshot.slice(0,2000));
  await call('click',{pageId,uid:menu[1]});
  const snapshot=text(await call('take_snapshot',{pageId}));
  const link=snapshot.match(new RegExp('uid=(\\S+) link "'+label+'"'));if(!link)throw new Error(snapshot.slice(0,2000));
  await call('click',{pageId,uid:link[1]});
  const path=label==='Home'?'':label.toLowerCase()+'/';
  await call('evaluate_script',{pageId,waitForStableDom:false,function:`async()=>{const end=performance.now()+4000;while(performance.now()<end&&(location.pathname!=='/preview/en/${path}'||document.querySelector('.route-stage')?.dataset.transition!=='idle'))await new Promise(resolve=>setTimeout(resolve,50));return {url:location.href,title:document.title,overflow:document.documentElement.scrollWidth>innerWidth,transition:document.querySelector('.route-stage')?.dataset.transition};}`});
 }
 const events=await call('evaluate_script',{pageId,waitForStableDom:false,function:`()=>{window.navigationObserver.disconnect();return {viewport:[innerWidth,innerHeight],cpu:'4x',events:window.navigationEvents,note:'Trusted MCP menu and page clicks; local lab observation, not field INP.'};}`});
 await writeFile(`output/playwright/motion-lab/${label}-events.json`,JSON.stringify(events,null,2));
 await call('performance_stop_trace',{pageId,filePath:`output/playwright/motion-lab/${label}-trace.json.gz`});
 console.log('Actual DevTools MCP mobile menu and four page transitions traced at CPU4x');
} finally {await writeFile(`output/playwright/motion-lab/${label}-devtools-session.json`,JSON.stringify(records,null,2));client.close();}

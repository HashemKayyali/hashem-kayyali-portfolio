import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');let result;
try{
 result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
  await page.goto('http://127.0.0.1:5176/preview/premium-review.html');
  return await page.evaluate(async()=>{
   const results=[];
   for(const source of ['overhaul-home.webm',...['hero-desktop','hero-mobile','hero-rtl','projects','projects-mobile','contact-rtl','contact-rtl-mobile'].flatMap(name=>['before','after'].map(phase=>'direction-'+phase+'-'+name+'.webm'))]){
    const video=document.createElement('video');video.src='/output/playwright/motion-lab/'+source;video.muted=true;video.preload='auto';document.body.append(video);
    await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});
    const canvas=document.createElement('canvas');canvas.width=144;canvas.height=100;const ctx=canvas.getContext('2d',{willReadFrequently:true});const samples=[];
    for(let seconds=.2;seconds<Math.min(video.duration,3.6);seconds+=.2){await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=seconds;});ctx.drawImage(video,0,0,144,100);const pixels=ctx.getImageData(0,0,144,100).data;let nonPaper=0;for(let i=0;i<pixels.length;i+=4)if(Math.min(pixels[i],pixels[i+1],pixels[i+2])<215)nonPaper++;samples.push({seconds:Number(seconds.toFixed(1)),nonPaperRatio:nonPaper/(144*100)});}
    results.push({source,duration:video.duration,firstVisibleFrame:samples.find(sample=>sample.nonPaperRatio>.005)?.seconds,samples});video.remove();
   }return {method:'Decoded actual browser WebM frames, sampled every 200ms; non-paper threshold finds text/image rather than blank warm background.',results};
  });
 }`});if(result.isError)throw Error(JSON.stringify(result));console.log('Old and new Hero recordings decoded and opening frames measured');
}finally{await writeFile('output/playwright/motion-lab/direction-opening-video-audit.json',JSON.stringify(result,null,2));await client.call('browser_close');client.close();}

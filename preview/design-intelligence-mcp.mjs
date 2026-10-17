import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';

// Already installed official server. No npx, download or package installation.
export async function connectDevtools(){
 const bin='C:/Users/hashe/AppData/Local/npm-cache/_npx/15c61037b1978c83/node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js';
 const child=spawn(process.execPath,[bin,'--headless','--isolated','--no-usage-statistics','--no-performance-crux','--viewport','1440x1000','--workspace',process.cwd()],{cwd:process.cwd(),windowsHide:true,stdio:['pipe','pipe','pipe']});
 let serial=0,buffer='';const pending=new Map(),log=[];
 child.stderr.on('data',data=>log.push(String(data)));
 child.stdout.on('data',data=>{buffer+=data;let end;while((end=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);try{const message=JSON.parse(line);if(pending.has(message.id)){pending.get(message.id)(message);pending.delete(message.id);}}catch{log.push(line);}}});
 const request=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('MCP timeout: '+method));},120000);pending.set(id,message=>{clearTimeout(timer);message.error?reject(Error(JSON.stringify(message.error))):resolve(message.result);});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
 await request('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'portfolio-v2-evidence',version:'1'}});
 child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
 const inventory=await request('tools/list');await mkdir('output/playwright/design-intelligence',{recursive:true});await writeFile('output/playwright/design-intelligence/devtools-installed-tools.json',JSON.stringify(inventory,null,2));
 return {call:(name,args={})=>request('tools/call',{name,arguments:args}),close:()=>{child.stdin.end();child.kill();},log};
}

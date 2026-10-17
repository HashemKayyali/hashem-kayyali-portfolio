import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');
try {
 await client.call('browser_navigate',{url:'http://127.0.0.1:4176/preview/'});
 const result=await client.call('browser_evaluate',{function:'() => document.querySelector(".hero-field canvas").toDataURL()'});
 const text=result.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
 const data=text.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)?.[1];if(!data)throw new Error(text.slice(0,600));
 await writeFile('output/playwright/motion-lab/fluid-still.png',Buffer.from(data,'base64'));
 console.log('Captured the implemented fluid renderer for the static fallback');
} finally {await client.call('browser_close');client.close();}

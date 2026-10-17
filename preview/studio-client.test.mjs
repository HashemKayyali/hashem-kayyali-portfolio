import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('./studio-client.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const client=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('client surfaces cloud setup failures instead of inventing success',async()=>{
 const previous=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({error:{code:'NOT_CONFIGURED',message:'Connect the database'}}),{status:503});
 try{await assert.rejects(client.studioRequest('items',{method:'POST',body:{caption:'draft'}}),error=>error.code==='NOT_CONFIGURED'&&error.status===503);}finally{globalThis.fetch=previous;}
});
test('client sends same-origin credentials and structured JSON',async()=>{
 const previous=globalThis.fetch;let request;
 globalThis.fetch=async(url,options)=>{request={url,options};return new Response(JSON.stringify({item:{id:'saved'}}));};
 try{assert.deepEqual(await client.studioRequest('items',{method:'PATCH',query:{resource:'posts',id:'a b'},body:{published:false}}),{item:{id:'saved'}});assert.match(request.url,/id=a\+b/);assert.equal(request.options.credentials,'same-origin');assert.deepEqual(JSON.parse(request.options.body),{published:false});}finally{globalThis.fetch=previous;}
});
test('uploads reject unsupported files before asking for a signed intent',async()=>{
 await assert.rejects(client.uploadStudioFile({type:'image/svg+xml',size:42},'',()=>{}),/JPEG/);
});
test('direct upload sends the file only to Cloudinary then registers a signed receipt',async()=>{
 const previousFetch=globalThis.fetch,previousXHR=globalThis.XMLHttpRequest;const requests=[];let form,progress;
 globalThis.fetch=async(url,options)=>{requests.push({url,body:JSON.parse(options.body)});return new Response(JSON.stringify(url.includes('upload-sign')?{url:'https://api.cloudinary.com/v1_1/test/image/upload',fields:{signature:'signed',api_key:'public'},receiptToken:'receipt',kind:'image',maxBytes:1000}:{item:{id:'media'}}));};
 globalThis.XMLHttpRequest=class{upload={};status=200;responseText=JSON.stringify({public_id:'upload',version:1,signature:'response',resource_type:'image'});open(method,url){assert.equal(method,'POST');assert.match(url,/api.cloudinary.com/);}send(body){form=body;this.upload.onprogress({lengthComputable:true,loaded:5,total:10});this.onload();}};
 try{const file=new File(['content'],'test.png',{type:'image/png'});assert.deepEqual(await client.uploadStudioFile(file,'A prototype',value=>progress=value),{id:'media'});assert.equal(progress,50);assert.equal(form.get('file').name,'test.png');assert.equal(form.get('signature'),'signed');assert.deepEqual(requests[0].body,{kind:'image',size:7});assert.deepEqual(requests[1].body,{receiptToken:'receipt',upload:{public_id:'upload',version:1,signature:'response',resource_type:'image'},alt:'A prototype'});assert.equal(requests.some(request=>'file'in request.body),false);}finally{globalThis.fetch=previousFetch;globalThis.XMLHttpRequest=previousXHR;}
});
test('media list traverses every server page',async()=>{
 const previous=globalThis.fetch;let calls=0;
 globalThis.fetch=async url=>{calls++;const offset=Number(new URL(url,'http://localhost').searchParams.get('offset'));return new Response(JSON.stringify({items:Array.from({length:offset===0?100:2},(_,i)=>({id:offset+i}))}));};
 try{const result=await client.listStudioItems('media');assert.equal(result.length,102);assert.equal(result.at(-1).id,101);assert.equal(calls,2);}finally{globalThis.fetch=previous;}
});
test('original social URLs allow real subdomains but reject credential and host tricks',()=>{
 for(const value of ['', 'https://www.linkedin.com/posts/123','https://linkedin.com','https://m.instagram.com/p/123'])assert.equal(client.studioSourceUrl(value),true,value);
 for(const value of ['javascript:alert(1)','http://linkedin.com/a','https://linkedin.com.evil.test/a','https://user:secret@instagram.com/p/a'])assert.equal(client.studioSourceUrl(value),false,value);
});

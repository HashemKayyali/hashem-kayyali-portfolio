// Static project media → Cloudinary: inventory, privacy classification, manifest and (gated) signed upload.
//
//   node scripts/cloudinary-media.mjs                      dry run: inventory + manifest + report, no network
//   node scripts/cloudinary-media.mjs --check              also checks that credentials are present (values never printed)
//   node scripts/cloudinary-media.mjs --upload --confirm=<public_id>[,<public_id>…] [--limit=N]
//                                                          signed upload of exactly the confirmed, approved assets
//
// Writes media/cloudinary-manifest.json (machine-readable, no secrets) and docs/engineering/CLOUDINARY-MANIFEST.md.
// Uploads go to portfolio/projects/{project}/{asset} or portfolio/site/{purpose}/{asset}: never portfolio/studio/.
// Credentials: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET from the environment or .env.local.
import {readFileSync,writeFileSync,readdirSync,statSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,relative,resolve,extname,basename,dirname} from 'node:path';
import {withheldMedia} from '../preview/media-policy.ts';
import {projectAssets} from '../data/projectAssets.ts';
import registered from '../preview/media-dimensions.ts';
import generated from '../preview/v2-media-dimensions.ts';

const root=resolve(import.meta.dirname,'..'),pub=join(root,'public');
const args=process.argv.slice(2),flag=name=>args.includes(`--${name}`)?true:args.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
const MANIFEST=join(root,'media/cloudinary-manifest.json'),REPORT=join(root,'docs/engineering/CLOUDINARY-MANIFEST.md');
const NAMESPACE='portfolio',MAX_BATCH=10;

// ---------- 1. Files and intrinsic dimensions (read from the file headers) ----------
const walk=dir=>readdirSync(dir).flatMap(name=>{const p=join(dir,name);return statSync(p).isDirectory()?walk(p):[p];});
// Format comes from the file's bytes, not its extension (some .webp files are really PNG or JPEG).
const sniff=buf=>buf.toString('ascii',1,4)==='PNG'?'.png':buf[0]===0xff&&buf[1]===0xd8?'.jpg':buf.toString('ascii',8,12)==='WEBP'?'.webp':buf.toString('ascii',4,12)==='ftypavif'?'.avif':buf.toString('ascii',0,3)==='GIF'?'.gif':null;
function dimensions(buf,ext){
 ext=sniff(buf)??ext;
 try{
  if(ext==='.png')return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
  if(ext==='.webp'){const kind=buf.toString('ascii',12,16);
   if(kind==='VP8 ')return {width:buf.readUInt16LE(26)&0x3fff,height:buf.readUInt16LE(28)&0x3fff};
   if(kind==='VP8L'){const b=buf.readUInt32LE(21);return {width:(b&0x3fff)+1,height:((b>>>14)&0x3fff)+1};}
   if(kind==='VP8X')return {width:1+buf.readUIntLE(24,3),height:1+buf.readUIntLE(27,3)};}
  if(ext==='.jpg'||ext==='.jpeg'){for(let i=2;i<buf.length;){if(buf[i]!==0xff){i++;continue;}const m=buf[i+1],len=buf.readUInt16BE(i+2);if(m>=0xc0&&m<=0xcf&&![0xc4,0xc8,0xcc].includes(m))return {width:buf.readUInt16BE(i+7),height:buf.readUInt16BE(i+5)};i+=2+len;}}
 }catch{}
 return null;
}
const RASTER=new Set(['.webp','.png','.jpg','.jpeg','.avif','.gif']),IMAGE=new Set([...RASTER,'.svg','.ico']);
const files=walk(pub).filter(f=>IMAGE.has(extname(f).toLowerCase())).map(file=>{
 const path='/'+relative(pub,file).replaceAll('\\','/'),ext=extname(file).toLowerCase(),buf=readFileSync(file);
 const actual=RASTER.has(ext)?sniff(buf)?.slice(1)??ext.slice(1):ext.slice(1);
 return {path,ext,format:actual,mislabeled:RASTER.has(ext)&&actual!==ext.slice(1).replace('jpeg','jpg'),bytes:buf.length,md5:createHash('md5').update(buf).digest('hex'),sha256:createHash('sha256').update(buf).digest('hex'),...(RASTER.has(ext)?dimensions(buf,ext):{}),file};
});

// ---------- 2. Who uses each file ----------
// Literal paths in the modules the live app actually loads (reachable from preview/main.tsx), plus the paths the code builds.
const reachable=new Set();
(function visit(file){
 if(reachable.has(file)||!existsSync(file))return;reachable.add(file);
 const text=readFileSync(file,'utf8');
 for(const m of text.matchAll(/(?:from\s*|import\s*\(\s*|import\s+)['"](\.{1,2}\/[^'"]+)['"]/g)){
  const base=resolve(dirname(file),m[1]);
  const hit=[base,...['.ts','.tsx','.mjs','.js','.css'].map(e=>base+e),...['/index.ts','/index.tsx'].map(e=>base+e)].find(f=>existsSync(f)&&statSync(f).isFile());
  if(hit)visit(hit);
 }
})(join(root,'preview/main.tsx'));
const sourceFiles=[...reachable].filter(f=>!/dimensions.ts$|cloudinary-static.ts$/.test(f)).concat([join(root,'preview/index.html')]);
const usage=new Map(),use=(path,where)=>{if(!usage.has(path))usage.set(path,new Map());const m=usage.get(path);m.set(where,(m.get(where)??0)+1);};
for(const file of sourceFiles){const text=readFileSync(file,'utf8'),where=relative(root,file).replaceAll('\\','/');
 for(const m of text.matchAll(/(?<![A-Za-z0-9_-])\/(?:projects|covers|images|v2-media|v2-icons|experience|engineering-process|brand)\/[A-Za-z0-9_./-]+\.(?:webp|png|jpe?g|svg|avif)/g))use(m[0],where);}
for(const f of files)if(/^\/[^/]+\.(png|ico|svg)$/.test(f.path)&&readFileSync(join(root,'preview/index.html'),'utf8').includes(f.path))use(f.path,'preview/index.html');
for(const a of projectAssets){
 use(a.image,`projectAssets ${a.id} cover`);a.gallery.forEach(g=>use(g,`projectAssets ${a.id} case gallery`));
 if(a.image.startsWith('/covers/'))for(const w of [320,640,960])use(a.image.replace('.webp',`-${w}.webp`),`ProductImage srcset (${a.id})`);
 else for(const w of [320,640])use(`/projects/${a.dir}/card-cover-thumb-${w}.webp`,`ProductImage srcset (${a.id})`);
}
use('/projects/eventies/thumbs/screenshot-02.webp','PortfolioSections secondary (eventies)');
// Experience logos render as <image>-thumb-320.webp (HomeStory, ExperienceJourney).
for(const m of readFileSync(join(root,'data/profile.ts'),'utf8').matchAll(/'(\/experience\/[a-z0-9-]+)\.webp'/g))use(m[1]+'-thumb-320.webp','HomeStory / ExperienceJourney logo (thumb-320)');
// StoryMedia swaps withheld sources for their redacted /v2-media/<stem>-<width> derivatives.
const stems={'terminal-cover':'terminal-nfc','terminal-invoices':'terminal-nfc','bike-interface-1':'bike-tower','bike-interface-2':'bike-tower','bike-interface-3':'bike-tower','bike-interface-4':'bike-tower','bike-concept':'bike-tower','eventies-concept':'eventies'};
const mapped={'/projects/the-terminal-nfc/cover.webp':'terminal-cover','/projects/the-terminal-nfc/screenshot-01.webp':'terminal-invoices',...Object.fromEntries([1,2,3,4].map(i=>[`/projects/bike-tower/screenshot-0${i}.webp`,`bike-interface-${i}`]))};
const sourcesInUse=new Set(projectAssets.flatMap(a=>[a.image,...a.gallery]));
const reachableText=sourceFiles.map(f=>readFileSync(f,'utf8')).join('\n');
for(const path of Object.keys(generated)){const stem=basename(path,'.webp').replace(/-\d+$/,'');if(!stems[stem])continue;
 const via=Object.entries(mapped).find(([source,s])=>s===stem&&sourcesInUse.has(source));
 if(via)use(path,`StoryMedia redacted derivative of ${via[0]}`);else if(reachableText.includes(`'concept:${stem}'`))use(path,`StoryMedia concept (${stems[stem]})`);}

// ---------- 3. Families, privacy class, migration decision ----------
const dirToId=Object.fromEntries(projectAssets.map(a=>[a.dir,a.id]));
const v2Info=Object.fromEntries(JSON.parse(readFileSync(join(pub,'v2-media/manifest.json'),'utf8')).map(e=>[e.stem,e]));
function family(path){
 // The family root is the file every smaller width was cut from; Cloudinary serves those widths itself.
 let m;
 if((m=path.match(/^\/covers\/([a-z-]+?)(?:-\d{3})?\.webp$/)))return {key:`/covers/${m[1]}`,project:m[1],asset:'cover',purpose:'projects'};
 if((m=path.match(/^\/projects\/([^/]+)\/(?:thumbs\/)?([a-z0-9-]+?)(?:-thumb-\d+)?\.(webp|png|jpe?g)$/))){const asset=m[2];return {key:`/projects/${m[1]}/${asset}`,project:dirToId[m[1]]??m[1],asset,purpose:'projects'};}
 if((m=path.match(/^\/v2-media\/([a-z0-9-]+?)-\d+\.webp$/))&&stems[m[1]])return {key:`/v2-media/${m[1]}`,project:stems[m[1]],asset:(v2Info[m[1]]?.redactions?'redacted-':'')+m[1].replace(/^(terminal|bike|eventies)-/,''),purpose:'projects',derivative:v2Info[m[1]]?.redactions?v2Info[m[1]]:undefined};
 if((m=path.match(/^\/experience\/([a-z0-9-]+?)(?:-thumb-\d+)?\.webp$/)))return {key:`/experience/${m[1]}`,asset:m[1],purpose:'site/experience'};
 if((m=path.match(/^\/engineering-process\/(\d\d-[a-z]+)(?:-640)?\.webp$/)))return {key:`/engineering-process/${m[1]}`,asset:m[1],purpose:'site/process'};
 return null;
}
const KEEP_LOCAL=[
 [/\.(svg|ico)$/,'vector/icon: tiny, cached, no responsive widths needed'],
 [/^\/(favicon|icon|apple-touch-icon|og-image)/,'favicon/app icon/social card: Sterling branding and social metadata stay local'],
 [/^\/(brand|v2-icons)\//,'brand marks and tool icons: small local assets'],
 [/^\/images\/hashem-profile\.webp$/,'home/about LCP portrait: same-origin preload avoids a new CDN connection on the critical path'],
 [/^\/(v2-media\/(fluid-still|home-silk-still|v1-warp-still)|images\/burgundy-warp-surface)/,'shader/smoke/warp still: part of the procedural renderer, out of scope'],
 [/^\/experience\//,'experience logos render at ≤320 px from 5–24 KB files: no measurable gain (owner decision, 19 Oct 2026)'],
];
const rows=files.map(f=>{
 const where=usage.get(f.path),refs=where?[...where.values()].reduce((a,b)=>a+b,0):0,fam=family(f.path);
 const reg=registered[f.path]??generated[f.path],dimsMismatch=reg&&f.width&&(reg.width!==f.width||reg.height!==f.height);
 let decision,reason,privacy='public';
 if(withheldMedia(f.path)){decision='never';privacy='withheld';reason='media-policy.ts withholds it (confidential raw source); build deletes it; production returns 404';}
 else if(/\/originals\//.test(f.path)){decision='unused';reason='full-size generation original, not referenced by the site';}
 else{const keep=KEEP_LOCAL.find(([re])=>re.test(f.path));
  if(keep){decision='keep-local';reason=keep[1];}
  else if(!refs&&!fam){decision='unused';reason='no runtime reference found';}
  else if(fam)decision='family';
  else{decision='keep-local';reason='not a project/site media family';}}
 if(fam?.derivative)privacy='public privacy derivative';
 return {...f,file:undefined,refs,usedBy:where?[...where.keys()]:[],family:fam,decision,reason,dimsMismatch:!!dimsMismatch,privacy};
});
// One upload per family: the widest approved, referenced member that is not withheld.
const families=new Map();
for(const r of rows.filter(r=>r.decision==='family'))(families.get(r.family.key)??families.set(r.family.key,[]).get(r.family.key)).push(r);
const previous=existsSync(MANIFEST)?JSON.parse(readFileSync(MANIFEST,'utf8')):{assets:[]};
const prior=Object.fromEntries(previous.assets.map(a=>[a.publicId,a]));
// Per-asset quality comes from the eco gate (scripts/cloudinary-quality.html?gate): q_auto unless eco passed.
const QUALITY=join(root,'media/cloudinary-quality.json'),gate=existsSync(QUALITY)?JSON.parse(readFileSync(QUALITY,'utf8')).assets??{}:{};
const assets=[];
for(const [key,members] of families){
 const referenced=members.filter(m=>m.refs>0);
 if(!referenced.length){for(const m of members){m.decision='unused';m.reason='family has no runtime reference';}continue;}
 const source=[...members].sort((a,b)=>(b.width??0)-(a.width??0)||b.bytes-a.bytes)[0];
 const fam=source.family,publicId=[NAMESPACE,fam.purpose,fam.project,fam.asset].filter(Boolean).join('/');
 const group=fam.derivative?'B':'A';
 for(const m of members){m.decision=m===source?'upload-source':'local-variant';m.reason=m===source?`uploads as ${publicId}`:`width variant of ${source.path}; replaced by a Cloudinary w_ transform, kept as local fallback`;m.publicId=publicId;}
 const before=prior[publicId];
 assets.push({publicId,group,project:fam.project??null,purpose:fam.purpose,source:source.path,format:source.format,width:source.width,height:source.height,bytes:source.bytes,md5:source.md5,sha256:source.sha256,
  localFallbacks:members.map(m=>m.path).sort(),usedBy:[...new Set(members.flatMap(m=>m.usedBy))],
  privacy:fam.derivative?`${fam.derivative.classification}; ${fam.derivative.redactions?.length??0} redaction boxes burned in`:'approved public media',
  quality:gate[publicId]?.md5===source.md5&&gate[publicId]?.pass?'eco':'auto',
  cloudinary:before?.md5===source.md5?before.cloudinary:before?.cloudinary?{...before.cloudinary,stale:true}:null});
}
{const ids=Object.groupBy(assets,a=>a.publicId);const clash=Object.entries(ids).filter(([,l])=>l.length>1);if(clash.length)throw new Error('Public ID collision: '+clash.map(([id,l])=>id+' <= '+l.map(a=>a.source).join(', ')).join('; '));}
assets.sort((a,b)=>a.group.localeCompare(b.group)||a.publicId.localeCompare(b.publicId));
// Duplicate content under different paths (same bytes) would become two Cloudinary assets.
const byHash=Object.groupBy(rows.filter(r=>RASTER.has(r.ext)),r=>r.sha256);
const duplicates=Object.values(byHash).filter(g=>g.length>1).map(g=>g.map(r=>r.path));

// ---------- 4. Write the manifest and the human-readable report ----------
const sum=list=>list.reduce((s,r)=>s+r.bytes,0),kb=b=>(b/1024).toFixed(1)+' KB',mb=b=>(b/1048576).toFixed(2)+' MB';
const manifest={generatedBy:'scripts/cloudinary-media.mjs',namespace:NAMESPACE,studioNamespace:'portfolio/studio (untouched)',deliveryTransforms:'f_auto,q_auto,c_limit,w_<width> via preview/cloudinary-delivery.ts',assets};
// The site reads only this generated lookup: local path → verified upload (group A only, never redacted derivatives).
const widthOf=Object.fromEntries(rows.map(r=>[r.path,r.width]));
function writeOutputs(){
 mkdirSync(dirname(MANIFEST),{recursive:true});writeFileSync(MANIFEST,JSON.stringify(manifest,null,1)+'\n');
 const entries=assets.filter(a=>a.group==='A'&&a.cloudinary&&!a.cloudinary.stale).flatMap(a=>a.localFallbacks.filter(path=>widthOf[path]).map(path=>[path,{url:a.cloudinary.secureUrl,width:a.width,height:a.height,quality:a.quality,variantWidth:widthOf[path]}])).sort(([x],[y])=>x.localeCompare(y));
 writeFileSync(join(root,'preview/cloudinary-static.ts'),['// Generated by scripts/cloudinary-media.mjs from media/cloudinary-manifest.json. Do not edit by hand.',
  '// Local path → its verified Cloudinary original (versioned URL). Read only when VITE_MEDIA_CDN=cloudinary.',
  "export type StaticMedia={url:string;width:number;height:number;quality:'auto'|'eco';variantWidth:number};",
  'export const STATIC_MEDIA:Record<string,StaticMedia>={',...entries.map(([path,v])=>' '+JSON.stringify(path)+':'+JSON.stringify(v)+','),'};',''].join('\n'));
}
writeOutputs();
const byDecision=Object.groupBy(rows,r=>r.decision);
const table=(list,cols)=>['| '+cols.map(c=>c[0]).join(' | ')+' |','|'+cols.map(()=>' --- ').join('|')+'|',...list.map(r=>'| '+cols.map(c=>String(c[1](r)).replaceAll('|','\\|')).join(' | ')+' |')].join('\n');
const dims=r=>r.width?`${r.width}×${r.height}`:'vector';
const md=`# Cloudinary migration manifest (dry run)

Generated by \`node scripts/cloudinary-media.mjs\` from \`public/\`, \`preview/media-policy.ts\`, \`data/projectAssets.ts\` and the dimension registries. Nothing has been uploaded unless the **Cloudinary** column shows a version.

**${files.length}** image files, **${mb(sum(rows))}** total. Uploads planned: **${assets.filter(a=>a.group==='A').length}** approved public originals (group A, ${mb(sum(assets.filter(a=>a.group==='A')))}) and **${assets.filter(a=>a.group==='B').length}** privacy-redacted derivatives that need your explicit OK (group B, ${mb(sum(assets.filter(a=>a.group==='B')))}). Every smaller width variant (${byDecision['local-variant']?.length??0} files) stays local as the fallback; Cloudinary serves those widths with \`w_\` transforms instead.

| Decision | Files | Bytes |
| --- | --- | --- |
${Object.entries(byDecision).map(([d,l])=>`| ${d} | ${l.length} | ${mb(sum(l))} |`).join('\n')}

## Group A: approved public media to upload

${table(assets.filter(a=>a.group==='A'),[['Public ID',a=>'`'+a.publicId+'`'],['Source',a=>'`'+a.source+'`'],['Size',a=>`${a.width}×${a.height}`],['Bytes',a=>kb(a.bytes)],['Local fallbacks',a=>a.localFallbacks.length],['Used by',a=>a.usedBy.slice(0,3).join('; ')],['Cloudinary',a=>a.cloudinary?`v${a.cloudinary.version}${a.cloudinary.stale?' (stale)':''}`:'—']])}

## Group B: privacy-redacted derivatives (confirm separately)

These are already public on the site, but their subjects are confidential (POS invoices, internal interfaces). They hold burned-in redactions. A public Cloudinary original stays reachable by URL even after the site stops using it.

${table(assets.filter(a=>a.group==='B'),[['Public ID',a=>'`'+a.publicId+'`'],['Source',a=>'`'+a.source+'`'],['Size',a=>`${a.width}×${a.height}`],['Bytes',a=>kb(a.bytes)],['Privacy',a=>a.privacy]])}

## Never uploaded: withheld by media-policy.ts

${table(byDecision.never??[],[['Path',r=>'`'+r.path+'`'],['Size',dims],['Bytes',r=>kb(r.bytes)]])}

## Kept local (not migrated)

${table(byDecision['keep-local']??[],[['Path',r=>'`'+r.path+'`'],['Size',dims],['Bytes',r=>kb(r.bytes)],['Refs',r=>r.refs],['Why',r=>r.reason]])}

## Not referenced by the site (not migrated)

${table(byDecision.unused??[],[['Path',r=>'`'+r.path+'`'],['Size',dims],['Bytes',r=>kb(r.bytes)],['Why',r=>r.reason]])}

## Full inventory

${table(rows.filter(r=>RASTER.has(r.ext)).sort((a,b)=>a.path.localeCompare(b.path)),[['Path',r=>'`'+r.path+'`'],['Project',r=>r.family?.project??'—'],['Size',dims],['Bytes',r=>kb(r.bytes)],['Format',r=>r.format],['Refs',r=>r.refs],['Used by',r=>r.usedBy.slice(0,2).join('; ')||'—'],['Privacy',r=>r.privacy],['Decision',r=>r.decision]])}

${duplicates.length?'## Identical files under different paths\n\n'+duplicates.map(g=>'- '+g.map(p=>'`'+p+'`').join(' = ')).join('\n')+'\n':''}${rows.some(r=>r.mislabeled)?'## File extension does not match content\n\nServed as `image/webp` but the bytes are another format. Browsers still render them; Cloudinary detects the real format.\n\n'+rows.filter(r=>r.mislabeled).map(r=>`- \`${r.path}\`: actually ${r.format.toUpperCase()}, ${dims(r)}, ${kb(r.bytes)}`).join('\n')+'\n\n':''}${rows.some(r=>r.dimsMismatch)?'## Registry mismatches\n\n'+rows.filter(r=>r.dimsMismatch).map(r=>`- \`${r.path}\`: file ${dims(r)}, registry ${JSON.stringify(registered[r.path]??generated[r.path])}`).join('\n')+'\n':''}`;
writeFileSync(REPORT,md);
console.log(`Inventory: ${files.length} files (${mb(sum(rows))}). Upload plan: ${assets.filter(a=>a.group==='A').length} group A + ${assets.filter(a=>a.group==='B').length} group B. Never: ${byDecision.never?.length??0}. Local variants: ${byDecision['local-variant']?.length??0}. Keep local: ${byDecision['keep-local']?.length??0}. Unused: ${byDecision.unused?.length??0}. Duplicates: ${duplicates.length}.`);
console.log(`Wrote ${relative(root,MANIFEST)} and ${relative(root,REPORT)}.`);

// ---------- 5. Credentials (presence only) and gated upload ----------
if(!flag('check')&&!flag('upload'))process.exit(0);
const env={...Object.fromEntries((existsSync(join(root,'.env.local'))?readFileSync(join(root,'.env.local'),'utf8'):'').split(/\r?\n/).map(l=>l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^(['"])(.*)\1$/,'$2')])),...Object.fromEntries(['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'].filter(k=>process.env[k]).map(k=>[k,process.env[k]]))};
const missing=['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'].filter(k=>!env[k]);
console.log('Credentials: '+['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'].map(k=>`${k} ${env[k]?'present':'MISSING'}`).join(', ')+'.');
if(missing.length){console.log('Configuration checkpoint: add the missing values to .env.local (gitignored) and rerun.');process.exit(2);}
if(!/^[a-zA-Z0-9_-]{1,80}$/.test(env.CLOUDINARY_CLOUD_NAME)){console.log('CLOUDINARY_CLOUD_NAME has an unexpected format.');process.exit(2);}
const api=`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}`,auth='Basic '+Buffer.from(env.CLOUDINARY_API_KEY+':'+env.CLOUDINARY_API_SECRET).toString('base64');
class Stop extends Error{}
async function request(url,init,label){
 // Bounded retry for transient failures; authentication, permission, quota and rate limits stop the run.
 for(let attempt=1;;attempt++){
  let response;try{response=await fetch(url,{...init,signal:AbortSignal.timeout(60_000)});}catch(error){if(attempt<4){await new Promise(r=>setTimeout(r,1000*2**(attempt-1)));continue;}throw new Stop(`${label}: network failure (${error.name})`);}
  if([401,403].includes(response.status))throw new Stop(`${label}: Cloudinary refused the credentials (${response.status}). Check the key pair; nothing else was attempted.`);
  if([420,429].includes(response.status))throw new Stop(`${label}: Cloudinary rate limit reached (${response.status}). Stopped safely; rerun later.`);
  if(response.status>=500&&attempt<4){await new Promise(r=>setTimeout(r,1000*2**(attempt-1)));continue;}
  const body=await response.json().catch(()=>({}));
  if(response.status===400&&/quota|limit|exceed/i.test(body?.error?.message??''))throw new Stop(`${label}: ${body.error.message}`);
  return {status:response.status,body};
 }
}
// The Admin API does not return a checksum, so the delivered original is downloaded and hashed instead.
const deliveredMd5=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(60_000)});if(!r.ok)throw new Stop(`delivery check ${url}: HTTP ${r.status}`);return createHash('md5').update(Buffer.from(await r.arrayBuffer())).digest('hex');};
const resource=publicId=>request(`${api}/resources/image/upload/${publicId.split('/').map(encodeURIComponent).join('/')}`,{headers:{Authorization:auth}},'lookup '+publicId);
if(flag('check')&&!flag('upload')){
 // Read-only: confirms the key pair works against the Admin API without creating anything.
 try{const {status,body}=await request(`${api}/usage`,{headers:{Authorization:auth}},'usage');console.log(status===200?`Cloudinary reachable. Plan: ${body.plan??'unknown'}; storage used: ${body.storage?.usage!=null?mb(body.storage.usage):'n/a'}; credits used: ${body.credits?.used_percent!=null?body.credits.used_percent+'%':'n/a'}.`:`Cloudinary check returned ${status}.`);process.exit(status===200?0:1);}
 catch(error){console.log(error.message);process.exit(1);}
}
const confirmed=String(flag('confirm')||'').split(',').filter(Boolean),limit=Math.min(MAX_BATCH,Number(flag('limit')||1));
const selected=assets.filter(a=>confirmed.includes(a.publicId));
const unknown=confirmed.filter(id=>!assets.some(a=>a.publicId===id));
if(!confirmed.length||unknown.length){console.log(unknown.length?`Not in the manifest (refused): ${unknown.join(', ')}`:'Upload needs --confirm=<public_id> naming each asset to upload.');process.exit(2);}
if(selected.some(a=>a.group==='B')&&!flag('allow-derivatives')){console.log('Group B privacy derivatives also need --allow-derivatives.');process.exit(2);}
if(selected.length>limit){console.log(`${selected.length} assets confirmed but --limit is ${limit} (max ${MAX_BATCH} per run).`);process.exit(2);}
const sign=params=>createHash('sha1').update(Object.keys(params).sort().map(k=>`${k}=${params[k]}`).join('&')+env.CLOUDINARY_API_SECRET).digest('hex');
const log=[];
try{
 for(const asset of selected){
  if(withheldMedia(asset.source))throw new Stop(`${asset.source} is withheld by media-policy.ts`);
  const local=readFileSync(join(pub,asset.source));
  if(createHash('md5').update(local).digest('hex')!==asset.md5)throw new Stop(`${asset.source} changed since the manifest was generated; rerun the dry run first.`);
  const existing=await resource(asset.publicId);
  let info;
  if(existing.status===200){
   // Never overwrite: an identical file is adopted, a different one stops the run.
   if(await deliveredMd5(existing.body.secure_url)!==asset.md5)throw new Stop(`${asset.publicId} already exists in Cloudinary with different content. Not overwritten.`);
   info=existing.body;log.push(`${asset.publicId}: already present with identical content (v${info.version}); adopted.`);
  }else if(existing.status===404){
   const params={overwrite:'false',public_id:asset.publicId,tags:'portfolio-static',timestamp:String(Math.floor(Date.now()/1000))};
   const form=new FormData();for(const [k,v] of Object.entries(params))form.append(k,v);
   form.append('api_key',env.CLOUDINARY_API_KEY);form.append('signature',sign(params));form.append('file',new Blob([local],{type:'image/'+asset.format}),basename(asset.source));
   const up=await request(`${api}/image/upload`,{method:'POST',body:form},'upload '+asset.publicId);
   if(up.status!==200)throw new Stop(`upload ${asset.publicId}: ${up.status} ${up.body?.error?.message??''}`);
   const check=await resource(asset.publicId);
   if(check.status!==200)throw new Stop(`${asset.publicId} uploaded but could not be verified (${check.status}).`);
   info=check.body;log.push(`${asset.publicId}: uploaded v${info.version}, ${info.width}×${info.height} ${info.format}, ${kb(info.bytes)}.`);
  }else throw new Stop(`lookup ${asset.publicId}: unexpected ${existing.status}`);
  const md5=await deliveredMd5(info.secure_url);
  if(md5!==asset.md5||info.width!==asset.width||info.height!==asset.height)throw new Stop(`${asset.publicId}: Cloudinary copy does not match the local original (checksum or dimensions).`);
  asset.cloudinary={version:info.version,format:info.format,width:info.width,height:info.height,bytes:info.bytes,md5,secureUrl:info.secure_url,verifiedAt:new Date().toISOString()};
  writeOutputs();
  await new Promise(r=>setTimeout(r,500));
 }
}catch(error){if(!(error instanceof Stop))throw error;log.push('STOPPED: '+error.message);process.exitCode=1;}
const reportFile=join(root,'docs/engineering/CLOUDINARY-UPLOAD-REPORT.md');
writeFileSync(reportFile,(existsSync(reportFile)?readFileSync(reportFile,'utf8'):'# Cloudinary upload report\n\nAppend-only log of controlled uploads (no credentials recorded).\n')+`\n## ${new Date().toISOString()}\n\n${log.map(l=>'- '+l).join('\n')}\n`);
console.log(log.join('\n'));

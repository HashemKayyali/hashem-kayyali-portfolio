import { defineConfig,loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {readdir,unlink} from 'node:fs/promises';
import {withheldMedia} from './media-policy';
import {studioApiPlugin} from '../server/studio/dev-plugin';
import {selectorKeys} from './css-selector-keys';

const root=path.resolve(import.meta.dirname,'..');
const safeMedia={name:'v2-public-media-policy',configureServer(server:any){server.middlewares.use((request:any,response:any,next:()=>void)=>{if(withheldMedia(new URL(request.url,'http://localhost').pathname)){response.statusCode=404;response.end();return;}next();});},configurePreviewServer(server:any){server.middlewares.use((request:any,response:any,next:()=>void)=>{if(withheldMedia(new URL(request.url,'http://localhost').pathname)){response.statusCode=404;response.end();return;}next();});},async closeBundle(){
 const target=path.resolve(root,'dist-light-preview');if(!target.startsWith(root+path.sep))throw new Error('Unexpected build target');
 const walk=async(directory:string)=>{for(const entry of await readdir(directory,{withFileTypes:true})){const full=path.resolve(directory,entry.name);if(!full.startsWith(target+path.sep))throw new Error('Unsafe build media path');if(entry.isDirectory())await walk(full);else if(entry.isFile()&&withheldMedia('/'+path.relative(target,full).replaceAll(path.sep,'/')))await unlink(full);}};
 if(existsSync(target))await walk(target);
}};
// Public pages live at /<locale>/... (served by preview/index.html); legacy /preview/<locale>/ links
// redirect there, matching vercel.json. V1's root index stays untouched.
const LOCALE_PAGE=/^\/(creative\/)?(en|ar|de|fr|es)(\/|$)/,LEGACY_PAGE=/^\/preview\/((?:creative\/)?(?:en|ar|de|fr|es)(?:\/.*)?)$/;
const routePages=(builtShells:boolean)=>(request:any,response:any,next:()=>void)=>{
 const url=new URL(request.url,'http://localhost'),pathname=url.pathname;
 const redirect=(to:string,status=301)=>{response.statusCode=status;response.setHeader('Location',to+url.search);response.end();};
 if(pathname==='/'||pathname==='/preview'||pathname==='/preview/')return redirect('/en/',pathname==='/'?302:301);
 const legacy=pathname.match(LEGACY_PAGE);if(legacy)return redirect('/'+legacy[1]);
 if(/^\/(en|ar|de|fr|es)$/.test(pathname))return redirect(pathname+'/');
 if(LOCALE_PAGE.test(pathname)&&request.headers.accept?.includes('text/html')&&!(builtShells&&existsSync(path.join(root,'dist-light-preview',pathname,'index.html'))))request.url='/preview/index.html';
 next();
};
const previewRoutes={name:'light-burgundy-page-routes',configureServer(server:any){server.middlewares.use(routePages(false));},configurePreviewServer(server:any){server.middlewares.use(routePages(true));}};

export default defineConfig(({mode})=>({
  root,
  plugins: [react(),safeMedia,studioApiPlugin({...loadEnv(mode,root,''),...process.env}),previewRoutes],
  // Rules ending in :is(...) are split into indexable selectors (see css-selector-keys.ts).
  css: { postcss: { plugins: [selectorKeys()] } },
  server: { host: '127.0.0.1', port: 5176, strictPort: true },
  preview: { host: '127.0.0.1', port: 4176, strictPort: true },
  build: { outDir: 'dist-light-preview', rollupOptions: { input: path.resolve(import.meta.dirname, 'index.html'),output:{manualChunks(id){if(id.replaceAll('\\','/').includes('/node_modules/gsap/'))return 'gsap-motion';}} } },
}));

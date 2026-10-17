import { defineConfig,loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {readdir,unlink} from 'node:fs/promises';
import {withheldMedia} from './media-policy';
import {studioApiPlugin} from '../server/studio/dev-plugin';

const root=path.resolve(import.meta.dirname,'..');
const safeMedia={name:'v2-public-media-policy',configureServer(server:any){server.middlewares.use((request:any,response:any,next:()=>void)=>{if(withheldMedia(new URL(request.url,'http://localhost').pathname)){response.statusCode=404;response.end();return;}next();});},configurePreviewServer(server:any){server.middlewares.use((request:any,response:any,next:()=>void)=>{if(withheldMedia(new URL(request.url,'http://localhost').pathname)){response.statusCode=404;response.end();return;}next();});},async closeBundle(){
 const target=path.resolve(root,'dist-light-preview');if(!target.startsWith(root+path.sep))throw new Error('Unexpected build target');
 const walk=async(directory:string)=>{for(const entry of await readdir(directory,{withFileTypes:true})){const full=path.resolve(directory,entry.name);if(!full.startsWith(target+path.sep))throw new Error('Unsafe build media path');if(entry.isDirectory())await walk(full);else if(entry.isFile()&&withheldMedia('/'+path.relative(target,full).replaceAll(path.sep,'/')))await unlink(full);}};
 if(existsSync(target))await walk(target);
}};
// V1's root index remains untouched. Deep V2 links must resolve to V2's entry.
const previewRoutes={name:'light-burgundy-page-routes',configureServer(server:any){server.middlewares.use((request:any,response:any,next:()=>void)=>{const pathname=new URL(request.url,'http://localhost').pathname;if(pathname==='/'){response.statusCode=302;response.setHeader('Location','/preview/en/');response.end();return;}if(/^\/preview\/(creative\/)?(en|ar|de|fr|es)(\/|$)/.test(pathname)&&request.headers.accept?.includes('text/html'))request.url='/preview/index.html';next();});},configurePreviewServer(server:any){server.middlewares.use((request:any,response:any,next:()=>void)=>{const pathname=new URL(request.url,'http://localhost').pathname;if(pathname==='/'){response.statusCode=302;response.setHeader('Location','/preview/en/');response.end();return;}const staticFile=path.join(root,'dist-light-preview',pathname,'index.html');if(/^\/preview\/(creative\/)?(en|ar|de|fr|es)(\/|$)/.test(pathname)&&request.headers.accept?.includes('text/html')&&!existsSync(staticFile))request.url='/preview/index.html';next();});}};

export default defineConfig(({mode})=>({
  root,
  plugins: [react(),safeMedia,studioApiPlugin({...loadEnv(mode,root,''),...process.env}),previewRoutes],
  server: { host: '127.0.0.1', port: 5176, strictPort: true },
  preview: { host: '127.0.0.1', port: 4176, strictPort: true },
  build: { outDir: 'dist-light-preview', rollupOptions: { input: path.resolve(import.meta.dirname, 'index.html'),output:{manualChunks(id){if(id.replaceAll('\\','/').includes('/node_modules/gsap/'))return 'gsap-motion';}} } },
}));

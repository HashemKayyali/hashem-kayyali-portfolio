import {V1_EDITORIAL_FRAGMENT_SHADER} from './v1-warp-shader';

/*
 * Hero smoke renderer (17 Oct 2026). Owns a transferred OffscreenCanvas and draws on its own
 * requestAnimationFrame clock, so route changes on the main thread never pause the smoke.
 * Resolution adapts to measured frame pacing; composition never changes with it (uv-based).
 */
// Derived from the protected V1 shader (left unchanged): two finishing steps only.
// 1. The hero's side fade is painted into the frame itself, blending toward the page paper with the
//    same stops the CSS mask used. A GPU mask over this worker-drawn canvas can fall out of step on
//    some GPUs and expose a sliver of unfaded smoke at the edge (owner-reported vertical line).
// 2. Sub-LSB ordered noise removes gradient banding without visible grain.
const FADE=`uniform vec3 u_paper;
uniform float u_fade;
float edgeFade(float u){
  if(u<0.10)return mix(0.0,0.03,u/0.10);
  if(u<0.20)return mix(0.03,0.12,(u-0.10)/0.10);
  if(u<0.32)return mix(0.12,0.32,(u-0.20)/0.12);
  if(u<0.46)return mix(0.32,0.62,(u-0.32)/0.14);
  if(u<0.60)return mix(0.62,0.86,(u-0.46)/0.14);
  if(u<0.78)return mix(0.86,1.0,(u-0.60)/0.18);
  return 1.0;
}`;
const FINISH=`if (u_fade != 0.0) { float side = gl_FragCoord.x / u_resolution.x; if (u_fade < 0.0) side = 1.0 - side; color = mix(u_paper, color, edgeFade(side)); }
  color += (hash(gl_FragCoord.xy + fract(u_time * 7.0)) - 0.5) / 255.0;
  gl_FragColor = vec4(color, 1.0);`;
const SHADER=V1_EDITORIAL_FRAGMENT_SHADER
 .replace(/uniform float u_density;/,'uniform float u_density;\n'+FADE)
 .replace(/gl_FragColor = vec4\(color, 1\.0\);/,FINISH);

type Init={type:'init';canvas:OffscreenCanvas;ramp:number[][];paper:number[];fade:number;time:number;width:number;height:number;dpr:number;density:number;mobile:boolean};
const scope=self as unknown as {postMessage:(m:unknown)=>void;requestAnimationFrame?:(cb:(t:number)=>void)=>number;cancelAnimationFrame?:(id:number)=>void};
let gl:WebGLRenderingContext|null=null,canvas:OffscreenCanvas,uTime:WebGLUniformLocation|null,uRes:WebGLUniformLocation|null,uDensity:WebGLUniformLocation|null,uPaper:WebGLUniformLocation|null,uFade:WebGLUniformLocation|null,pigments:(WebGLUniformLocation|null)[]=[];
let cssW=1,cssH=1,dpr=1,mobile=false,scale=1,maxScale=1,minScale=.45;
let time=4.2,last=0,running=false,frameId=0,first=true;
let ramp:number[][]=[],from:number[][]=[],to:number[][]=[],blendStart=0,blendDuration=0;
let paper:number[]=[0,0,0],paperFrom:number[]=[0,0,0],paperTo:number[]=[0,0,0];
const intervals:number[]=[];let calm=0,frames=0;const recent:number[]=[];
const raf=(cb:(t:number)=>void)=>scope.requestAnimationFrame?scope.requestAnimationFrame(cb):setTimeout(()=>cb(performance.now()),16) as unknown as number;
const caf=(id:number)=>scope.cancelAnimationFrame?scope.cancelAnimationFrame(id):clearTimeout(id);

function size(){
 if(!gl)return;
 const w=Math.max(64,Math.round(cssW*dpr*scale)),h=Math.max(64,Math.round(cssH*dpr*scale));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 gl.viewport(0,0,w,h);gl.uniform2f(uRes,w,h);
}
function adapt(dt:number){
 // Median of recent frame intervals: sustained slow frames lower resolution, long calm raises it.
 intervals.push(dt);if(intervals.length<24)return;
 const median=[...intervals].sort((a,b)=>a-b)[12];intervals.length=0;
 const target=18.5;
 if(median>target*1.25&&scale>minScale){scale=Math.max(minScale,scale*.85);calm=0;size();}
 else if(median<target*.95&&scale<maxScale&&++calm>=5){scale=Math.min(maxScale,scale*1.08);calm=0;size();}
}
function frame(now:number){
 if(!running||!gl)return;
 const dt=last?now-last:16.7;last=now;
 // ≈60 fps everywhere (high-refresh displays skip alternate frames); slow GPUs lose resolution, not frames.
 if(dt<13){frameId=raf(frame);last=now-dt;return;}
 time+=Math.min(dt,100)/1000;if(!first)adapt(dt);frames++;recent.push(dt);if(recent.length>240)recent.shift();
 if(blendDuration){const k=Math.min(1,(time-blendStart)/blendDuration);ramp=to.map((c,i)=>c.map((v,j)=>from[i][j]+(v-from[i][j])*k));paper=paperTo.map((v,j)=>paperFrom[j]+(v-paperFrom[j])*k);if(k>=1)blendDuration=0;}
 ramp.forEach((c,i)=>gl!.uniform3f(pigments[i],c[0],c[1],c[2]));gl.uniform3f(uPaper,paper[0],paper[1],paper[2]);
 gl.uniform1f(uTime,time);gl.drawArrays(gl.TRIANGLES,0,6);
 if(first){first=false;scope.postMessage({type:'ready'});}
 frameId=raf(frame);
}
function start(){if(running||!gl)return;running=true;last=0;frameId=raf(frame);}
function stop(){running=false;caf(frameId);}

self.onmessage=({data})=>{
 try{
  if(data.type==='init'){
   const m=data as Init;canvas=m.canvas;cssW=m.width;cssH=m.height;dpr=m.dpr;mobile=m.mobile;time=m.time;ramp=from=to=m.ramp;paper=paperFrom=paperTo=m.paper;
   maxScale=mobile?Math.min(1,1.25/dpr):Math.min(1,1.5/dpr);minScale=maxScale*.55;scale=mobile?maxScale*.75:maxScale*.85;
   gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'default',preserveDrawingBuffer:false}) as WebGLRenderingContext|null;
   if(!gl)throw Error('WebGL unavailable');
   const compile=(kind:number,source:string)=>{const s=gl!.createShader(kind)!;gl!.shaderSource(s,source);gl!.compileShader(s);if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS))throw Error('Shader');return s;};
   const program=gl.createProgram()!;gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,SHADER));gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program');gl.useProgram(program);
   gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
   uTime=gl.getUniformLocation(program,'u_time');uRes=gl.getUniformLocation(program,'u_resolution');uDensity=gl.getUniformLocation(program,'u_density');
   pigments=ramp.map((_,i)=>gl!.getUniformLocation(program,'u_c'+i));gl.uniform1f(uDensity,m.density);
   uPaper=gl.getUniformLocation(program,'u_paper');uFade=gl.getUniformLocation(program,'u_fade');gl.uniform1f(uFade,m.fade);
   size();start();return;
  }
  if(!gl)return;
  if(data.type==='resize'){cssW=data.width;cssH=data.height;dpr=data.dpr;gl.uniform1f(uDensity,data.density);size();return;}
  if(data.type==='run'){data.running?start():stop();return;}
  if(data.type==='palette'){from=ramp.map(c=>[...c]);to=data.ramp;paperFrom=[...paper];paperTo=data.paper??paper;blendStart=time;blendDuration=data.duration||0;if(!blendDuration){ramp=from=to;paper=paperFrom=paperTo;}return;}
  if(data.type==='fade'){gl.uniform1f(uFade,data.fade);return;}
  if(data.type==='stats'){{const sorted=[...recent].sort((a,b)=>a-b),q=(p:number)=>Math.round(sorted[Math.floor(p*(sorted.length-1))]??0);scope.postMessage({type:'stats',width:canvas.width,height:canvas.height,cssW:Math.round(cssW),cssH:Math.round(cssH),dpr,scale:+scale.toFixed(2),running,frames,p50:q(.5),p95:q(.95),over33:recent.filter(v=>v>33.4).length,samples:recent.length});}return;}
 }catch{scope.postMessage({type:'unavailable'});}
};

import {V1_FRAGMENT_SHADER,V1_EDITORIAL_FRAGMENT_SHADER} from './v1-warp-shader';
const rgb=(hex:string)=>{const n=parseInt(hex.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255] as const;};
function renderer(id:string,fragment:string,ramp:string[]){
 const canvas=document.getElementById(id) as HTMLCanvasElement;canvas.width=512;canvas.height=384;
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true})!;
 const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader)??'Shader failed');return shader;};
 const program=gl.createProgram()!;gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}'));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 gl.viewport(0,0,512,384);gl.uniform2f(gl.getUniformLocation(program,'u_resolution'),512,384);gl.uniform1f(gl.getUniformLocation(program,'u_density'),1);ramp.forEach((hex,i)=>gl.uniform3f(gl.getUniformLocation(program,'u_c'+i),...rgb(hex)));
 const time=gl.getUniformLocation(program,'u_time');return (seconds:number)=>{gl.uniform1f(time,seconds);gl.drawArrays(gl.TRIANGLES,0,6);};
}
const original=renderer('original',V1_FRAGMENT_SHADER,['#130105','#25030b','#4d0d1c','#741b30','#902a44']);
const editorial=renderer('editorial',V1_EDITORIAL_FRAGMENT_SHADER,['#FCFAF9','#FCFAF9','#58152D','#70203A','#3E1022']);
let paused=matchMedia('(prefers-reduced-motion:reduce)').matches,time=4.2,previous=0;
const draw=(seconds:number)=>{original(seconds);editorial(seconds);};draw(time);
document.getElementById('pause')!.onclick=()=>{paused=!paused;};
setInterval(()=>{const now=performance.now();if(!paused&&!document.hidden){time+=previous?Math.min((now-previous)/1000,.1):0;draw(time);}previous=now;},1000/15);
Object.assign(window,{__v1SmokeReference:{draw,pause:()=>{paused=true;draw(4.2);},still:()=>{paused=true;draw(4.2);return (document.getElementById('editorial') as HTMLCanvasElement).toDataURL('image/webp',.94);}}});

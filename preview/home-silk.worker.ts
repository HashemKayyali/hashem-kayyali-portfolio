import {V1_EDITORIAL_FRAGMENT_SHADER} from './v1-warp-shader';

// The real V1 shader runs once in a shared worker, away from GSAP's UI thread.
let gl:WebGLRenderingContext|null=null;
let canvas:OffscreenCanvas,program:WebGLProgram,time:WebGLUniformLocation|null;
let ramp:number[][]=[],fromRamp:number[][]=[],targetRamp:number[][]=[],paletteTime=0,paletteDuration=.4;
let pigments:Array<WebGLUniformLocation|null>=[],resolution:WebGLUniformLocation|null=null,density:WebGLUniformLocation|null=null;
const workerScope=self as unknown as {postMessage:(message:unknown,transfer?:Transferable[])=>void};
self.onmessage=({data})=>{
 try{
  if(data.type==='resize'){if(gl){canvas.width=data.width;canvas.height=data.height;gl.viewport(0,0,data.width,data.height);gl.uniform2f(resolution,data.width,data.height);gl.uniform1f(density,data.density??1);}return;}
  if(data.type==='palette'){fromRamp=ramp.map(rgb=>[...rgb]);targetRamp=data.ramp;paletteTime=data.time;paletteDuration=data.duration??.4;if(!paletteDuration)ramp=fromRamp=targetRamp;return;}
  if(data.type==='init'){
   canvas=new OffscreenCanvas(data.width,data.height);
   gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:false});
   if(!gl)throw Error('WebGL unavailable');
   const compile=(kind:number,source:string)=>{
    const shader=gl!.createShader(kind);if(!shader)throw Error('Shader unavailable');
    gl!.shaderSource(shader,source);gl!.compileShader(shader);
    if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)){gl!.deleteShader(shader);throw Error('Shader unavailable');}
    return shader;
   };
   program=gl.createProgram()!;
   const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}');
   const fragment=compile(gl.FRAGMENT_SHADER,V1_EDITORIAL_FRAGMENT_SHADER);
   gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
   gl.deleteShader(vertex);gl.deleteShader(fragment);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');
   gl.useProgram(program);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
   resolution=gl.getUniformLocation(program,'u_resolution');density=gl.getUniformLocation(program,'u_density');
   gl.viewport(0,0,data.width,data.height);gl.uniform2f(resolution,data.width,data.height);
   gl.uniform1f(density,data.density??1);
   ramp=data.ramp;fromRamp=data.ramp;targetRamp=data.ramp;
   pigments=ramp.map((_,index)=>gl!.getUniformLocation(program,'u_c'+index));
   time=gl.getUniformLocation(program,'u_time');
  }
  if(gl){const blend=paletteDuration?Math.min(1,Math.max(0,((data.time??4.2)-paletteTime)/paletteDuration)):1;ramp=targetRamp.map((rgb,index)=>rgb.map((v,i)=>fromRamp[index][i]+(v-fromRamp[index][i])*blend));ramp.forEach((rgb,index)=>gl!.uniform3f(pigments[index],rgb[0],rgb[1],rgb[2]));gl.uniform1f(time,data.time??4.2);gl.drawArrays(gl.TRIANGLES,0,6);const bitmap=canvas.transferToImageBitmap();workerScope.postMessage({bitmap},[bitmap]);}
 }catch{workerScope.postMessage({unavailable:true});}
};

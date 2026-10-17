// V1's domain-warped fluid field, deliberately reduced to three noise octaves,
// one shared low-resolution context, a warm palette, no vignette or grain.
import {readBrandPalette,colorVector} from './brand-palette';
const fragment=`precision mediump float;
uniform vec2 resolution;uniform float time;uniform float ribbonLook;uniform float smokeLook;uniform float mobileQuality;
uniform vec3 paperColor;uniform vec3 highlightColor;uniform vec3 secondaryColor;uniform vec3 burgundyColor;uniform vec3 surfaceColor;uniform vec3 wineColor;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.0,a=.54;mat2 r=mat2(.82,.57,-.57,.82);for(int i=0;i<3;i++){if(i==2&&mobileQuality>.5)break;v+=a*noise(p);p=r*p*2.03+.17;a*=.5;}return v;}
void main(){
 vec2 p=gl_FragCoord.xy/resolution-.5;p.x*=resolution.x/resolution.y;
 if(ribbonLook>.5){
  float t=time*.16;
  float bend=.30*sin(p.y*4.4-t)+.07*sin(p.y*7.1+t*.6);
  float d=p.x-bend;
  float band=1.0-smoothstep(.17,.23,abs(d));
  float fold=.5+.5*sin(d*17.0+p.y*1.7-t*.35);
  vec3 paper=paperColor,rose=highlightColor,burgundy=burgundyColor;
  vec3 silk=mix(rose,burgundy,smoothstep(.3,.95,fold)*.85);
  silk=mix(silk,paper,pow(1.0-fold,5.0)*.7);
  gl_FragColor=vec4(mix(paper,silk,band*.83),1.0);return;
 }
 if(smokeLook>.5){
  float t=time*.12;
  vec2 q=vec2(fbm(p*2.0+vec2(0,t*.45)),fbm(p*2.0+vec2(4.7,1.3)-vec2(t*.24,0)));
  float field=fbm(p*2.45+q*2.5+vec2(t*.14,-t*.11));
  float curl=.5+.5*sin((p.x*.7+p.y*.5+field*1.7)*7.2-t*.65);
  float envelope=1.0-smoothstep(.32,.86,length(vec2(p.x*.94,p.y*1.27)));
  float density=clamp((field*.82+curl*.38)*envelope,0.0,1.0);
  // Spacious paper, neutral vapor, then genuine Wine at the dense folds.
  // Midtones never interpolate through rose/highlight or secondary magenta.
  vec3 vapor=mix(paperColor,highlightColor,smoothstep(.30,.80,density)*.78);
  vec3 ink=mix(burgundyColor,wineColor,smoothstep(.70,.91,density)*.55);
  vec3 color=mix(vapor,ink,smoothstep(.58,.74,density));
  gl_FragColor=vec4(color,1.0);return;
 }
 float t=time*.19;
 vec2 q=vec2(fbm(p*2.2+vec2(0,t*.42)),fbm(p*2.2+vec2(4.7,1.3)-vec2(t*.28,0)));
 vec2 r=vec2(fbm(p*2.55+2.1*q+vec2(1.9,8.8)+vec2(t*.22,0)),fbm(p*2.55+2.1*q+vec2(8.1,2.6)-vec2(0,t*.20)));
 float field=fbm(p*2.75+2.55*r);
 float ribbon=.5+.5*sin((p.x+p.y*.42+field*1.72)*7.0-t*.72);
 float folds=smoothstep(.18,.92,field*.88+ribbon*.34);
 vec3 paper=paperColor,blush=surfaceColor,rose=secondaryColor,burgundy=burgundyColor;
 vec3 color=mix(paper,blush,smoothstep(.05,.58,field));
 color=mix(color,rose,smoothstep(.23,.80,folds)*.7);
 color=mix(color,burgundy,smoothstep(.42,.74,folds)*.45);
 color=mix(color,paper,pow(ribbon,6.0)*.55);
 gl_FragColor=vec4(color,1.0);
}`;
export function createLightWarp(width:number,height:number) {
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const gl=canvas.getContext('webgl',{antialias:false,depth:false,stencil:false,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:true});
 if(!gl) return null;
 const shaders:WebGLShader[]=[];
 const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Shader unavailable');return shader;};
 let program:WebGLProgram|null=null;let buffer:WebGLBuffer|null=null;
 const dispose=()=>{if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(shader=>gl.deleteShader(shader));gl.getExtension('WEBGL_lose_context')?.loseContext();};
 try {
  program=gl.createProgram()!;
  gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0,1);}'));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader unavailable');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  gl.viewport(0,0,width,height);gl.uniform2f(gl.getUniformLocation(program,'resolution'),width,height);
  const colors=readBrandPalette();
  for(const [uniform,color] of Object.entries({paperColor:colors.paper,highlightColor:colors.highlight,secondaryColor:colors.secondary,burgundyColor:colors.primary,surfaceColor:colors.surface,wineColor:colors.wine}))gl.uniform3f(gl.getUniformLocation(program,uniform),...colorVector(color));
  gl.uniform1f(gl.getUniformLocation(program,'mobileQuality'),width<=256?1:0);
  const smoke=gl.getUniformLocation(program,'smokeLook');
  const time=gl.getUniformLocation(program,'time');
  const look=gl.getUniformLocation(program,'ribbonLook');
  return {canvas,draw:(seconds:number,ribbon=false,smoky=false)=>{gl.uniform1f(smoke,smoky?1:0);gl.uniform1f(time,seconds);gl.uniform1f(look,ribbon?1:0);gl.drawArrays(gl.TRIANGLES,0,6);},dispose};
 } catch {dispose();return null;}
}

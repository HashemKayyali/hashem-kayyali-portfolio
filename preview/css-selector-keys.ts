/*
 * Build-time selector rewrite (24 Oct 2026). A rule whose last compound is `:is(...)` has no key
 * the browser can index (id, class or tag), so Blink tests it against every element on every style
 * recalc. The 10 s theme cycle restyles the whole page; ~110 such rules were 80% of that selector
 * time. `A :is(x, y)` is rewritten to `A x, A y`. Each branch is padded to the original specificity
 * with never-matching negations (`:not(#_k)`, `:not(._k)`, `:not(_k)`), so the cascade is unchanged.
 * A tag branch in a list with class branches cannot reach the exact specificity with an indexable
 * key (h1 can never weigh exactly one class), so it gets the smallest padding not below the original:
 * it can only win a tie it used to lose. The computed-style diff of every element on every page
 * (scripts in the 24 Oct 2026 commit notes) found no change from this.
 * Source CSS stays readable; only the served CSS changes. Covered by css-selector-keys.test.mjs.
 */
type Spec=[number,number,number];

const WHITESPACE=/\s/;
const IDENT_START=/[A-Za-z_\- -￿\\]/;
const IDENT=/[\w\- -￿]/;
const ELEMENT_LIKE_PSEUDO=['before','after','first-line','first-letter'];

/** Splits at top-level occurrences of `separator` (outside (), [] and strings). */
function splitTop(input:string,separator:string){
 const parts:string[]=[];let depth=0,quote='',start=0;
 for(let i=0;i<input.length;i++){
  const c=input[i];
  if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='\\'){i++;continue;}
  if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
  else if(depth===0&&c===separator){parts.push(input.slice(start,i));start=i+1;}
 }
 parts.push(input.slice(start));return parts.map(part=>part.trim());
}

/** Index where the last compound of a complex selector starts (after the last top-level combinator). */
function lastCompoundStart(selector:string){
 let depth=0,quote='',start=0;
 for(let i=0;i<selector.length;i++){
  const c=selector[i];
  if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='\\'){i++;continue;}
  if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
  else if(depth===0&&(WHITESPACE.test(c)||c==='>'||c==='+'||c==='~'))start=i+1;
 }
 return start;
}

/** Index of the parenthesis closing the one opened at `open`. */
function closing(input:string,open:number){
 let depth=0,quote='';
 for(let i=open;i<input.length;i++){
  const c=input[i];
  if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='\\'){i++;continue;}
  if(c==='(')depth++;else if(c===')'&&--depth===0)return i;
 }
 return -1;
}

function skipIdent(text:string,i:number){while(i<text.length&&(IDENT.test(text[i])||text[i]==='\\')){if(text[i]==='\\')i++;i++;}return i;}

const add=(a:Spec,b:Spec):Spec=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const greater=(a:Spec,b:Spec)=>a[0]!==b[0]?a[0]>b[0]:a[1]!==b[1]?a[1]>b[1]:a[2]>b[2];
const maxOf=(list:Spec[])=>list.reduce((m,s)=>greater(s,m)?s:m,[0,0,0] as Spec);

/** Selectors Level 4 specificity of a complex selector (enough for the forms used in this site). */
export function specificity(selector:string):Spec{
 let total:Spec=[0,0,0];
 for(let i=0;i<selector.length;){
  const c=selector[i];
  if(c==='#'){total=add(total,[1,0,0]);i=skipIdent(selector,i+1);}
  else if(c==='.'){total=add(total,[0,1,0]);i=skipIdent(selector,i+1);}
  else if(c==='['){let depth=0;for(;i<selector.length;i++){if(selector[i]==='[')depth++;else if(selector[i]===']'&&--depth===0){i++;break;}}total=add(total,[0,1,0]);}
  else if(c===':'){
   if(selector[i+1]===':'){total=add(total,[0,0,1]);i=skipIdent(selector,i+2);if(selector[i]==='(')i=closing(selector,i)+1;continue;}
   const nameEnd=skipIdent(selector,i+1),name=selector.slice(i+1,nameEnd).toLowerCase();
   if(selector[nameEnd]==='('){
    const end=closing(selector,nameEnd),inner=selector.slice(nameEnd+1,end);
    if(name==='where'){/* zero specificity */}
    else if(name==='is'||name==='not'||name==='has'||name==='matches')total=add(total,maxOf(splitTop(inner,',').map(specificity)));
    else if(name==='nth-child'||name==='nth-last-child'){total=add(total,[0,1,0]);const of=inner.split(/\sof\s/i)[1];if(of)total=add(total,maxOf(splitTop(of,',').map(specificity)));}
    else total=add(total,[0,1,0]);
    i=end+1;
   }else{
    total=add(total,ELEMENT_LIKE_PSEUDO.includes(name)?[0,0,1]:[0,1,0]);
    i=nameEnd;
   }
  }
  else if(c==='*'||c==='>'||c==='+'||c==='~'||c==='&'||c==='|'||WHITESPACE.test(c))i++;
  else if(IDENT_START.test(c)){total=add(total,[0,0,1]);i=skipIdent(selector,i);}
  else i++;
 }
 return total;
}

/** Never-matching negations that add exactly `pad` to a compound's specificity. */
function padding(pad:Spec){return ':not(#_k)'.repeat(pad[0])+':not(._k)'.repeat(pad[1])+':not(_k)'.repeat(pad[2]);}

/** Rewrites one complex selector whose last compound is :is(...). */
export function splitTrailingIs(selector:string):string[]{
 const start=lastCompoundStart(selector),compound=selector.slice(start);
 if(!/^:is\(/i.test(compound))return [selector];
 const open=compound.indexOf('('),end=closing(compound,open);if(end<0)return [selector];
 const suffix=compound.slice(end+1);
 // A further :is()/:where() in the suffix would keep the rule unindexed; leave such rules alone.
 if(/:(is|where|matches)\(/i.test(suffix))return [selector];
 const branches=splitTop(compound.slice(open+1,end),',');
 if(branches.some(branch=>!branch))return [selector];
 const target=maxOf(branches.map(specificity));
 const prefix=selector.slice(0,start);
 const out:string[]=[];
 for(const branch of branches){
  const own=specificity(branch),pad=[target[0]-own[0],target[1]-own[1],target[2]-own[2]].map(value=>Math.max(0,value)) as Spec;
  // Pseudo-elements must stay last: padding goes after the branch and before the suffix.
  out.push(prefix+branch+padding(pad)+suffix);
 }
 return out;
}

export function rewriteSelectorList(list:string){
 if(!list.includes(':is('))return list;
 return splitTop(list,',').flatMap(splitTrailingIs).join(',');
}

/** PostCSS plugin (no import needed: Vite runs its own PostCSS). */
export function selectorKeys(){
 return {postcssPlugin:'portfolio-selector-keys',Rule(rule:{selector:string}){
  const next=rewriteSelectorList(rule.selector);if(next!==rule.selector)rule.selector=next;
 }};
}

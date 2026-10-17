type ReadingPosition={selector:string;offset:number};
/** Preserve the section being read across translations, even when copy reflows. */
export function captureReadingPosition(root:HTMLElement|null):ReadingPosition|undefined{
 if(!root||scrollY<100)return;
 const line=160;
 const candidates=[...root.querySelectorAll<HTMLElement>('main section[id],main [data-home-scene],main article[data-project],main .profile-chapter[id],main .profile-company[id],main .profile-skill-section[id]')]
  .filter(el=>{const r=el.getBoundingClientRect();return r.top<=line&&r.bottom>line;})
  .sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height);
 const painted=document.elementFromPoint(innerWidth/2,line)?.closest<HTMLElement>('[data-home-scene],article[data-project]');
 const target=painted&&candidates.includes(painted)?painted:candidates[0];if(!target)return;
 const selector=target.dataset.homeScene?`[data-home-scene="${target.dataset.homeScene}"]`:target.dataset.project?`article[data-project="${target.dataset.project}"]`:`#${CSS.escape(target.id)}`;
 return {selector,offset:target.getBoundingClientRect().top};
}
export function restoreReadingPosition(root:HTMLElement|null,position:ReadingPosition|undefined):boolean{
 const target=position&&root?.querySelector<HTMLElement>(position.selector);
 if(!target||!position)return false;
 scrollTo({top:scrollY+target.getBoundingClientRect().top-position.offset,behavior:'instant'});return true;
}

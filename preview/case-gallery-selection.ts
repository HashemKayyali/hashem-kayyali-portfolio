/** Decode gates never change the readable slide until the latest intent is ready. */
export function createGallerySelection(
 prepare:(index:number)=>Promise<unknown>,
 commit:(index:number)=>void,
 pending?:(index:number|null)=>void,
){
 let intent=0,disposed=false;
 return {
  async request(index:number){
   if(disposed)return false;
   const token=++intent;pending?.(index);
   try{await prepare(index);}catch{if(!disposed&&token===intent)pending?.(null);return false;}
   if(disposed||token!==intent)return false;
   commit(index);pending?.(null);return true;
  },
  cancel(){intent++;if(!disposed)pending?.(null);},
  dispose(){intent++;disposed=true;},
 };
}

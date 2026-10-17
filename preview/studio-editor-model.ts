export type EditorDraft={media_id:string;caption:string;authored_at:string;source_url:string;title:string;alt:string;project_id:string};
export type EditorState={selected:string|null;draft:EditorDraft|null;dirty:boolean;request:{token:number;selected:string|null}|null};
type EditorAction=
 |{type:'select';id:string|null;draft:EditorDraft|null}
 |{type:'change';key:keyof EditorDraft;value:string}
 |{type:'start';token:number}
 |{type:'saved';token:number;id:string}
 |{type:'failed';token:number};
export function createEditorState(date:string):EditorState{return {selected:null,draft:{media_id:'',caption:'',authored_at:date,source_url:'',title:'',alt:'',project_id:''},dirty:false,request:null};}
/** The form identity and its draft transition together; a pending write owns them. */
export function editorReducer(state:EditorState,action:EditorAction):EditorState{
 switch(action.type){
  case 'select':return state.request?state:{selected:action.id,draft:action.draft,dirty:false,request:null};
  case 'change':return state.request||!state.draft?state:{...state,draft:{...state.draft,[action.key]:action.value},dirty:true};
  case 'start':return state.request?state:{...state,request:{token:action.token,selected:state.selected}};
  case 'saved':return state.request?.token===action.token&&state.request.selected===state.selected?{...state,selected:action.id,dirty:false,request:null}:state;
  case 'failed':return state.request?.token===action.token?{...state,request:null}:state;
 }
}
export function editorMove(resource:'posts'|'gallery',items:ReadonlyArray<{id:string}>,index:number,direction:number){
 if(!items[index]||index+direction<0||index+direction>=items.length)return null;
 return {resource,id:items[index].id,direction:direction<0?'up' as const:'down' as const};
}
export function nextEditorialOrder(items:ReadonlyArray<{sort_order:number}>){return items.reduce((highest,item)=>Math.max(highest,item.sort_order),-1)+1;}

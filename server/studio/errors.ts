export class StudioError extends Error {
 status:number;code:string;headers:Record<string,string>;
 constructor(status:number,code:string,message:string,headers:Record<string,string>={}){super(message);this.status=status;this.code=code;this.headers=headers;}
}
export const bad=(message:string):never=>{throw new StudioError(400,'INVALID_INPUT',message);};

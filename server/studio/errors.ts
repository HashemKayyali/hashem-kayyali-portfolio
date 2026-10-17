export class StudioError extends Error {
 status:number;code:string;
 constructor(status:number,code:string,message:string){super(message);this.status=status;this.code=code;}
}
export const bad=(message:string):never=>{throw new StudioError(400,'INVALID_INPUT',message);};

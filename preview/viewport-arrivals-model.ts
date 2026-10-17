type ArrivalCandidate={top:number;bottom:number;width:number;height:number;viewportHeight:number;rendered:boolean;focused:boolean;allowed:boolean};

/** Restore visible/passed content immediately; never prepare filtered layout. */
export function arrivalDisposition(candidate:ArrivalCandidate):'settled'|'deferred'|'armed'{
 if(!candidate.allowed||candidate.focused)return 'settled';
 if(!candidate.rendered||candidate.width<=0||candidate.height<=0)return 'deferred';
 return candidate.top<=candidate.viewportHeight||candidate.bottom<=0?'settled':'armed';
}

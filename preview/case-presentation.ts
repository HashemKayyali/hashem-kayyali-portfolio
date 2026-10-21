import {projectAssets,type ProjectAsset} from '../data/projectAssets.ts';
import type {ProjectId} from '../content/types';
type Presentation={identity:string;opening:'landscape'|'split'|'layers'|'diagram'|'portrait';evidence:'real'|'redacted'|'illustration'|'supplied';order:'engineering-first'|'product-first';build:'gallery'|'pair'|'single'|'diagram'};
/** Presentation choices only. Facts, status and technologies come from dictionaries. */
export const casePresentation:Record<ProjectId,Presentation>={
 'bike-tower':{identity:'physical-competition',opening:'landscape',evidence:'real',order:'engineering-first',build:'gallery'},
 'terminal-nfc':{identity:'venue-operations',opening:'split',evidence:'supplied',order:'engineering-first',build:'single'},
 eventies:{identity:'service-marketplace',opening:'layers',evidence:'real',order:'product-first',build:'gallery'},
 'basket-beats':{identity:'impact-to-event',opening:'landscape',evidence:'real',order:'engineering-first',build:'single'},
 'glitzz-lab':{identity:'connected-service',opening:'layers',evidence:'real',order:'product-first',build:'gallery'},
 'umniah-youthconnect':{identity:'role-aware-operation',opening:'diagram',evidence:'illustration',order:'product-first',build:'diagram'},
 'vr-cycling':{identity:'physical-to-virtual',opening:'split',evidence:'supplied',order:'engineering-first',build:'single'},
 'bike-land-trainer':{identity:'live-measurement',opening:'portrait',evidence:'real',order:'engineering-first',build:'pair'},
 'financial-operations':{identity:'financial-integrity',opening:'diagram',evidence:'illustration',order:'engineering-first',build:'diagram'},
 'outreach-automation':{identity:'message-orchestration',opening:'diagram',evidence:'illustration',order:'product-first',build:'pair'},
 'traffic-flow-analytics':{identity:'movement-analysis',opening:'split',evidence:'real',order:'engineering-first',build:'single'},
};
export function visibleCaseMedia(asset:ProjectAsset):string[] {
 // The Terminal's old POS poster and its invoice screenshot (/projects/the-terminal-nfc/) are retired; only the supplied current-system cover is shown.
 if(asset.id==='terminal-nfc')return asset.image.startsWith('/covers/')?[asset.image]:[];
 // Umniah screenshots stay confidential: only the owner-approved supplied cover is shown.
 if(asset.id==='umniah-youthconnect')return asset.image.startsWith('/covers/')?[asset.image]:[];
 return [asset.image,...(asset.id==='glitzz-lab'?asset.gallery.slice(0,5):asset.gallery)];
}
export function caseNeighbors(id:ProjectId) {
 const i=projectAssets.findIndex(asset=>asset.id===id),length=projectAssets.length;
 return {previous:projectAssets[(i-1+length)%length],next:projectAssets[(i+1)%length]};
}

import type {CSSProperties} from 'react';
import {mediaSize} from './StoryMedia';
import type {ProjectAsset} from '../data/projectAssets';
import {getStudioProjectCover} from './studio-media-registry';

export const productMediaSource=(asset:ProjectAsset)=>getStudioProjectCover(asset.id)?.url??asset.image;
/** Bound a native-ratio frame by both available width and a responsive height. */
export function mediaFrameStyle(source:string):CSSProperties{
 const size=mediaSize(source);
 return {'--media-ratio':size?String(size.width/size.height):'1.6'} as CSSProperties;
}

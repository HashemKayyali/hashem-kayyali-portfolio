import React from 'react';
import type {ProjectAsset} from '../data/projectAssets';
import {ProductImage} from './PortfolioSections';
import {mediaFrameStyle,productMediaSource} from './media-frame';

/** Discovery shows only the approved cover. Additional evidence stays in details. */
export default function ProjectMediaSet({asset,eager=false}:{asset:ProjectAsset;eager?:boolean}){
 return <div className="project-media-set"><div className="project-media-primary" style={mediaFrameStyle(productMediaSource(asset))}><ProductImage asset={asset} full eager={eager} sizes="(max-width:700px) 92vw, (min-width:1800px) 820px, 620px"/></div></div>;
}

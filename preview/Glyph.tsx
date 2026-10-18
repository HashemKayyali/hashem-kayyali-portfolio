import React from 'react';
import {ArrowDown,ArrowLeft,ArrowUpDown,ArrowUpRight} from 'lucide-react';

const icons={'up-right':ArrowUpRight,down:ArrowDown,left:ArrowLeft,'up-down':ArrowUpDown};
/** Interface arrows drawn as SVG. Text arrows (↗ ↕) render as colour emoji on iOS. Sized to the text (1em). */
export default function Glyph({name}:{name:keyof typeof icons}){
 const Icon=icons[name];
 return <Icon className="glyph" size="1em" strokeWidth={1.6} aria-hidden="true" focusable="false"/>;
}

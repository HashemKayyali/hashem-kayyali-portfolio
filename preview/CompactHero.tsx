import React, {useId} from 'react';
import './compact-hero.css';

export type CompactHeroProps = {
 eyebrow:string;
 title:string;
 description?:string;
 visual?:React.ReactNode;
 actions?:React.ReactNode;
 className?:string;
 children?:React.ReactNode;
};

/** Shared smoke-backed opening. Its parent owns the page's main landmark. */
export const CompactHero:React.FC<CompactHeroProps> = ({eyebrow,title,description,visual,actions,className='',children}) => {
 const id=useId();
 return <section className={`compact-hero ${className}`} aria-labelledby={id}>
  <div className="compact-hero-copy"><span className="compact-hero-eyebrow">{eyebrow}</span><h1 id={id} tabIndex={-1}>{title}</h1>{description&&<p className="compact-hero-description">{description}</p>}{actions&&<div className="compact-hero-actions">{actions}</div>}{children}</div>
  {visual&&<div className="compact-hero-visual">{visual}</div>}
 </section>;
};
export default CompactHero;

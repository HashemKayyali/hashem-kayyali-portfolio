import React, { useRef } from 'react';
import Glyph from './Glyph';
import { useI18n, format } from '../i18n/useI18n';
import type { ProjectId } from '../content/types';
import { projectAssets, isSuppliedCover, type ProjectAsset } from '../data/projectAssets';
import { PROFILE_IMAGE, RESUME_PDF } from '../data/profile';
import MotionField from './MotionField';
import HomeSilk from './HomeSilk';
import dimensions from './media-dimensions';
import { type PreviewRoute, type Navigate } from './routes';
import {caseCopy} from './case-copy';
import {terminalEvidence} from './terminal-evidence';
import StoryMedia from './StoryMedia';
import {storyCopy} from './story-copy';
import {NavLink} from './PageShell';
import {pageCopy} from './page-copy';
import {useFeaturedMotion} from './motion';
import {getStudioProjectCover,studioCoverSource,studioProjectAlt} from './studio-media-registry';
import {cloudinarySrcSet,cloudinaryUrl} from './cloudinary-delivery';

const Arrow = () => <span className="arrow" aria-hidden="true"><Glyph name="up-right"/></span>;
const Index = ({ children }: { children: React.ReactNode }) => <span className="index" dir="ltr">{children}</span>;

export function ProductImage({ asset, full = false, eager = false, sizes = '(max-width: 700px) 90vw, (max-width: 1100px) 55vw, 760px' }: { asset: ProjectAsset; full?: boolean; eager?: boolean; sizes?: string }) {
  const { t,locale } = useI18n();
  const uploaded=getStudioProjectCover(asset.id);
  if(uploaded)return <img src={cloudinaryUrl(uploaded.url,1600)} srcSet={cloudinarySrcSet(uploaded.url,uploaded.width)} width={uploaded.width} height={uploaded.height} alt={studioProjectAlt(asset.id,uploaded.url,t.projects[asset.id].title)} loading={eager?'eager':'lazy'} decoding="async" sizes={sizes}/>;
  // A different bundled original chosen as cover renders like the case opening that the flight lands on.
  const original=studioCoverSource(asset.id);
  if(original&&original!==asset.image)return <StoryMedia source={original} alt={studioProjectAlt(asset.id,original,t.projects[asset.id].title)} eager={eager} priority={eager} sizes={sizes}/>;
  const raster = asset.image.endsWith('.webp');
  // Supplied covers carry their own -320/-640/-960 widths next to the full image.
  const supplied = isSuppliedCover(asset.image);
  const thumbs = supplied ? asset.image.replace(/\.webp$/, '') : `/projects/${asset.dir}/card-cover-thumb`;
  const source = full || !raster ? asset.image : `${thumbs}-640.webp`;
  const size = dimensions[source];
  return <img src={source} width={size.width} height={size.height}
    srcSet={raster ? [`${thumbs}-320.webp`, `${thumbs}-640.webp`, ...(supplied ? [`${thumbs}-960.webp`] : []), asset.image].map(url => `${url} ${dimensions[url].width}w`).join(', ') : undefined}
    sizes={sizes}
    loading={eager ? 'eager' : 'lazy'} decoding="async"
    fetchPriority={eager?'high':undefined}
    alt={studioProjectAlt(asset.id, asset.image, supplied ? `${t.projects[asset.id].title}. ${terminalEvidence[asset.image]?.[locale].alt??caseCopy[locale].supplied}` : t.projects[asset.id].mediaCaption ?? format(t.projectModal.a11y.screenshot, { title: t.projects[asset.id].title, index: 1 }))} />;
}

export function Hero({route,navigate}:{route:PreviewRoute;navigate:Navigate}) {
  const { t } = useI18n();
  const [role, software, ...scope] = t.identity.role.split(' | ');
  return <section className="hero" id="home" aria-labelledby="hero-title">

    <div className="container hero-layout">
      <div className="hero-copy"><div className="eyebrow"><span className="brand-dash" aria-hidden="true" />{t.contact.eyebrow}</div>
        <h1 id="hero-title" tabIndex={-1}>{t.identity.name.split(' ').map((name,index)=><React.Fragment key={name}>{index>0&&' '}<span className="hero-name-mask"><span className={`hero-name-part hero-name-part--${index}`}>{name}</span></span></React.Fragment>)}</h1>
        <p className="hero-role"><span className="hero-role-mask"><span className="hero-role-primary">{role}</span></span><span className="hero-role-mask"><span className="hero-role-secondary">{software}</span></span></p>
        <p className="hero-scope">{scope.join(' · ')}</p>
        <p className="hero-statement">{t.hero.headline}</p>
        <div className="actions"><NavLink className="button-primary" route={{...route,page:'projects',project:undefined}} navigate={navigate}>{t.hero.actions.viewProjects}<Arrow /></NavLink><a className="button-text" href={RESUME_PDF} target="_blank" rel="noopener noreferrer">{t.hero.actions.downloadResume}<span aria-hidden="true"><Glyph name="down"/></span></a></div>
        <p className="hero-location"><span className="location-dot" aria-hidden="true" />{t.identity.location}</p>
      </div>
      <figure className="portrait"><HomeSilk className="hero-field"/><span className="portrait-edition" aria-hidden="true" dir="ltr">HK / R&amp;D</span><div className="portrait-reveal"><div className="portrait-frame"><img src={PROFILE_IMAGE} width="720" height="1280" alt={t.ui.alt.profile} fetchPriority="high" loading="eager" decoding="async" /><span className="portrait-rule" aria-hidden="true" /></div></div><figcaption><span>{t.identity.name}</span><span>{t.about.engineeringFocus[2]}</span></figcaption></figure>
    </div>
    <div className="container hero-footnote"><Index>01</Index><p>{t.hero.supporting}</p><a href="#projects" aria-label={t.hero.actions.viewProjects}><span aria-hidden="true"><Glyph name="down"/></span></a></div>
  </section>;
}

export const FeaturedProject: React.FC<{ asset: ProjectAsset; route: PreviewRoute; navigate: Navigate; index: number }> = ({ asset, route, navigate, index }) => {
  const { t,locale } = useI18n();
  const copy = t.projects[asset.id];
  const root=useRef<HTMLElement>(null);
  useFeaturedMotion(root,`${asset.id}:${locale}`,locale==='ar',route.page==='home');
  return <article ref={root} className={`featured-project featured-project--${index}`} data-project={asset.id}>
    <NavLink className="project-destination" route={{...route,page:'projects',project:asset.id}} navigate={navigate}>
      <div className="project-visual"><div className="spotlight-image">{asset.id === 'eventies' && (route.page==='home'?<HomeSilk className="spotlight-field"/>:<MotionField className="spotlight-field" look="ribbon"/>)}<div className="project-media-reveal"><div className="product-image"><div className="project-image-depth"><ProductImage asset={asset} full sizes={index===0?'(max-width:700px) 92vw, 1320px':'(max-width:700px) 92vw, 820px'} /></div></div></div><span className="image-link"><Arrow /></span></div><figure className="project-secondary"><div className="project-secondary-media">{asset.id==='eventies'?<img src={`/projects/${asset.dir}/thumbs/screenshot-02.webp`} width="320" height="200" loading="lazy" decoding="async" alt={format(t.projectModal.a11y.screenshot,{title:copy.title,index:2})}/>:<StoryMedia source={asset.gallery[0]} sizes="(max-width:700px) 70vw, 370px" alt={`${copy.title}. ${storyCopy[locale].redacted}`}/>}</div><figcaption>{asset.id==='eventies'?storyCopy[locale].real:storyCopy[locale].redacted}</figcaption></figure>{asset.id==='terminal-nfc'&&<span className="project-evidence">{storyCopy[locale].redacted}</span>}</div>
      <div className="spotlight-copy"><div className="project-meta"><Index>{String(projectAssets.indexOf(asset) + 1).padStart(2, '0')}</Index><span>{t.projectsSection.filters[asset.categoryKey]}</span></div><h3>{copy.title}</h3><p>{copy.short}</p><ul className="project-technical">{copy.technology.slice(0,3).map(technology=><li key={technology}><bdi>{technology}</bdi></li>)}</ul><div className="project-bottom"><span>{copy.status}</span><span className="project-action">{t.actions.viewProject}<Arrow /></span></div></div>
    </NavLink>
  </article>;
};

export const featuredIds: ProjectId[] = ['eventies', 'bike-tower', 'basket-beats'];

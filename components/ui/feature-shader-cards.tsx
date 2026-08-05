"use client";

import type React from 'react';
import { ExternalLink, LockKeyhole, MoveUpRight } from 'lucide-react';
import BurgundyWarpBackground from './burgundy-warp-background';

interface FeatureShaderCardProps {
  title: string;
  category: string;
  description: string;
  status: string;
  image: string;
  tech: string[];
  liveUrl?: string;
  index?: number;
  onClick: () => void;
}

const FeatureShaderCard: React.FC<FeatureShaderCardProps> = ({
  title,
  category,
  description,
  status,
  image,
  tech,
  liveUrl,
  index = 0,
  onClick,
}) => {
  const cardImage = image.endsWith('/cover.webp')
    ? image.replace('/cover.webp', '/card-cover.webp')
    : image;

  return (
    <article
      className="project-card-content group relative isolate h-full overflow-hidden rounded-[1.65rem] border border-[rgba(77,13,28,0.18)] bg-white ring-1 ring-[rgba(77,13,28,0.08)] shadow-[0_0_0_1px_rgba(77,13,28,0.08),0_0_20px_rgba(77,13,28,0.14)] transition-[transform,box-shadow,border-color] duration-300 before:pointer-events-none before:absolute before:inset-[1px] before:z-30 before:rounded-[calc(1.65rem-1px)] before:border before:border-white/45 before:content-[''] hover:-translate-y-1.5 hover:border-[rgba(77,13,28,0.25)] hover:shadow-[0_0_0_1px_rgba(77,13,28,0.12),0_0_29px_rgba(77,13,28,0.22)]"
    >
      <button
        type="button"
        onClick={onClick}
        className="focus-ring flex h-full w-full flex-col text-left"
        aria-label={`View ${title} case study`}
      >
        <div className="relative shrink-0 overflow-hidden bg-primary">
          <img
            src={cardImage}
            srcSet={`${cardImage} 900w, ${image} 1600w`}
            sizes="(min-width: 1536px) 31vw, (min-width: 768px) 46vw, 94vw"
            alt={`${title} project cover`}
            loading="lazy"
            decoding="async"
            className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.045]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#24020b]/35 to-transparent" />
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-soft backdrop-blur-sm">
            {liveUrl ? <ExternalLink size={17} /> : <LockKeyhole size={17} />}
          </div>
        </div>

        <div className="relative isolate flex min-h-[20rem] flex-1 flex-col overflow-hidden bg-[#300510] p-5 text-white 2xl:min-h-[21rem] 2xl:p-6">
          <BurgundyWarpBackground
            index={index}
            className="-z-30"
            overlayOpacity={0.18}
            rootMargin="90px 0px"
          />

          <div className="absolute left-5 right-5 top-0 h-px -translate-y-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

          <p className="text-[11px] font-bold uppercase tracking-[0.19em] text-white/75">{category}</p>
          <h3 className="mt-2.5 font-heading text-xl font-extrabold leading-tight text-white 2xl:text-[1.45rem]">
            {title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-white/80 2xl:text-[15px] 2xl:leading-7">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {tech.slice(0, 4).map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/55 bg-black/10 px-3 py-1 text-[11px] font-semibold text-white/90"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-auto flex min-h-[3.35rem] shrink-0 items-end justify-between border-t border-white/55 pt-4 2xl:mt-6">
            <span className="max-w-[62%] text-xs font-semibold leading-5 text-white/62">{status}</span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-extrabold text-white">
              View project
              <MoveUpRight
                size={17}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
};

export default FeatureShaderCard;

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/profile';
import { ArrowRight, Download, MessageCircle } from 'lucide-react';

const Hero: React.FC = () => {
  const taglineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = taglineRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      element.textContent = profile.tagline;
      return;
    }

    let index = 0;
    let timer = 0;

    const typeNextCharacter = () => {
      if (document.hidden) {
        timer = window.setTimeout(typeNextCharacter, 120);
        return;
      }

      index += 1;
      element.textContent = profile.tagline.slice(0, index);

      if (index < profile.tagline.length) {
        timer = window.setTimeout(typeNextCharacter, 24);
      }
    };

    timer = window.setTimeout(typeNextCharacter, 180);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden bg-transparent px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10 xl:min-h-[calc(100svh-2rem)] xl:px-12 xl:py-12 2xl:px-16 2xl:py-16">
      <div className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-[1180px] items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.72fr)] xl:min-h-[calc(100svh-8rem)] xl:gap-12 2xl:max-w-[1240px] 2xl:gap-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-silver sm:text-sm">Available for software and R&D opportunities</p>
          <h2 className="mt-5 max-w-[760px] font-heading text-[clamp(2.7rem,3.7vw,4.25rem)] font-extrabold leading-[1.02] tracking-tight sm:mt-6">
            Building complete products across software and real-world systems.
          </h2>
          <p className="mt-5 text-lg font-semibold text-white/88 sm:text-xl 2xl:text-2xl">{profile.role}</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
            <span ref={taglineRef} />
            <span className="ml-1 animate-pulse text-silver">|</span>
          </p>

          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
            <a href="#portfolio" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition hover:-translate-y-0.5 hover:shadow-soft sm:px-6 sm:py-3.5 sm:text-base">
              View Projects <ArrowRight size={18} />
            </a>
            <a href="/resume/hashem-kayyali-resume.pdf" download className="inline-flex items-center gap-2 rounded-full border border-white/45 px-5 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-primary sm:px-6 sm:py-3.5 sm:text-base">
              <Download size={18} /> Download Resume
            </a>
            <a href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-bold text-white/75 transition hover:text-white sm:px-4 sm:py-3.5 sm:text-base">
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-5 text-xs text-white/65 sm:mt-10 sm:gap-x-7 sm:gap-y-3 sm:pt-6 sm:text-sm">
            <span>Next.js · React Native · Flutter</span>
            <span>Web · Mobile · Desktop</span>
            <span>ESP32 · Sensors · Real-Time Systems</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.1 }} className="mx-auto w-full max-w-[360px] sm:max-w-[390px] 2xl:max-w-[430px]">
          <div className="overflow-hidden rounded-[1.75rem] border-[7px] border-white bg-white shadow-panel sm:border-[8px] 2xl:rounded-[2rem]">
            <img
              src="/images/hashem-profile.webp"
              alt="Hashem Kayyali profile"
              width="900"
              height="900"
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="mt-4 flex items-center justify-between border-b border-white/25 pb-3 text-xs text-white/70 sm:mt-5 sm:pb-4 sm:text-sm">
            <span>Amman, Jordan</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

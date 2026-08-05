import React from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'mist' | 'burgundy';
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  subtitle,
  children,
  className = '',
  variant = 'white',
}) => {
  const variantClasses = {
    white: 'bg-white text-primary',
    mist: 'bg-mist text-primary',
    burgundy: 'bg-transparent text-white',
  }[variant];

  return (
    <section id={id} className={`content-section relative scroll-mt-6 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 xl:px-12 xl:py-20 2xl:px-16 2xl:py-24 ${variantClasses} ${className}`}>
      <div className="mx-auto max-w-[1180px] 2xl:max-w-[1240px]">
        {(title || subtitle) && (
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.55 }}
            className="mb-10 max-w-3xl sm:mb-12 xl:mb-14"
          >
            {title && <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl xl:text-5xl">{title}</h2>}
            <div className={`mt-5 h-1 w-20 ${variant === 'burgundy' ? 'bg-white' : 'bg-primary'}`} />
            {subtitle && (
              <p className={`mt-5 text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 ${variant === 'burgundy' ? 'text-white/75' : 'text-primary/70'}`}>
                {subtitle}
              </p>
            )}
          </motion.header>
        )}
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;

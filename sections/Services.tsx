import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Code2, Cpu, Lightbulb } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { services } from '../data/profile';

const icons = [Lightbulb, Code2, Cpu, Bot];

const Services: React.FC = () => (
  <SectionWrapper id="services" title="What I Build" subtitle="Capabilities shaped around complete product delivery, not a single framework or platform." variant="burgundy">
    <div className="grid gap-4 md:grid-cols-2 2xl:gap-5">
      {services.map((service, index) => {
        const Icon = icons[index] ?? Code2;
        return (
          <motion.article key={service.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-3xl border border-white/20 bg-white p-6 text-primary shadow-soft 2xl:p-8">
            <span className="inline-flex rounded-2xl bg-primary p-3 text-white"><Icon size={24} /></span>
            <h3 className="mt-4 font-heading text-xl font-extrabold 2xl:mt-5 2xl:text-2xl">{service.title}</h3>
            <p className="mt-4 leading-7 text-primary/68">{service.description}</p>
          </motion.article>
        );
      })}
    </div>
  </SectionWrapper>
);

export default Services;

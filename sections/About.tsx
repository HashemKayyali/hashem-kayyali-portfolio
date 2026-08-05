import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, Database, Layers3, Smartphone } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { profile, skillGroups } from '../data/profile';

const iconMap = [Code2, Smartphone, Database, Cpu, Layers3];

const About: React.FC = () => (
  <SectionWrapper id="about" title="About Me" subtitle="A product-minded engineer combining software, connected systems, technical operations, and real-world product delivery." variant="white">
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 2xl:gap-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative isolate overflow-hidden rounded-3xl bg-[#300510] p-6 text-white shadow-soft sm:p-8 2xl:p-10">
        <BurgundyWarpBackground index={8} className="-z-10" overlayOpacity={0.2} />
        <p className="text-base leading-7 text-white/82 sm:text-lg sm:leading-8 2xl:text-xl 2xl:leading-9">{profile.aboutParagraph}</p>
        <div className="mt-6 border-t border-white/20 pt-5 2xl:mt-8 2xl:pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-silver">Target roles</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.targetRoles.map((role) => <span key={role} className="rounded-full border border-white/30 px-3 py-1.5 text-sm text-white">{role}</span>)}
          </div>
        </div>
      </motion.div>

      <div>
        <h3 className="font-heading text-xl font-extrabold text-primary sm:text-2xl">Technical toolkit</h3>
        <p className="mt-3 max-w-2xl leading-7 text-primary/65">Most of my project work uses Next.js, React Native, and Flutter, supported by backend, automation, and embedded technologies.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:mt-8 2xl:gap-4">
          {skillGroups.map((group, index) => {
            const Icon = iconMap[index] ?? Layers3;
            return (
              <motion.div key={group.category} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-primary/12 bg-mist p-5 transition hover:border-primary/30 hover:shadow-soft 2xl:p-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-primary p-2.5 text-white"><Icon size={19} /></span>
                  <h4 className="font-heading font-extrabold text-primary">{group.category}</h4>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">{item}</span>)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>

    <div className="mt-12 grid gap-4 border-t border-silver/35 pt-8 sm:grid-cols-2 lg:grid-cols-4 2xl:mt-16 2xl:pt-10">
      <Info label="Location" value={profile.location} />
      <Info label="Email" value={profile.email} href={profile.social.email} />
      <Info label="Phone" value={profile.phone} href={`tel:${profile.whatsapp}`} />
      <Info label="Status" value={profile.freelanceStatus} />
    </div>
  </SectionWrapper>
);

const Info = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div className="border-l-2 border-primary pl-4">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-silver">{label}</p>
    {href ? <a href={href} className="mt-2 block break-words font-semibold text-primary transition hover:opacity-65">{value}</a> : <p className="mt-2 font-semibold text-primary">{value}</p>}
  </div>
);

export default About;

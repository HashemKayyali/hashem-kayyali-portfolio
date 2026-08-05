import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { profile } from '../data/profile';

const Contact: React.FC = () => (
  <SectionWrapper id="contact" title="Let's Work Together" subtitle="I am interested in software engineering, R&D product engineering, mobile, full-stack, and IoT opportunities." variant="white">
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-10 2xl:gap-16">
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative isolate overflow-hidden rounded-3xl bg-[#300510] p-6 text-white shadow-soft sm:p-8 2xl:p-10">
        <BurgundyWarpBackground index={11} className="-z-10" overlayOpacity={0.2} />
        <h3 className="font-heading text-2xl font-extrabold sm:text-3xl">Have a role or product challenge in mind?</h3>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">Reach me directly by email or WhatsApp. I am based in Amman, Jordan and open to discussing software, product, and connected-system opportunities.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={profile.social.email} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-primary transition hover:-translate-y-0.5"><Mail size={18} /> Email Me</a>
          <a href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 font-bold text-white transition hover:bg-white hover:text-primary"><MessageCircle size={18} /> WhatsApp</a>
        </div>
      </motion.div>

      <div className="space-y-4">
        <ContactRow icon={<Mail size={20} />} label="Email" value={profile.email} href={profile.social.email} />
        <ContactRow icon={<Phone size={20} />} label="Phone" value={profile.phone} href={`tel:${profile.whatsapp}`} />
        <ContactRow icon={<MapPin size={20} />} label="Location" value={profile.location} />
        <ContactRow icon={<Linkedin size={20} />} label="LinkedIn" value="hashem-kayyali" href={profile.social.linkedin} />
        <ContactRow icon={<Instagram size={20} />} label="Instagram" value="@hashemkayyali" href={profile.social.instagram} />
      </div>
    </div>
  </SectionWrapper>
);

const ContactRow = ({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) => {
  const inner = (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/12 bg-mist p-4 transition hover:border-primary/35 hover:bg-white hover:shadow-soft 2xl:gap-4 2xl:p-5">
      <span className="rounded-xl bg-primary p-3 text-white">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-silver">{label}</p>
        <p className="mt-1 break-words font-semibold text-primary">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{inner}</a> : inner;
};

export default Contact;

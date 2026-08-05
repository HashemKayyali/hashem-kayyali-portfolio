import React from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  Download,
  FileText,
  GraduationCap,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { experience, profile, projects } from '../data/profile';

const focusAreas = [
  'Product ownership',
  'Responsive UI engineering',
  'API & database integration',
  'Real-time connected systems',
  'Embedded hardware integration',
  'Testing & troubleshooting',
];

const entryVariants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1] as const,
      when: 'beforeChildren' as const,
      staggerChildren: 0.08,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42 } },
};

const Resume: React.FC = () => (
  <SectionWrapper
    id="resume"
    title="Resume"
    subtitle="Recruiter-focused experience, engineering strengths, and a downloadable ATS-friendly resume."
    variant="mist"
  >
    <div className="mb-8 rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-soft sm:p-8 2xl:p-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-silver">Professional profile</p>
          <h3 className="mt-3 max-w-3xl font-heading text-2xl font-extrabold leading-tight text-primary sm:text-3xl">
            Product-minded software engineer and R&D product engineer.
          </h3>
          <p className="mt-4 max-w-4xl leading-7 text-primary/70">
            {profile.professionalSummary} I take products from requirements and interface design through implementation, hardware integration, testing, and deployment preparation.
          </p>
        </div>
        <div className="grid min-w-[210px] grid-cols-2 gap-3 lg:grid-cols-1">
          <div className="relative isolate overflow-hidden rounded-2xl bg-[#300510] px-5 py-4 text-white">
            <BurgundyWarpBackground index={9} className="-z-10" overlayOpacity={0.18} />
            <p className="text-2xl font-extrabold">{projects.length}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/65">Selected products</p>
          </div>
          <div className="rounded-2xl border border-primary/15 px-5 py-4 text-primary">
            <p className="text-2xl font-extrabold">5</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary/55">Engineering domains</p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_330px] 2xl:gap-12 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
            <BriefcaseBusiness size={21} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-silver">Experience</p>
            <h3 className="font-heading text-2xl font-extrabold text-primary">Professional journey</h3>
          </div>
        </div>

        <div className="experience-timeline">
          <motion.div
            className="experience-timeline__line"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          />

          {experience.map((item) => (
            <motion.article
              key={`${item.title}-${item.period}`}
              variants={entryVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.28, margin: '0px 0px -70px 0px' }}
              className="experience-entry"
            >
              <motion.div variants={childVariants} className="experience-entry__media">
                <img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" />
              </motion.div>

              <div className="experience-entry__body">
                <motion.div variants={childVariants} className="experience-entry__heading">
                  <h4>{item.title}</h4>
                  <span className="experience-entry__period">{item.period}</span>
                </motion.div>

                <motion.p variants={childVariants} className="experience-entry__location">
                  <MapPin size={15} /> {item.location}
                </motion.p>

                {item.roles && item.roles.length > 0 && (
                  <motion.div variants={childVariants} className="experience-progression" aria-label={`${item.title} role progression`}>
                    {item.roles.map((role, roleIndex) => (
                      <motion.div
                        key={`${role.title}-${role.period}`}
                        variants={childVariants}
                        className="experience-progression__role"
                      >
                        <span className="experience-progression__index">{String(roleIndex + 1).padStart(2, '0')}</span>
                        <div>
                          <p>{role.title}</p>
                          <span>{role.period}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <motion.ul variants={childVariants} className="experience-entry__details">
                  {item.details.map((detail) => (
                    <li key={detail}>
                      <span aria-hidden="true" />
                      {detail}
                    </li>
                  ))}
                </motion.ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#300510] p-6 text-white shadow-soft 2xl:p-8">
          <BurgundyWarpBackground index={10} className="-z-10" overlayOpacity={0.18} />
          <FileText size={30} />
          <h3 className="mt-5 font-heading text-2xl font-extrabold">Download resume</h3>
          <p className="mt-4 leading-7 text-white/72">
            A one-page, ATS-friendly resume built for software engineering, R&D, full-stack, mobile, and IoT applications.
          </p>
          <div className="mt-7 grid gap-3">
            <a
              href="/resume/hashem-kayyali-resume.pdf"
              download
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-primary transition hover:-translate-y-0.5"
            >
              <Download size={18} /> Download PDF
            </a>
            <a
              href="/resume/hashem-kayyali-resume.docx"
              download
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/35 px-5 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              <Download size={18} /> Download Word
            </a>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-white/55">
            <ShieldCheck size={15} /> Clean layout, selectable text, and no unsupported claims.
          </p>
        </div>

        <div className="rounded-3xl border border-primary/12 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-primary" size={25} />
            <h3 className="font-heading text-lg font-extrabold text-primary">Education</h3>
          </div>
          <p className="mt-4 font-bold text-primary">Software Engineering</p>
          <p className="mt-1 text-sm leading-6 text-primary/60">Bachelor-level studies currently in progress.</p>
        </div>

        <div className="rounded-3xl border border-primary/12 bg-white p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-silver">Core strengths</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <span key={area} className="rounded-full bg-mist px-3 py-2 text-xs font-bold text-primary">
                {area}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  </SectionWrapper>
);

export default Resume;

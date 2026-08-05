import React, { Suspense, lazy, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../components/SectionWrapper';
import FeatureShaderCard from '../components/ui/feature-shader-cards';
import { projects } from '../data/profile';
import { Project } from '../types';

const ProjectModal = lazy(() => import('../components/ProjectModal'));

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const filters = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category)))],
    [],
  );
  const visibleProjects = useMemo(
    () => (filter === 'All' ? projects : projects.filter((project) => project.category === filter)),
    [filter],
  );

  return (
    <>
      <SectionWrapper
        id="portfolio"
        title="Selected Projects"
        subtitle="Digital platforms, business systems, automation tools, computer vision, and R&D / IoT products designed and developed end to end."
        variant="white"
      >
        <div className="mb-8 flex flex-wrap gap-2 2xl:mb-10" aria-label="Project filters">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === item
                  ? 'bg-primary text-white shadow-soft'
                  : 'border border-primary/15 bg-white text-primary hover:border-primary hover:bg-mist'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <motion.div layout className="grid items-stretch gap-5 md:grid-cols-2 2xl:grid-cols-3 2xl:gap-6">
          {visibleProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 3) * 0.06 }}
              className="h-full"
            >
              <FeatureShaderCard
                index={index}
                title={project.title}
                category={project.category}
                description={project.description}
                status={project.status}
                image={project.image}
                tech={project.tech}
                liveUrl={project.liveUrl}
                onClick={() => setSelectedProject(project)}
              />
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>
      {selectedProject && (
        <Suspense fallback={null}>
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        </Suspense>
      )}
    </>
  );
};

export default Portfolio;

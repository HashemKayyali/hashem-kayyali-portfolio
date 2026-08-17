import React, { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SectionWrapper from '../components/SectionWrapper';
import FeatureShaderCard from '../components/ui/feature-shader-cards';
import { scrollToTarget } from '../components/smoothScroll';
import { filterOrder, projectAssets, type ProjectView } from '../data/projectAssets';
import type { FilterKey } from '../content/types';
import { useI18n } from '../i18n/useI18n';

const ProjectModal = lazy(() => import('../components/ProjectModal'));

/* Depth of the receding card. Scale and dim carry most of it; the lift is what
   turns "shrinking" into "moving away" — a receding object drifts toward the
   vanishing point, so the card rises slightly as it shrinks. */
const MIN_SCALE = 0.86;
const MAX_DIM = 0.78;
const MAX_LIFT = -22;

/**
 * Geometry of the sticky stack, measured on layout changes only.
 * Cards are uniform, so card i pins at `stackTop + i * step - top`.
 */
interface StackMetrics {
  stackTop: number;
  step: number;
  cardHeight: number;
  top: number;
}

interface StackItemProps {
  project: ProjectView;
  index: number;
  total: number;
  metrics: StackMetrics | null;
  onOpen: () => void;
}

const StackItem: React.FC<StackItemProps> = ({ project, index, total, metrics, onOpen }) => {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const hasNext = index < total - 1;
  const recedes = hasNext && Boolean(metrics) && !reduceMotion;

  // The next card covers this one over exactly one card height of scrolling,
  // ending the moment it reaches its own pinned position.
  const end = metrics ? metrics.stackTop + (index + 1) * metrics.step - metrics.top : 1;
  const start = metrics ? end - metrics.cardHeight : 0;

  const scale = useTransform(scrollY, [start, end], recedes ? [1, MIN_SCALE] : [1, 1], {
    clamp: true,
  });
  const dim = useTransform(scrollY, [start, end], recedes ? [0, MAX_DIM] : [0, 0], {
    clamp: true,
  });
  const lift = useTransform(scrollY, [start, end], recedes ? [0, MAX_LIFT] : [0, 0], {
    clamp: true,
  });

  return (
    <div className="project-stack__item" style={{ zIndex: index + 1 }}>
      {/* No entrance animation: card visibility must never depend on JS running. */}
      <motion.div className="project-stack__inner" style={{ scale, y: lift }}>
        <FeatureShaderCard
          index={index}
          total={total}
          project={project}
          dimOpacity={dim}
          onClick={onOpen}
        />
      </motion.div>
    </div>
  );
};

const Portfolio: React.FC = () => {
  const { t } = useI18n();
  // Keyed, never labelled: a localized category string would stop matching the
  // moment the language changes.
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<StackMetrics | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // Asset record joined to the active language's copy.
  const allProjects = useMemo<ProjectView[]>(
    () => projectAssets.map((asset) => ({ ...asset, copy: t.projects[asset.id] })),
    [t],
  );

  const visibleProjects = useMemo(
    () =>
      filter === 'all'
        ? allProjects
        : allProjects.filter((project) => project.categoryKey === filter),
    [allProjects, filter],
  );

  const selectedProject = useMemo(
    () => allProjects.find((project) => project.id === selectedId) ?? null,
    [allProjects, selectedId],
  );

  // A shorter filtered list can leave the viewport past the section, taking the
  // controls off screen right after the user clicked one. Pull back to the top
  // of the stack so the filters stay where the user just used them.
  const isInitialRender = useRef(true);
  useLayoutEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const stack = stackRef.current;
    if (!stack) return;
    const rect = stack.getBoundingClientRect();
    if (rect.top >= 0) return;
    const item = stack.querySelector<HTMLElement>('.project-stack__item');
    const offset = item ? parseFloat(getComputedStyle(item).top) || 0 : 0;
    // Instant: a smooth jump across the whole stack would be disorienting.
    // Routed through Lenis so it cannot be dragged back by an in-flight
    // interpolation aimed at the position this is correcting.
    scrollToTarget(rect.top + window.scrollY - offset, { immediate: true });
  }, [filter]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const measure = () => {
      const items = stack.querySelectorAll<HTMLElement>('.project-stack__item');
      if (items.length < 2) {
        setMetrics(null);
        return;
      }
      const first = items[0];
      const styles = getComputedStyle(first);
      const cardHeight = first.getBoundingClientRect().height;
      const gap = parseFloat(styles.marginBottom) || 0;
      const top = parseFloat(styles.top) || 0;
      // The stack container is static, so its page offset stays correct even
      // while its children are pinned.
      const stackTop = stack.getBoundingClientRect().top + window.scrollY;
      setMetrics({ stackTop, step: cardHeight + gap, cardHeight, top });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(stack);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [visibleProjects]);

  return (
    <>
      <SectionWrapper
        id="portfolio"
        title={t.projectsSection.title}
        subtitle={t.projectsSection.subtitle}
        variant="burgundy"
        stickyControls={
          <div className="portfolio-filters" aria-label={t.projectModal.labels.projectFilters}>
            {filterOrder.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`portfolio-filter${
                  filter === key ? ' portfolio-filter--active' : ''
                }`}
              >
                {t.projectsSection.filters[key]}
              </button>
            ))}
          </div>
        }
      >
        <div className="project-stack" ref={stackRef}>
          {visibleProjects.map((project, index) => (
            <StackItem
              key={project.id}
              project={project}
              index={index}
              total={visibleProjects.length}
              metrics={metrics}
              onOpen={() => setSelectedId(project.id)}
            />
          ))}
        </div>
      </SectionWrapper>
      {selectedProject && (
        <Suspense fallback={null}>
          <ProjectModal project={selectedProject} onClose={() => setSelectedId(null)} />
        </Suspense>
      )}
    </>
  );
};

export default Portfolio;

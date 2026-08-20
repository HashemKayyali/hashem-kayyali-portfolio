import React, { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SectionWrapper from '../components/SectionWrapper';
import FeatureShaderCard from '../components/ui/feature-shader-cards';
import { scrollToTarget } from '../components/smoothScroll';
import { useReveal } from '../components/useReveal';
import { filterOrder, projectAssets, type ProjectView } from '../data/projectAssets';
import type { FilterKey } from '../content/types';
import { useI18n } from '../i18n/useI18n';

const ProjectModal = lazy(() => import('../components/ProjectModal'));

/* Depth of the card at either end of its travel. Scale and dim carry most of
   it; the lift is what turns "shrinking" into "moving away" — a receding
   object drifts toward the vanishing point, so the card rises slightly as it
   shrinks.

   One constant for both ends on purpose: a card arrives from the same distance
   it later departs to, so the stack reads as one axis of depth rather than two
   unrelated effects. */
const MIN_SCALE = 0.86;
const MAX_DIM = 0.78;
const MAX_LIFT = -22;
/* A card arriving is not fully in the room yet: it starts part-translucent so
   the field shows through it, and solidifies as it reaches its own position.
   Departure is dimmed by an overlay instead (`MAX_DIM`) — a receding card must
   stay opaque, or the card behind it would read through the one on top. */
const MIN_OPACITY = 0.55;

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
  // Publishes `data-revealed` for the card's content beats. Deliberately NOT
  // paired with `data-reveal`: the card itself is never given a hidden start
  // state, so its visibility still never depends on a frame having run. Only
  // the lines written on it play in, and only where motion is welcome.
  const revealRef = useReveal<HTMLDivElement>();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const hasNext = index < total - 1;
  const recedes = hasNext && Boolean(metrics) && !reduceMotion;

  // The next card covers this one over exactly one card height of scrolling,
  // ending the moment it reaches its own pinned position.
  const end = metrics ? metrics.stackTop + (index + 1) * metrics.step - metrics.top : 1;
  const start = metrics ? end - metrics.cardHeight : 0;

  // Where this card comes to rest, and the card height of scrolling before it
  // during which it grows into that position — the mirror of the recession,
  // measured in the same unit so arriving and departing move at one pace.
  const pinned = metrics ? metrics.stackTop + index * metrics.step - metrics.top : 0;
  const rises = Boolean(metrics) && !reduceMotion;

  // Four stops, one track: grow to full size on the way up, hold while this is
  // the card being read, recede once the next one starts covering it.
  // `start >= pinned` always — they differ by exactly the stack gap — so the
  // stops stay in order and the hold between them is real.
  const restScale = recedes ? MIN_SCALE : 1;
  const scaleStops = rises && metrics ? [pinned - metrics.cardHeight, pinned, start, end] : [start, end];
  const scaleValues = rises && metrics ? [MIN_SCALE, 1, 1, restScale] : [1, restScale];

  const scale = useTransform(scrollY, scaleStops, scaleValues, { clamp: true });

  // Rides the same rise as the scale. Safe to animate per frame: the transform
  // above has already promoted this element to its own compositing layer, so
  // opacity is a blend on a finished layer rather than a fresh rasterisation.
  const opacity = useTransform(
    scrollY,
    rises && metrics ? [pinned - metrics.cardHeight, pinned] : [0, 1],
    rises && metrics ? [MIN_OPACITY, 1] : [1, 1],
    { clamp: true },
  );
  const dim = useTransform(scrollY, [start, end], recedes ? [0, MAX_DIM] : [0, 0], {
    clamp: true,
  });
  const lift = useTransform(scrollY, [start, end], recedes ? [0, MAX_LIFT] : [0, 0], {
    clamp: true,
  });

  return (
    <div className="project-stack__item" ref={revealRef} style={{ zIndex: index + 1 }}>
      {/* Scale only, never opacity or display: if this never runs the card is
          still fully there, just not moving. The measurement effect has not
          run on the first render either, so the prerendered HTML ships every
          card at full size rather than baking the shrunken start state in. */}
      <motion.div className="project-stack__inner" style={{ scale, y: lift, opacity }}>
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

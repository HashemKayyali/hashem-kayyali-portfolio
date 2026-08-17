import React from 'react';
import { Bot, Code2, Cpu, Lightbulb } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { useReveal } from '../components/useReveal';
import { CAPABILITY_RAMPS } from '../data/profile';
import { useI18n } from '../i18n/useI18n';

/**
 * The four capabilities are not a menu of unrelated services — they are the
 * order a product is actually delivered in. Naming that order is what lets the
 * section explain its own structure: the rail threading the cards is the
 * delivery path, and each node is a stage on it.
 */
const icons = [Lightbulb, Code2, Cpu, Bot];

const Services: React.FC = () => {
  const { t } = useI18n();
  const revealRef = useReveal<HTMLDivElement>();

  const stages = [t.capabilities.flow.define, t.capabilities.flow.build, t.capabilities.flow.connect, t.capabilities.flow.operate];

  return (
    <SectionWrapper
      id="services"
      title={t.capabilities.title}
      subtitle={t.capabilities.subtitle}
      variant="burgundy"
      stickyHeader
    >
      <div className="capabilities" ref={revealRef}>
        {/* The legend states the structure in words; the rail below states it in
            geometry. Between them the section needs no further explanation. */}
        <p className="capabilities__legend m-detail" data-reveal>
          {stages.map((stage) => (
            <span key={stage}>{stage}</span>
          ))}
          <em>{t.capabilities.flow.caption}</em>
        </p>

        <ol className="capability-flow">
          {t.capabilities.items.map((item, index) => {
            const Icon = icons[index] ?? Code2;

            return (
              <li
                key={item.number}
                className="capability m-primary"
                data-reveal
                style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
              >
                <BurgundyWarpBackground
                  index={30 + index}
                  className="capability__warp"
                  overlayOpacity={0.6}
                  speedMultiplier={0.8}
                  ramp={CAPABILITY_RAMPS[index]}
                />

                {/* Ink capsule, threaded onto the rail that runs along the card's
                    top edge — the stage marker, not decoration. */}
                <span className="capability__node" aria-hidden="true">
                  <Icon size={19} />
                </span>

                <p className="capability__stage">
                  <span className="capability__num">{item.number}</span>
                  {stages[index]}
                </p>

                <h3 className="capability__title">{item.title}</h3>
                <p className="capability__text">{item.description}</p>

                <span className="capability__mark" aria-hidden="true">{item.number}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </SectionWrapper>
  );
};

export default Services;

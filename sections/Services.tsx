import React from 'react';
import { Bot, Code2, Cpu, Lightbulb } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { useReveal } from '../components/useReveal';
import { services } from '../data/profile';

/**
 * The four capabilities are not a menu of unrelated services — they are the
 * order a product is actually delivered in. Naming that order is what lets the
 * section explain its own structure: the rail threading the cards is the
 * delivery path, and each node is a stage on it.
 *
 * Stage verbs are editorial framing of the existing copy. No capability, claim
 * or technology is added here; `services` remains the single source of truth.
 */
const stages = ['Scope', 'Build', 'Connect', 'Operate'];
const icons = [Lightbulb, Code2, Cpu, Bot];

const Services: React.FC = () => {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <SectionWrapper
      id="services"
      title="What I Build"
      subtitle="Capabilities shaped around complete product delivery, not a single framework or platform."
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
          <em>four stages of one delivery path</em>
        </p>

        <ol className="capability-flow">
          {services.map((service, index) => {
            const Icon = icons[index] ?? Code2;
            const number = String(index + 1).padStart(2, '0');

            return (
              <li
                key={service.title}
                className="capability m-primary"
                data-reveal
                style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}
              >
                {/* Ink capsule, threaded onto the rail that runs along the card's
                    top edge — the stage marker, not decoration. */}
                <span className="capability__node" aria-hidden="true">
                  <Icon size={19} />
                </span>

                <p className="capability__stage">
                  <span className="capability__num">{number}</span>
                  {stages[index] ?? 'Deliver'}
                </p>

                <h3 className="capability__title">{service.title}</h3>
                <p className="capability__text">{service.description}</p>

                <span className="capability__mark" aria-hidden="true">{number}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </SectionWrapper>
  );
};

export default Services;

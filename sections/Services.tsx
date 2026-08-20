import React from 'react';
import { Bot, Code2, Cpu, Lightbulb } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import BurgundyWarpBackground from '../components/ui/burgundy-warp-background';
import { useReveal } from '../components/useReveal';
import { CAPABILITY_RAMPS } from '../data/profile';
import { useI18n } from '../i18n/useI18n';

/**
 * The four capabilities are not a menu of unrelated services — they are the
 * order a product is actually delivered in, so the section is built as a
 * descent through four stages rather than a row of interchangeable tiles.
 *
 * Reading down beats reading across for this content: the eye already takes a
 * stacked list as a sequence, which is what the old horizontal rail and its
 * threaded nodes were spending fifty lines of nth-child overhang to imply. The
 * index numeral carries the order instead, at a size that can be read as
 * structure from across the page, and each stage gets the full column width —
 * so its palette is a field to look at rather than a sliver behind two lines
 * of copy.
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
        <p className="capabilities__legend m-detail m-beats m-beats--inline m-beats--tight" data-reveal>
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
                className="capability m-primary m-beats"
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

                {/* The index and the stage it names, as one mark. It replaces
                    both the old numeral in the label and the outlined ghost
                    numeral behind the copy — which was the same number said a
                    third time, and at card width it sat underneath the
                    description rather than beside it. */}
                <p className="capability__index">
                  <span className="capability__num">{item.number}</span>
                  <span className="capability__stage">{stages[index]}</span>
                </p>

                <div className="capability__body m-beats">
                  <h3 className="capability__title">{item.title}</h3>
                  <p className="capability__text">{item.description}</p>
                </div>

                <span className="capability__node" aria-hidden="true">
                  <Icon size={20} />
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </SectionWrapper>
  );
};

export default Services;

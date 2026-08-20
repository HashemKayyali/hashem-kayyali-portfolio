import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LOCALE_META, LOCALES } from '../i18n/config';
import { useI18n } from '../i18n/useI18n';

/**
 * Language selector for the existing navigation.
 *
 * The menu expands in flow rather than floating: the sidebar is an
 * `overflow-hidden` glass panel wrapping an `overflow-y-auto` nav, and an
 * absolutely positioned popup inside that pair clips against one or the other
 * at some viewport height. Expanding in place scrolls with its container
 * instead, which also keeps the same markup working in the mobile drawer.
 *
 * The trigger shows the locale code; options name each language in itself. No
 * flags — the choice is a language, not a country.
 *
 * `variant="bar"` is the mobile navbar copy: the same markup, but the panel
 * drops out of flow as a menu under the bar, because a bar of fixed height
 * cannot grow a list inside itself the way the drawer can.
 */
const LanguageSelector: React.FC<{ variant?: 'bar' }> = ({ variant }) => {
  const { locale, t, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  // Escape closes from anywhere inside, and focus returns to the trigger so the
  // keyboard user is not dropped back at the top of the document.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>('.lang-select__trigger')?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div className={`lang-select${variant === 'bar' ? ' lang-select--bar' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="lang-select__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t.navigation.selectLanguage}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe size={16} aria-hidden="true" />
        <span className="lang-select__current">{locale.toUpperCase()}</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`lang-select__chevron${open ? ' lang-select__chevron--open' : ''}`}
        />
      </button>

      {open && (
        <ul className="lang-select__panel" id={panelId} aria-label={t.navigation.language}>
          {LOCALES.map((option) => {
            const active = option === locale;
            return (
              <li key={option}>
                <button
                  type="button"
                  className={`lang-select__option${active ? ' lang-select__option--active' : ''}`}
                  // `lang` on the option so a screen reader pronounces each
                  // endonym in its own language rather than the page's.
                  lang={LOCALE_META[option].htmlLang}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => {
                    setLocale(option);
                    setOpen(false);
                  }}
                >
                  <span>{LOCALE_META[option].nativeName}</span>
                  {active && <Check size={15} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;

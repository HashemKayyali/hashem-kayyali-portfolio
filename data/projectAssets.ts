import type { CategoryKey, LocalizedProject, ProjectId } from '../content/types';
import type { WarpRamp } from '../types';

/**
 * Everything about a project that does not change with language: identity,
 * imagery, palette, links, and visibility. Localized copy lives in
 * `content/locales/*` and is joined to this by `id` at render time, so the five
 * language dictionaries never duplicate an asset path or a colour ramp.
 */
export interface ProjectAsset {
  id: ProjectId;
  /** Drives filtering. The rendered chip label is localized separately. */
  categoryKey: CategoryKey;
  /** Asset folder under /public/projects. Predates the content ids in four cases. */
  dir: string;
  image: string;
  gallery: string[];
  warpRamp: WarpRamp;
  liveUrl?: string;
  privateSource?: boolean;
}

/** An asset record joined to the active language's copy, ready to render. */
export interface ProjectView extends ProjectAsset {
  copy: LocalizedProject;
}

const gallery = (dir: string, count: number): string[] =>
  Array.from(
    { length: count },
    (_, index) => `/projects/${dir}/screenshot-${String(index + 1).padStart(2, '0')}.webp`,
  );

const asset = (
  id: ProjectId,
  categoryKey: CategoryKey,
  dir: string,
  shots: number,
  warpRamp: WarpRamp,
  extra: Pick<ProjectAsset, 'liveUrl' | 'privateSource'> = {},
): ProjectAsset => ({
  id,
  categoryKey,
  dir,
  image: `/projects/${dir}/cover.webp`,
  gallery: gallery(dir, shots),
  warpRamp,
  ...extra,
});

/**
 * Display order of the sticky stack. Ramps were tuned per card against the
 * cover art and are carried over unchanged.
 */
export const projectAssets: ProjectAsset[] = [
  asset('eventies', 'webPlatform', 'eventies', 4,
    ['#000000', '#471199', '#000000', '#81239f', '#d6d6d6'],
    { liveUrl: 'https://www.eventiesjo.com/' }),

  asset('glitzz-lab', 'webPlatform', 'glitzz-lab', 7,
    ['#000000', '#79454b', '#000000', '#987d7a', '#bfbfbf'],
    { liveUrl: 'https://www.glitzzlab.com/' }),

  asset('umniah-youthconnect', 'businessSystem', 'umniah-youthconnect', 11,
    ['#f2f2f2', '#e3e3e3', '#000000', '#fbff00', '#030521'],
    { privateSource: true }),

  asset('terminal-nfc', 'businessSystem', 'the-terminal-nfc', 1,
    ['#fffafa', '#03788e', '#1e1515', '#274653', '#ffffff'],
    { privateSource: true }),

  asset('bike-tower', 'rdIot', 'bike-tower', 4,
    ['#0f0a01', '#ffffff', '#000000', '#f408aa', '#e3e3e3'],
    { privateSource: true }),

  asset('basket-beats', 'rdIot', 'basket-beats', 0,
    ['#fefbfb', '#7743bf', '#000000', '#c5bbc9', '#d6d6d6'],
    { privateSource: true }),

  asset('vr-cycling', 'rdIot', 'vr-cycling', 0,
    ['#0f0a01', '#c75b19', '#000000', '#ffffff', '#c75b19'],
    { privateSource: true }),

  asset('bike-land-trainer', 'rdIot', 'bike-land-smart-cycling-trainer', 1,
    ['#345ea2', '#345ea2', '#0b0f10', '#ffffff', '#d8d8d8'],
    { privateSource: true }),

  asset('outreach-automation', 'automationSystem', 'outreach-automation-platform', 4,
    ['#fefbfb', '#117771', '#ffffff', '#ffffff', '#d6d6d6'],
    { privateSource: true }),

  asset('traffic-flow-analytics', 'computerVision', 'traffic-flow-analytics-studio', 0,
    ['#01100a', '#04231a', '#000000', '#148f68', '#2b9370'],
    { privateSource: true }),
];

/** Filter chips, in the order the section renders them. */
export const filterOrder = [
  'all',
  ...Array.from(new Set(projectAssets.map((project) => project.categoryKey))),
] as const;

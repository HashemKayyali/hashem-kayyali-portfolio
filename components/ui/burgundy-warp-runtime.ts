import type { WarpRamp } from '../../types';

type WarpFrameSubscriber = (source: HTMLCanvasElement, animationTime: number) => void;

/** Renders one frame in an arbitrary ramp and returns the surface holding it. */
type RampRenderer = (
  ramp: WarpRamp,
  animationTime: number,
  density: number,
) => HTMLCanvasElement | null;

let sharedSource: HTMLCanvasElement | null = null;
let rampRenderer: RampRenderer | null = null;
let lastAnimationTime = 0;

/**
 * Surfaces redraw at 24fps while the shared field is published at 30. That gap
 * used to be spent and then thrown away: `deliver` rendered a scratch frame for
 * every custom-ramp surface on every published frame, and the surface's own
 * callback dropped one in five of them on arrival. The rate lives here now, so
 * a frame that will not be drawn is never rendered in the first place.
 *
 * The rate itself is a quality dial: redrawing these surfaces is the single
 * largest measured contributor to dropped frames while scrolling, and it scales
 * directly with this number. Lowering it makes the background's own drift less
 * fluid; it changes nothing about layout, type, or any other animation.
 */
const FRAME_INTERVAL = 1000 / 15;

/** Subscriber -> the ramp it wants, or null for the shared burgundy surface. */
type Request = { ramp: WarpRamp; density: number };
type Entry = { request: Request | null; lastDelivered: number };
const subscribers = new Map<WarpFrameSubscriber, Entry>();

export const setSharedWarpSource = (source: HTMLCanvasElement | null) => {
  sharedSource = source;

  if (!source) {
    lastAnimationTime = 0;
    return;
  }

  if (lastAnimationTime <= 0) return;
  deliver(lastAnimationTime);
};

/** Registered by the global background, which owns the GL context. */
export const setRampRenderer = (renderer: RampRenderer | null) => {
  rampRenderer = renderer;
};

const sourceFor = (request: Request | null, animationTime: number) => {
  if (!request) return sharedSource;
  if (!rampRenderer) return sharedSource;
  return rampRenderer(request.ramp, animationTime, request.density) ?? sharedSource;
};

const keyFor = (request: Request | null) =>
  request ? `${request.density}|${request.ramp.join(',')}` : '';

/**
 * Ramps repeat across the page — several project cards share a palette — and
 * two surfaces asking for the same one at the same instant want the same image.
 *
 * They cannot simply be handed a cached canvas: the scratch buffer is a single
 * surface that the next render overwrites, which is exactly why each subscriber
 * copies out of it immediately. So the saving comes from ordering instead —
 * subscribers are grouped by the source they need, and every surface sharing a
 * palette is served from one render before the buffer moves on. Delivery order
 * within a frame changes; the image each surface receives does not.
 */
const deliver = (animationTime: number) => {
  let due: Map<string, { request: Request | null; waiting: [WarpFrameSubscriber, Entry][] }> | null =
    null;

  subscribers.forEach((entry, subscriber) => {
    if (animationTime - entry.lastDelivered < FRAME_INTERVAL) return;
    if (!due) due = new Map();
    const key = keyFor(entry.request);
    const group = due.get(key);
    if (group) group.waiting.push([subscriber, entry]);
    else due.set(key, { request: entry.request, waiting: [[subscriber, entry]] });
  });

  if (!due) return;

  due.forEach(({ request, waiting }) => {
    const source = sourceFor(request, animationTime);
    if (!source) return;
    waiting.forEach(([subscriber, entry]) => {
      entry.lastDelivered = animationTime;
      subscriber(source, animationTime);
    });
  });
};

export const publishSharedWarpFrame = (animationTime: number) => {
  if (!sharedSource) return;

  lastAnimationTime = animationTime;
  deliver(animationTime);
};

export const subscribeToSharedWarp = (
  subscriber: WarpFrameSubscriber,
  ramp: WarpRamp | null = null,
  density = 1,
) => {
  const request = ramp ? { ramp, density } : null;
  // -Infinity, so a surface that has just mounted paints on the very next
  // published frame rather than waiting out an interval it was never part of.
  const entry: Entry = { request, lastDelivered: -Infinity };
  subscribers.set(subscriber, entry);

  if (sharedSource && lastAnimationTime > 0) {
    const source = sourceFor(request, lastAnimationTime);
    if (source) {
      entry.lastDelivered = lastAnimationTime;
      subscriber(source, lastAnimationTime);
    }
  }

  return () => {
    subscribers.delete(subscriber);
  };
};

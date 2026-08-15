import type { WarpRamp } from '../../types';

type WarpFrameSubscriber = (source: HTMLCanvasElement, animationTime: number) => void;

/** Renders one frame in an arbitrary ramp and returns the surface holding it. */
type RampRenderer = (ramp: WarpRamp, animationTime: number) => HTMLCanvasElement | null;

let sharedSource: HTMLCanvasElement | null = null;
let rampRenderer: RampRenderer | null = null;
let lastAnimationTime = 0;

/** Subscriber -> the ramp it wants, or null for the shared burgundy surface. */
const subscribers = new Map<WarpFrameSubscriber, WarpRamp | null>();

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

/**
 * A surface on a custom ramp is rendered on demand and copied immediately, so
 * one scratch buffer serves every one of them: the copy happens inside the
 * subscriber call, before the next render overwrites it.
 */
const sourceFor = (ramp: WarpRamp | null, animationTime: number) => {
  if (!ramp) return sharedSource;
  if (!rampRenderer) return sharedSource;
  return rampRenderer(ramp, animationTime) ?? sharedSource;
};

const deliver = (animationTime: number) => {
  subscribers.forEach((ramp, subscriber) => {
    const source = sourceFor(ramp, animationTime);
    if (source) subscriber(source, animationTime);
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
) => {
  subscribers.set(subscriber, ramp);

  if (sharedSource && lastAnimationTime > 0) {
    const source = sourceFor(ramp, lastAnimationTime);
    if (source) subscriber(source, lastAnimationTime);
  }

  return () => {
    subscribers.delete(subscriber);
  };
};

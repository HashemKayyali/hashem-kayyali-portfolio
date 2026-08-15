import type { WarpRamp } from '../../types';

type WarpFrameSubscriber = (source: HTMLCanvasElement, animationTime: number) => void;

/**
 * Returns the field for a palette. Rendered on first request and kept, so
 * this is a lookup on every frame after that.
 */
type RampRenderer = (ramp: WarpRamp) => HTMLCanvasElement | null;

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

const sourceFor = (ramp: WarpRamp | null) => {
  if (!ramp) return sharedSource;
  if (!rampRenderer) return sharedSource;
  return rampRenderer(ramp) ?? sharedSource;
};

const deliver = (animationTime: number) => {
  subscribers.forEach((ramp, subscriber) => {
    const source = sourceFor(ramp);
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
    const source = sourceFor(ramp);
    if (source) subscriber(source, lastAnimationTime);
  }

  return () => {
    subscribers.delete(subscriber);
  };
};

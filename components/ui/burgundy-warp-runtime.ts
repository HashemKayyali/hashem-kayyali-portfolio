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

/** Subscriber -> the ramp it wants, or null for the shared burgundy surface. */
type Request = { ramp: WarpRamp; density: number };
const subscribers = new Map<WarpFrameSubscriber, Request | null>();

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
const sourceFor = (request: Request | null, animationTime: number) => {
  if (!request) return sharedSource;
  if (!rampRenderer) return sharedSource;
  return rampRenderer(request.ramp, animationTime, request.density) ?? sharedSource;
};

const deliver = (animationTime: number) => {
  subscribers.forEach((request, subscriber) => {
    const source = sourceFor(request, animationTime);
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
  density = 1,
) => {
  const request = ramp ? { ramp, density } : null;
  subscribers.set(subscriber, request);

  if (sharedSource && lastAnimationTime > 0) {
    const source = sourceFor(request, lastAnimationTime);
    if (source) subscriber(source, lastAnimationTime);
  }

  return () => {
    subscribers.delete(subscriber);
  };
};

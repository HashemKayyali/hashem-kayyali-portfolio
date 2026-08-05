type WarpFrameSubscriber = (source: HTMLCanvasElement, animationTime: number) => void;

let sharedSource: HTMLCanvasElement | null = null;
let lastAnimationTime = 0;
const subscribers = new Set<WarpFrameSubscriber>();

export const setSharedWarpSource = (source: HTMLCanvasElement | null) => {
  sharedSource = source;

  if (!source) {
    lastAnimationTime = 0;
    return;
  }

  if (lastAnimationTime <= 0) return;
  subscribers.forEach((subscriber) => subscriber(source, lastAnimationTime));
};

export const publishSharedWarpFrame = (animationTime: number) => {
  if (!sharedSource) return;

  lastAnimationTime = animationTime;
  subscribers.forEach((subscriber) => subscriber(sharedSource as HTMLCanvasElement, animationTime));
};

export const subscribeToSharedWarp = (subscriber: WarpFrameSubscriber) => {
  subscribers.add(subscriber);

  if (sharedSource && lastAnimationTime > 0) {
    subscriber(sharedSource, lastAnimationTime);
  }

  return () => subscribers.delete(subscriber);
};

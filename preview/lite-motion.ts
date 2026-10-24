/*
 * Phones and touch tablets. Entrances there are a few opacity/translate tweens created in one call
 * (every extra tween reads layout after the previous one wrote, so a chapter of five chained tweens
 * flushed style five times mid-scroll). Decoration that repaints or runs on every scroll frame
 * (clip-path masks, parallax scrubs, 3D tilt) is skipped. Desktop choreography is unchanged.
 */
export const LITE_QUERY='(hover:none),(max-width:800px)';
export const liteMotion=()=>matchMedia(LITE_QUERY).matches;

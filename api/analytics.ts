import {handle} from '../server/analytics/handler.ts';
/** Vercel Node Web Standard function. POST = collect a page view, GET = aggregated statistics only. */
export default {fetch:handle};

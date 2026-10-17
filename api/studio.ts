import {createStudioHandler} from '../server/studio/handler.ts';
const handler=createStudioHandler();
/** Vercel Node Web Standard function; shared with the Vite development adapter. */
export default {fetch:handler};

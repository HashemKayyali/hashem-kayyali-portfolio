import {StudioError} from './errors.ts';
import type {StudioStatus} from '../../studio/contracts.ts';
export type StudioEnv=Record<string,string|undefined>;
export function studioStatus(env:StudioEnv):StudioStatus {
 const names=['SUPABASE_URL','SUPABASE_SECRET_KEY','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET','ADMIN_SESSION_SECRET'];
 const missing=names.filter(name=>name==='SUPABASE_SECRET_KEY'?!env.SUPABASE_SECRET_KEY&&!env.SUPABASE_SERVICE_ROLE_KEY:!env[name]);
 const admin=Boolean(env.ADMIN_SESSION_SECRET&&env.ADMIN_SESSION_SECRET.length>=32);
 if(env.ADMIN_SESSION_SECRET&&!admin)missing.push('ADMIN_SESSION_SECRET (minimum 32 characters)');
 return {database:!!env.SUPABASE_URL&&!!(env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY),media:!!env.CLOUDINARY_CLOUD_NAME&&!!env.CLOUDINARY_API_KEY&&!!env.CLOUDINARY_API_SECRET,admin,missing};
}
export function requireConfig(env:StudioEnv,kind:'database'|'media'|'admin') {
 if(!studioStatus(env)[kind])throw new StudioError(503,'SETUP_REQUIRED','Studio configuration is incomplete. Complete the server environment settings first.');
}

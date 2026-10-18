import {StudioError} from './errors.ts';
import {parsePasswordHash,strongSecret,totpKey} from './auth.ts';
import type {StudioStatus} from '../../studio/contracts.ts';
export type StudioEnv=Record<string,string|undefined>;

/** Production requires the TOTP second factor; previews and local development may omit it. */
export const isProduction=(env:StudioEnv)=>env.VERCEL_ENV==='production';
export function studioStatus(env:StudioEnv):StudioStatus {
 const missing:string[]=[];
 const database=!!env.SUPABASE_URL&&!!(env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY);
 if(!env.SUPABASE_URL)missing.push('SUPABASE_URL');
 if(!env.SUPABASE_SECRET_KEY&&!env.SUPABASE_SERVICE_ROLE_KEY)missing.push('SUPABASE_SECRET_KEY');
 const media=!!env.CLOUDINARY_CLOUD_NAME&&!!env.CLOUDINARY_API_KEY&&!!env.CLOUDINARY_API_SECRET;
 for(const name of ['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'])if(!env[name])missing.push(name);
 // Admin fails closed: strong session secret + scrypt password hash + database-backed sessions/throttle,
 // plus TOTP in production (or whenever a TOTP secret is configured). A plaintext password is refused.
 const secret=strongSecret(env.ADMIN_SESSION_SECRET);
 if(!env.ADMIN_SESSION_SECRET)missing.push('ADMIN_SESSION_SECRET');else if(!secret)missing.push('ADMIN_SESSION_SECRET (32+ varied characters)');
 const hash=!!parsePasswordHash(env.ADMIN_PASSWORD_HASH);
 if(!env.ADMIN_PASSWORD_HASH)missing.push('ADMIN_PASSWORD_HASH');else if(!hash)missing.push('ADMIN_PASSWORD_HASH (invalid format)');
 const plaintext=env.ADMIN_PASSWORD!==undefined&&env.ADMIN_PASSWORD!=='';
 if(plaintext)missing.push('ADMIN_PASSWORD (remove it; only ADMIN_PASSWORD_HASH is accepted)');
 const totpRequired=isProduction(env)||!!env.ADMIN_TOTP_SECRET,totp=!!totpKey(env.ADMIN_TOTP_SECRET);
 if(totpRequired&&!totp)missing.push(env.ADMIN_TOTP_SECRET?'ADMIN_TOTP_SECRET (base32, 128+ bits)':'ADMIN_TOTP_SECRET');
 const admin=secret&&hash&&!plaintext&&database&&(!totpRequired||totp);
 return {database,media,admin,mfa:admin&&totp,missing};
}
export function requireConfig(env:StudioEnv,kind:'database'|'media'|'admin') {
 if(!studioStatus(env)[kind])throw new StudioError(503,'SETUP_REQUIRED','Studio configuration is incomplete. Complete the server environment settings first.');
}

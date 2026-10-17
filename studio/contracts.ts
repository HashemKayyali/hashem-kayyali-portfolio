/** Public/server DTOs. Credentials never belong in this module. */
export type StudioKind='image'|'video';
export type StudioResource='media'|'posts'|'gallery';
export interface StudioMedia {id:string;public_id:string;kind:StudioKind;url:string;poster_url:string|null;width:number;height:number;bytes:number;format:string;alt:string;created_at:string}
export interface StudioPost {id:string;media_id:string;caption:string;authored_at:string;source_url:string|null;published:boolean;sort_order:number;media?:StudioMedia;created_at:string;updated_at:string}
export interface StudioGalleryEntry {id:string;media_id:string;title:string;caption:string;alt:string;project_id:string|null;authored_at:string;published:boolean;sort_order:number;media?:StudioMedia;created_at:string;updated_at:string}
export interface ProjectMediaItem {media_id:string;caption:string;alt:string;is_cover:boolean;sort_order:number;media?:StudioMedia}
export interface ProjectMediaOverride {project_id:string;enabled:boolean;items:ProjectMediaItem[];updated_at?:string}
export interface PublicStudio {configured:boolean;posts:StudioPost[];gallery:StudioGalleryEntry[];projectMedia:ProjectMediaOverride[]}
export interface StudioStatus {database:boolean;media:boolean;admin:boolean;missing:string[]}
export interface StudioSession {authenticated:boolean;configured:boolean}
export interface StudioUploadIntent {url:string;fields:Record<string,string>;receiptToken:string;kind:StudioKind;maxBytes:number}
export interface StudioUploadReceipt {public_id:string;version:number;signature:string;resource_type:StudioKind}
export interface StudioItems {media:StudioMedia;posts:StudioPost;gallery:StudioGalleryEntry}
export interface StudioErrorPayload {error:{code:string;message:string}}

export interface ContactInput {name:string;email:string;message:string}
export function contactDraft(input:ContactInput,recipient:string):string|null {
 const name=input.name.trim(),email=input.email.trim(),message=input.message.trim();
 if(!name||name.length>80||email.length>254||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||message.length<10||message.length>4000) return null;
 const subject=`Portfolio conversation — ${name.replace(/\s+/g,' ')}`;
 const body=`Name: ${name}\nEmail: ${email}\n\n${message}`.replace(/\r\n|\r|\n/g,'\r\n');
 // RFC 6068: spaces are %20 and mail body line breaks are CRLF.
 return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

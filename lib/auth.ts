import { createHmac, timingSafeEqual } from 'node:crypto';
const VERSION='v1';
export function validPassword(password: string):boolean {
 const configured=process.env.ADMIN_PASSWORD;
 if(!configured || configured.length<12) return false;
 const a=Buffer.from(password),b=Buffer.from(configured);
 return a.length===b.length && timingSafeEqual(a,b);
}
export function makeSession():string {
 const secret=process.env.SESSION_SECRET;
 if(!secret || secret.length<32) throw new Error('SESSION_SECRET não configurado');
 const expires=String(Date.now()+1000*60*60*12);
 const value=`${VERSION}.${expires}`;
 const signature=createHmac('sha256',secret).update(value).digest('hex');
 return `${value}.${signature}`;
}
export function isAdminCookie(cookie?:string):boolean {
 const secret=process.env.SESSION_SECRET;
 if(!cookie || !secret || secret.length<32) return false;
 const parts=cookie.split('.');
 if(parts.length!==3 || parts[0]!==VERSION || !/^\d+$/.test(parts[1]) || Number(parts[1])<=Date.now()) return false;
 const value=`${parts[0]}.${parts[1]}`;
 const expected=createHmac('sha256',secret).update(value).digest('hex');
 const a=Buffer.from(parts[2]),b=Buffer.from(expected);
 return a.length===b.length && timingSafeEqual(a,b);
}

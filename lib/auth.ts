import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
export type Me={id:string;name:string;email:string;role:string};
function key(){const s=process.env.AUTH_SECRET;if(!s || s.length<32)throw new Error('AUTH_SECRET precisa ter 32 ou mais caracteres');return new TextEncoder().encode(s)}
export async function session():Promise<Me|null>{try{const token=(await cookies()).get('isa_session')?.value;if(!token)return null;const {payload}=await jwtVerify(token,key());return {id:String(payload.sub),name:String(payload.name),email:String(payload.email),role:String(payload.role)};}catch{return null}}
export async function setSession(me:Me){const token=await new SignJWT({name:me.name,email:me.email,role:me.role}).setProtectedHeader({alg:'HS256'}).setSubject(me.id).setIssuedAt().setExpirationTime('7d').sign(key());(await cookies()).set('isa_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:604800});}
export async function mustAuth(){const me=await session();if(!me)throw new Error('Não autenticado');return me}

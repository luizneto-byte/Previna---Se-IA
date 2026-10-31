import { NextRequest, NextResponse } from 'next/server';
import { makeSession, validPassword } from '../../../lib/auth';
export async function POST(req:NextRequest){
 const data=await req.json().catch(()=>null);
 if(!data || typeof data.password!=='string' || !validPassword(data.password)) return NextResponse.json({error:'Senha incorreta ou modo administrador não configurado.'},{status:401});
 let session:string;
 try {session=makeSession();} catch {return NextResponse.json({error:'Configure SESSION_SECRET no servidor.'},{status:503});}
 const res=NextResponse.json({ok:true});
 res.cookies.set('isa_admin',session,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*12});
 return res;
}

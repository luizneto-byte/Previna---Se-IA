import {NextResponse} from 'next/server';
import {session} from '@/lib/auth';
import {searchNR} from '@/lib/nr-search';
export const dynamic='force-dynamic';
export async function GET(req:Request){const user=await session();if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});const url=new URL(req.url);const q=(url.searchParams.get('q')||'').trim().slice(0,200);if(q.length<2)return NextResponse.json({results:[]});try{return NextResponse.json({results:await searchNR(q,true)});}catch(e){console.error(e);return NextResponse.json({error:'Erro ao pesquisar normas'},{status:500})}}

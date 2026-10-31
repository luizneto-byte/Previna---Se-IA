import {db} from '@/lib/db';

export type NrResult={code:string;section:string;content:string;sourceUrl:string;version:string;verified:boolean;file?:string};
const portal='https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs';
export const NR_PORTAL=portal;
export async function searchNR(question:string, includePending=false):Promise<NrResult[]> {
  const q=question.trim().slice(0,200);
  if(!q)return [];
  const code=(q.match(/\bNR\s*[-–]?\s*(\d{1,2})\b/i)?.[1]||'');
  const nr=code?'NR-'+code.padStart(2,'0'):'';
  const terms=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z]{4,}/g)?.filter(x=>!['qual','quais','sobre','para','como','uma','esse','essa','pode','norma','regulamentadora','regulamentadoras'].includes(x)).slice(0,8)||[];
  const query=terms.join(' ')||q;
  const results:NrResult[]=[];
  // Fontes que já passaram por revisão técnica.
  try {
    const r=await db().query(`SELECT code,section,content,source_url,version_label FROM public.nr_sources
      WHERE (to_tsvector('portuguese',coalesce(content,'')||' '||coalesce(section,'')||' '||code) @@ plainto_tsquery('portuguese',$1)) OR ($2 <> '' AND regexp_replace(upper(code),'[^A-Z0-9]','','g')=regexp_replace($2,'[^A-Z0-9]','','g'))
      ORDER BY verified_at DESC LIMIT 6`,[query,nr]);
    for(const x of r.rows)results.push({code:x.code,section:x.section,content:x.content.slice(0,3000),sourceUrl:x.source_url,version:x.version_label,verified:true});
  }catch(e){console.error('Busca nr_sources indisponivel:',e);}
  // Documentos importados devem ter aprovação explícita e ficam separados de prévias.
  try {
    const r=await db().query(`SELECT codigo_nr,nome_arquivo,url_fonte,texto_extraido,status FROM public.nr_documentos_pendentes
      WHERE status = ANY($3::text[]) AND
      ((to_tsvector('portuguese',left(texto_extraido,200000)) @@ plainto_tsquery('portuguese',$1)) OR ($2 <> '' AND codigo_nr=$2))
      ORDER BY CASE WHEN codigo_nr=$2 THEN 0 ELSE 1 END, id DESC LIMIT 5`,[query,nr,includePending?['aprovado','pendente_revisao']:['aprovado']]);
    for(const x of r.rows){
      const raw=String(x.texto_extraido);const match=terms.length?terms.map(t=>raw.toLowerCase().indexOf(t)).find(i=>i>=0):-1;
      const offset=Math.max(0,(match??-1)-350);const snippet=raw.slice(offset,offset+2400);
      results.push({code:x.codigo_nr,section:'Documento integral (sem item validado)',content:snippet,sourceUrl:x.url_fonte,version:x.nome_arquivo,verified:x.status==='aprovado',file:x.nome_arquivo});
    }
  }catch(e){console.error('Busca nr_documentos_pendentes indisponivel:',e);}
  return results.slice(0,10);
}

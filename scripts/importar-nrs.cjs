const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Configure DATABASE_URL nos Secrets do GitHub.');
const sql = fs.readFileSync(path.join(__dirname, '..', 'data', '03_importar_candidatos_para_revisao.sql'), 'utf8');
const marker = 'INSERT INTO public.nr_documentos_pendentes ';
const first = sql.indexOf(marker);
if (first < 0) throw new Error('Arquivo SQL sem registros de importacao.');
const setup = sql.slice(0, first).trim();
const inserts = sql.slice(first).split(/\r?\n(?=INSERT INTO public\.nr_documentos_pendentes )/).map(v=>v.trim()).filter(Boolean);
if (inserts.length !== 36) throw new Error(`Esperados 36 registros, encontrados ${inserts.length}. Importacao interrompida.`);

(async () => {
  const db = new Client({ connectionString, ssl: { rejectUnauthorized: true }, connectionTimeoutMillis: 30000 });
  await db.connect();
  try {
    await db.query('BEGIN');
    try { await db.query(setup); await db.query('COMMIT'); }
    catch (e) { await db.query('ROLLBACK'); throw e; }
    console.log(`Importando ${inserts.length} documentos candidatos a revisao...`);
    for (let i = 0; i < inserts.length; i++) {
      await db.query(inserts[i]);
      console.log(`Processado ${i + 1}/${inserts.length}`);
    }
    const result = await db.query("SELECT count(*)::int AS total FROM public.nr_documentos_pendentes WHERE status = 'pendente_revisao'");
    console.log('Documentos pendentes de revisao no Neon:', result.rows[0].total);
    console.log('Importacao finalizada. Nenhuma norma foi marcada como vigente.');
  } finally { await db.end(); }
})().catch(err => { console.error('Importacao falhou:', err.message); process.exitCode = 1; });

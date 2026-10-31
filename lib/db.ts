import { Pool } from 'pg';
const globalPg=globalThis as unknown as { pool?: Pool };
export function db(){ if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL ausente'); if(!globalPg.pool)globalPg.pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:5});return globalPg.pool; }

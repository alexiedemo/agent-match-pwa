const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmd, ...args){
  const url = `${BASE}/${cmd}/${args.map(encodeURIComponent).join('/')}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const j = await r.json();
  if(j.error) throw new Error(j.error);
  return j.result;
}

export async function set(key, val){ return redis('set', key, JSON.stringify(val)); }
export async function get(key){ const r = await redis('get', key); return r ? JSON.parse(r) : null; }
export async function del(key){ return redis('del', key); }
export async function sadd(key, member){ return redis('sadd', key, JSON.stringify(member)); }
export async function smembers(key){ const r = await redis('smembers', key); return (r||[]).map(s=>{ try{return JSON.parse(s);}catch{return s;} }); }
export async function srem(key, member){ return redis('srem', key, JSON.stringify(member)); }

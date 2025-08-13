import { get, set, del } from './_redis.js';

function id(){ return crypto.randomUUID(); }

async function list(){
  const all = (await get('buyers')) || [];
  return all;
}

export default async function handler(req, res){
  if(req.method === 'GET'){
    return res.status(200).json(await list());
  }
  if(req.method === 'POST'){
    const b = req.body || {};
    if(!b.name || !Array.isArray(b.suburbs) || b.suburbs.length===0) return res.status(400).send('Missing name or suburbs');
    const all = (await get('buyers')) || [];
    const newBuyer = { id: id(), createdAt: Date.now(), lastChecked: 0, ...b };
    all.push(newBuyer);
    await set('buyers', all);
    return res.status(200).json(newBuyer);
  }
  if(req.method === 'DELETE'){
    const { id: bid } = req.query;
    if(!bid) return res.status(400).send('Missing id');
    const all = (await get('buyers')) || [];
    const filtered = all.filter(x => x.id !== bid);
    await set('buyers', filtered);
    await del(`seen:${bid}`);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).send('Method Not Allowed');
}

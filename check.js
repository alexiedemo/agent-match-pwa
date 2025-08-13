import webpush from 'web-push';
import { get, set, smembers } from './_redis.js';

webpush.setVapidDetails(`mailto:${process.env.SENDER_EMAIL || 'alerts@example.com'}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

const SERP = process.env.SERPAPI_API_KEY;

function buildQueries(b){
  const parts = [];
  if(b.bedsMin) parts.push(`${b.bedsMin}+ bedroom`);
  if(b.propType && b.propType !== 'any') parts.push(b.propType);
  if(b.priceMin) parts.push(`$${b.priceMin.toLocaleString()}`);
  if(b.priceMax) parts.push(`$${b.priceMax.toLocaleString()}`);
  if(b.keywords?.length) parts.push(...b.keywords);
  const term = parts.join(' ');
  return b.suburbs.map(s => `site:realestate.com.au OR site:domain.com.au ${JSON.stringify(s + ' QLD')} ${term}`);
}

async function searchSerp(query){
  const u = new URL('https://serpapi.com/search.json');
  u.searchParams.set('engine','google');
  u.searchParams.set('num','10');
  u.searchParams.set('q', query);
  u.searchParams.set('api_key', SERP);
  const r = await fetch(u);
  if(!r.ok) throw new Error('SerpAPI failed');
  const j = await r.json();
  return (j.organic_results||[]).map(o => ({ title:o.title, link:o.link, snippet:o.snippet || '' }));
}

function isLikelyListing(link){
  if(!link) return false;
  return /realestate\.com\.au\/.+|domain\.com\.au\/.+/.test(link);
}

async function notifyAll(payload){
  const subs = await smembers('subs');
  const json = JSON.stringify(payload);
  await Promise.allSettled(subs.map(sub => webpush.sendNotification(sub, json)));
}

export default async function handler(req, res){
  if(!SERP) return res.status(500).send('Missing SERPAPI_API_KEY');
  const buyers = (await get('buyers')) || [];
  const now = Date.now();
  let totalAlerts = 0;

  for(const b of buyers){
    const seenKey = `seen:${b.id}`;
    const seen = (await get(seenKey)) || {};
    const queries = buildQueries(b);
    for(const q of queries){
      let results = [];
      try { results = await searchSerp(q); } catch(e){ continue; }
      for(const r of results){
        if(!isLikelyListing(r.link)) continue;
        const key = r.link;
        if(seen[key]) continue; // already alerted
        // heuristics: filter out rentals, sold pages
        if(/\/rent\//i.test(key) || /sold/i.test(key)) continue;
        // mark as seen
        seen[key] = { at: now, buyerId: b.id, q };
        await notifyAll({ title: `Match for ${b.name}`, body: r.title, url: r.link });
        totalAlerts++;
      }
    }
    b.lastChecked = now;
    await set(seenKey, seen);
  }
  await set('buyers', buyers);

  res.status(200).json({ ok: true, buyers: buyers.length, alertsSent: totalAlerts });
}

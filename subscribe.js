import webpush from 'web-push';
import { sadd, smembers } from './_redis.js';

webpush.setVapidDetails(`mailto:${process.env.SENDER_EMAIL || 'alerts@example.com'}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const sub = req.body;
  if(!sub || !sub.endpoint) return res.status(400).send('Bad subscription');
  await sadd('subs', sub);
  // quick test (optional):
  try { await webpush.sendNotification(sub, JSON.stringify({ title: 'Agent Match', body: 'Notifications enabled ✅' })); } catch(e) {}
  res.status(200).json({ ok: true });
}

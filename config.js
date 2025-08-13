export default async function handler(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ publicKey: process.env.VAPID_PUBLIC_KEY }));
}

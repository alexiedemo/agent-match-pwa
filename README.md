# Agent Match (PWA)

A lightweight alerts app for real estate buyer–requirement matching. Built for iPhone (PWA). Uses:
- SerpAPI (Google Search JSON) for compliant web discovery.
- Upstash Redis for serverless storage.
- Vercel Cron for continuous background checks.
- Web Push for iOS PWA notifications.

## Quick Deploy (Vercel)
1) **Create free accounts**: Vercel, Upstash Redis, SerpAPI.
2) **New Vercel project** → Import this repo.
3) **Environment Variables** (Project → Settings):
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - `SERPAPI_API_KEY`
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (generate with `npx web-push generate-vapid-keys`)
   - `SENDER_EMAIL` any value
4) **Cron**: `vercel.json` already schedules `/api/check` every 10 minutes AEST.
5) **Open the site on iPhone Safari** → Share → *Add to Home Screen* → Open the icon → **Enable alerts**.
6) Add buyers; background checks run continuously and push notifications will appear when matches are found.

## Tips
- Use specific keywords (e.g., *pool*, *dual living*, *renovator*) to sharpen matches.
- Add multiple suburbs per buyer.
- If you secure official APIs from major portals, add a new provider in `api/check.js` to query those directly.
- For email or SMS instead of push, integrate providers (Resend, Twilio) inside `notifyAll`.

## Legal/Ethical
This tool avoids direct scraping of portals (which may violate T&Cs) by using a compliant search API. Only follow links the search returns.

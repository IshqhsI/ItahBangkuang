// Membuat sepasang kunci VAPID untuk notifikasi Web Push.
// Jalankan sekali: node scripts/buat-kunci-push.mjs
// Salin hasilnya ke Vercel (Settings → Environment Variables). JANGAN dimasukkan ke git.
import webpush from 'web-push';
import { randomBytes } from 'node:crypto';

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
const rahasiaWebhook = randomBytes(32).toString('base64url');

console.log(`
Salin ke Vercel → Settings → Environment Variables (semua lingkungan: Production, Preview, Development):

  VAPID_PUBLIC_KEY       = ${publicKey}
  VITE_VAPID_PUBLIC_KEY  = ${publicKey}      (kunci publik yang sama, dipakai browser)
  VAPID_PRIVATE_KEY      = ${privateKey}     (RAHASIA)
  VAPID_SUBJECT          = mailto:EMAIL-ANDA@contoh.com
  PUSH_WEBHOOK_SECRET    = ${rahasiaWebhook} (RAHASIA, dipakai juga di header webhook Supabase)

Dan satu lagi, dari Supabase → Project Settings → API:
  SUPABASE_SERVICE_ROLE_KEY = <kunci "service_role", RAHASIA, jangan diawali VITE_>

Setelah menambah variabel, lakukan Redeploy agar terbaca.
`);

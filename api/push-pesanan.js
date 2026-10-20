// Dipanggil oleh Database Webhook Supabase setiap ada pesanan baru (tabel orders, INSERT).
// Mengirim notifikasi Web Push ke browser penjual pemilik toko.
//
// Variabel lingkungan (Vercel → Settings → Environment Variables):
//   PUSH_WEBHOOK_SECRET        rahasia yang sama dengan header Authorization di webhook
//   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT   (buat dengan: node scripts/buat-kunci-push.mjs)
//   SUPABASE_SERVICE_ROLE_KEY  kunci service role (RAHASIA, jangan diawali VITE_)
//   VITE_SUPABASE_URL          sudah ada
import webpush from 'web-push';
import { timingSafeEqual } from 'node:crypto';
import { adalahUuid } from './_seo.js';

const sama = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ galat: 'Metode tidak didukung' });

  const rahasia = process.env.PUSH_WEBHOOK_SECRET;
  const dikirim = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!rahasia || !sama(dikirim, rahasia)) return res.status(401).json({ galat: 'Tidak berwenang' });

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const urlDb = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT || !SUPABASE_SERVICE_ROLE_KEY || !urlDb) {
    return res.status(500).json({ galat: 'Konfigurasi server belum lengkap' });
  }

  const badan = req.body || {};
  const pesanan = badan.record;
  if (badan.type !== 'INSERT' || !pesanan || !adalahUuid(pesanan.toko_id)) {
    return res.status(200).json({ diabaikan: true });
  }

  const rest = async (path, opsi = {}) => {
    const r = await fetch(`${urlDb}/rest/v1/${path}`, {
      ...opsi,
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        ...(opsi.headers || {}),
      },
    });
    return r.ok && r.status !== 204 ? r.json() : [];
  };

  const toko = (await rest(`toko?id=eq.${pesanan.toko_id}&select=user_id,nama_toko`))[0];
  if (!toko?.user_id) return res.status(200).json({ diabaikan: true });

  const langganan = await rest(
    `push_langganan?user_id=eq.${toko.user_id}&select=id,endpoint,p256dh,auth`,
  );
  if (!langganan.length) return res.status(200).json({ terkirim: 0, gagal: 0 });

  let namaProduk = '';
  let gambar = '';
  if (adalahUuid(pesanan.produk_id)) {
    const p = (await rest(`produk?id=eq.${pesanan.produk_id}&select=nama_produk,foto_url`))[0];
    namaProduk = p?.nama_produk ?? '';
    gambar = p?.foto_url ?? '';
  }

  const isi = [
    pesanan.nama_pemesan ? `${pesanan.nama_pemesan} memesan` : 'Ada pesanan masuk',
    namaProduk && ` ${namaProduk}`,
    pesanan.jumlah > 1 && ` ×${pesanan.jumlah}`,
    pesanan.total_harga && ` (${rupiah(pesanan.total_harga)})`,
  ]
    .filter(Boolean)
    .join('');

  // Membuka pesanan itu langsung; tombol "Konfirmasi" membuka dialog konfirmasinya.
  // Mengubah status tetap perlu penjual yang sudah masuk, jadi tautan ini tidak bisa disalahgunakan.
  const dasarUrl = adalahUuid(pesanan.id) ? `/toko/order?pesanan=${pesanan.id}` : '/toko/order';

  const muatan = JSON.stringify({
    judul: `Pesanan baru di ${toko.nama_toko}`,
    isi,
    url: dasarUrl,
    urlKonfirmasi: adalahUuid(pesanan.id) ? `${dasarUrl}&aksi=konfirmasi` : '',
    gambar,
    // tiap pesanan tampil sendiri (tidak saling menimpa)
    tag: `pesanan-${pesanan.id ?? Date.now()}`,
    penting: true,
  });

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const hasil = await Promise.allSettled(
    langganan.map((l) =>
      webpush.sendNotification({ endpoint: l.endpoint, keys: { p256dh: l.p256dh, auth: l.auth } }, muatan, {
        TTL: 60 * 60,
        urgency: 'high',
      }),
    ),
  );

  // Langganan yang sudah tidak berlaku (browser dicopot atau izin dicabut) dibersihkan
  const kedaluwarsa = langganan
    .filter((_, i) => hasil[i].status === 'rejected' && [404, 410].includes(hasil[i].reason?.statusCode))
    .map((l) => l.id);
  if (kedaluwarsa.length) {
    await rest(`push_langganan?id=in.(${kedaluwarsa.join(',')})`, { method: 'DELETE' });
  }

  const terkirim = hasil.filter((h) => h.status === 'fulfilled').length;
  return res.status(200).json({ terkirim, gagal: hasil.length - terkirim, dibersihkan: kedaluwarsa.length });
}

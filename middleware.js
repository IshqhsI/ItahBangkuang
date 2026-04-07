import { next } from '@vercel/edge';

export default function middleware(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';

  // 1. Cek apakah ini route produk
  if (url.pathname.startsWith('/produk/')) {
    const productId = url.pathname.split('/').pop();

    // 2. Cek apakah yang akses adalah Bot Crawler
    const isBot =
      /bot|facebook|whatsapp|twitter|telegram|slack|linkedin|discord/i.test(
        userAgent,
      );

    if (isBot && productId) {
      // Lempar ke Supabase Edge Function untuk ambil Meta Tags
      return fetch(
        `https://nkrlzxefccailaidxamj.supabase.co/functions/v1/get-meta?id=${productId}`,
      );
    }
  }

  // Jika manusia, lanjutkan ke aplikasi SPA (index.html)
  return next();
}

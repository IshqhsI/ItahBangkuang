export const config = {
  matcher: '/produk/:path*',
};

export default function middleware(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';

  // 1. Ambil ID produk dari URL
  const productId = url.pathname.split('/').pop();

  // 2. Cek apakah yang akses adalah Bot
  const isBot =
    /bot|facebook|whatsapp|twitter|telegram|slack|linkedin|discord/i.test(
      userAgent,
    );

  if (isBot && productId) {
    // 3. Arahkan Bot ke Supabase Edge Function
    const supabaseUrl = `https://nkrlzxefccailaidxamj.supabase.co/functions/v1/get-meta?id=${productId}`;

    // Gunakan rewrite dengan me-return fetch
    return fetch(supabaseUrl);
  }
}

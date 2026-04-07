import { NextResponse } from 'next/server';

export default function middleware(req) {
  const url = req.nextUrl.clone();
  const userAgent = req.headers.get('user-agent') || '';

  // 1. Cek apakah ini route produk
  if (url.pathname.startsWith('/produk/')) {
    const productId = url.pathname.split('/').pop();

    // 2. Cek apakah yang akses adalah Bot
    const isBot =
      /bot|facebook|whatsapp|twitter|telegram|slack|linkedin|discord/i.test(
        userAgent,
      );

    if (isBot && productId) {
      // Panggil Supabase Edge Function
      const supabaseFunctionUrl = `https://nkrlzxefccailaidxamj.supabase.co/functions/v1/get-meta?id=${productId}`;
      return NextResponse.rewrite(supabaseFunctionUrl);
    }
  }

  // Jika manusia atau bukan route produk, lanjutkan
  return NextResponse.next();
}

// Konfigurasi agar middleware hanya jalan di route produk saja (lebih efisien)
export const config = {
  matcher: '/produk/:path*',
};

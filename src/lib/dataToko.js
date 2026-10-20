import { supabase } from '@/lib/supabase';
import { labelKategori } from '@/lib/kategori';
import { statusBuka } from '@/lib/jamBuka';

export const KOLOM_TOKO_KARTU =
  'id, slug, nama_toko, alamat, foto_toko, nomor_wa, terverifikasi, created_at, jam_buka, layanan_pesan, layanan_antar, layanan_ambil';

/**
 * Melengkapi baris toko dengan data untuk kartu: foto produk, jumlah produk, kategori, dan status buka.
 * Sumbernya view katalog (hanya produk aktif milik toko aktif).
 */
export async function lengkapiToko(toko) {
  const perToko = {};
  if (toko.length) {
    const { data: produk } = await supabase
      .from('produk_katalog')
      .select('toko_id, foto_url, kategori, stok_total')
      .in('toko_id', toko.map((t) => t.id))
      .order('created_at', { ascending: false })
      .limit(400);
    for (const p of produk ?? []) {
      const e = (perToko[p.toko_id] ??= { jumlah: 0, foto: [], kat: {} });
      e.jumlah += 1;
      e.kat[p.kategori] = (e.kat[p.kategori] ?? 0) + 1;
      if (p.foto_url && e.foto.length < 3 && Number(p.stok_total) > 0) e.foto.push(p.foto_url);
    }
    // Toko yang produknya habis semua tetap diberi foto
    for (const p of produk ?? []) {
      const e = perToko[p.toko_id];
      if (p.foto_url && e.foto.length < 3 && !e.foto.includes(p.foto_url)) e.foto.push(p.foto_url);
    }
  }

  return toko.map((t) => {
    const e = perToko[t.id];
    return {
      ...t,
      jumlahProduk: e?.jumlah ?? 0,
      foto: e?.foto ?? [],
      // dua kategori terbanyak
      kategori: Object.entries(e?.kat ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => labelKategori(k)),
      status_buka: statusBuka(t.jam_buka),
    };
  });
}

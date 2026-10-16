// Satu-satunya tempat kategori didefinisikan.
// Tambah / ubah / hapus kategori cukup di sini.
// `icon` adalah komponen Lucide, `warna` adalah cat papan kategorinya.

import { markRaw } from 'vue';
import {
  Cookie,
  CupSoda,
  CookingPot,
  Shirt,
  Wrench,
  Plug,
  Package,
} from 'lucide-vue-next';

export const KATEGORI = [
  { slug: 'makanan_jajanan', label: 'Makanan & Jajanan', icon: markRaw(Cookie), warna: 'merah' },
  { slug: 'aneka_minuman', label: 'Aneka Minuman', icon: markRaw(CupSoda), warna: 'biru' },
  { slug: 'dapur_lauk', label: 'Dapur & Lauk Pauk', icon: markRaw(CookingPot), warna: 'kuning' },
  { slug: 'pakaian_jahitan', label: 'Pakaian & Jahitan', icon: markRaw(Shirt), warna: 'hijau' },
  { slug: 'jasa_tukang', label: 'Jasa & Tukang', icon: markRaw(Wrench), warna: 'merah' },
  { slug: 'mesin_elektronik', label: 'Mesin & Elektronik', icon: markRaw(Plug), warna: 'biru' },
  { slug: 'lainnya', label: 'Lainnya', icon: markRaw(Package), warna: 'kuning' },
];

// Ambil label dari slug — pakai di card produk, badge, dsb
export const labelKategori = (slug) =>
  KATEGORI.find((k) => k.slug === slug)?.label ?? slug;

// Ambil komponen ikon dari slug
export const iconKategori = (slug) =>
  KATEGORI.find((k) => k.slug === slug)?.icon ?? markRaw(Package);

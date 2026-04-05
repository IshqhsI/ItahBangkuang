// Satu-satunya tempat kategori didefinisikan.
// Tambah / ubah / hapus kategori cukup di sini.

export const KATEGORI = [
  { slug: 'makanan_jajanan', label: 'Makanan & Jajanan', icon: '🍔' },
  { slug: 'aneka_minuman', label: 'Aneka Minuman', icon: '🥤' },
  { slug: 'dapur_lauk', label: 'Dapur & Lauk Pauk', icon: '🍳' },
  { slug: 'pakaian_jahitan', label: 'Pakaian & Jahitan', icon: '👗' },
  { slug: 'jasa_tukang', label: 'Jasa & Tukang', icon: '🔧' },
  { slug: 'mesin_elektronik', label: 'Mesin & Elektronik', icon: '💻' },
  { slug: 'lainnya', label: 'Lainnya', icon: '📦' },
];

// Ambil label dari slug — pakai di card produk, badge, dsb
export const labelKategori = (slug) =>
  KATEGORI.find((k) => k.slug === slug)?.label ?? slug;

// Ambil icon dari slug
export const iconKategori = (slug) =>
  KATEGORI.find((k) => k.slug === slug)?.icon ?? '📦';

// Ambil label + icon sekaligus — pakai di tab filter
export const labelIkonKategori = (slug) => {
  const k = KATEGORI.find((k) => k.slug === slug);
  return k ? `${k.icon} ${k.label}` : slug;
};

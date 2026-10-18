/**
 * useSeo — composable untuk set meta tag dinamis per halaman
 * Tidak butuh package tambahan, pakai native DOM API
 *
 * Cara pakai:
 * import { useSeo } from '@/lib/useSeo'
 * useSeo({
 *   title: 'Nama Produk — ItahBangkuang',
 *   description: 'Deskripsi singkat produk...',
 *   image: 'https://...',  // opsional
 *   url: 'https://...',    // opsional
 * })
 */

const BASE_TITLE = 'ItahBangkuang';
export const BASE_URL = 'https://www.itahbangkuang.my.id';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const DEFAULT_DESC =
  'Belanja dan berjualan produk lokal Kelurahan Bangkuang, Kecamatan Karau Kuala, Kabupaten Barito Selatan: makanan, minuman, pakaian, dan jasa dari warga. Pesan langsung dari penjual lewat WhatsApp.';

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSeo({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
} = {}) {
  const fullTitle = title
    ? `${title} — ${BASE_TITLE}`
    : `${BASE_TITLE} — Marketplace Lokal Kelurahan Bangkuang`;

  const desc = description || DEFAULT_DESC;
  const img = image || DEFAULT_IMAGE;
  const canonical = url || BASE_URL;

  // Title
  document.title = fullTitle;

  // Primary meta
  setMeta('description', desc);
  setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

  // Canonical
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonical);

  // Open Graph
  setMeta('og:title', fullTitle, 'property');
  setMeta('og:description', desc, 'property');
  setMeta('og:image', img, 'property');
  setMeta('og:url', canonical, 'property');
  setMeta('og:type', type, 'property');

  // Twitter
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', desc);
  setMeta('twitter:image', img);
}

/**
 * useProductSeo — khusus untuk halaman detail produk
 * Otomatis generate JSON-LD Product schema
 */
export function useProductSeo({
  nama,
  deskripsi,
  harga,
  hargaMaks,
  stok,
  foto,
  tokoNama,
  produkId,
}) {
  const title = nama;
  const description = deskripsi
    ? `${deskripsi.slice(0, 130)}...`
    : `${nama} dari toko ${tokoNama} di ItahBangkuang`;
  const url = `${BASE_URL}/produk/${produkId}`;

  useSeo({ title, description, image: foto, url, type: 'product' });

  // JSON-LD Product schema
  const existingScript = document.querySelector('#jsonld-product');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'jsonld-product';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: nama,
    description: deskripsi || `${nama} dari ${tokoNama}`,
    image: foto,
    url,
    offers: {
      ...(hargaMaks && hargaMaks !== harga
        ? { '@type': 'AggregateOffer', lowPrice: harga, highPrice: hargaMaks }
        : { '@type': 'Offer', price: harga, url }),
      priceCurrency: 'IDR',
      availability: stok > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: tokoNama,
      },
    },
  });
  document.head.appendChild(script);

  pasangBreadcrumb([
    { name: 'Beranda', url: `${BASE_URL}/` },
    { name: 'Produk', url: `${BASE_URL}/produk` },
    { name: nama, url },
  ]);
}

/** Breadcrumb JSON-LD (menggantikan yang lama bila ada) */
export function pasangBreadcrumb(butir) {
  document.querySelector('#jsonld-breadcrumb')?.remove();
  const el = document.createElement('script');
  el.id = 'jsonld-breadcrumb';
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: butir.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: b.url,
    })),
  });
  document.head.appendChild(el);
}

/**
 * pasangFaq — JSON-LD FAQPage dari daftar { t: pertanyaan, j: jawaban }.
 * Catatan: Google hanya menampilkan hasil kaya FAQ untuk situs tertentu,
 * tetapi data ini tetap membantu mesin memahami isi halaman.
 */
export function pasangFaq(daftar = []) {
  document.querySelector('#jsonld-faq')?.remove();
  if (!daftar.length) return;
  const polos = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const el = document.createElement('script');
  el.id = 'jsonld-faq';
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: daftar.map((q) => ({
      '@type': 'Question',
      name: polos(q.t),
      acceptedAnswer: { '@type': 'Answer', text: polos(q.j) },
    })),
  });
  document.head.appendChild(el);
}

/**
 * resetSeo — dipanggil setiap pindah halaman agar meta dan JSON-LD halaman
 * sebelumnya tidak terbawa. Halaman yang punya SEO sendiri memanggil useSeo
 * lagi setelah ini.
 */
export function resetSeo(noindex = false) {
  document.querySelector('#jsonld-product')?.remove();
  document.querySelector('#jsonld-store')?.remove();
  document.querySelector('#jsonld-breadcrumb')?.remove();
  document.querySelector('#jsonld-faq')?.remove();
  useSeo({ noindex });
}

/**
 * useStoreSeo — khusus halaman profil toko
 */
export function useStoreSeo({ namaTokoNama, deskripsi, foto, alamat, tokoId }) {
  const title = namaTokoNama;
  const description = deskripsi
    ? `${deskripsi.slice(0, 130)}...`
    : `Toko ${namaTokoNama} di ItahBangkuang — produk lokal Kelurahan Bangkuang`;
  const url = `${BASE_URL}/toko/${tokoId}`;

  useSeo({ title, description, image: foto, url });

  // JSON-LD LocalBusiness
  const existingScript = document.querySelector('#jsonld-store');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'jsonld-store';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: namaTokoNama,
    description: deskripsi || `Toko ${namaTokoNama}`,
    image: foto,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: alamat,
      addressLocality: 'Bangkuang, Karau Kuala',
      addressRegion: 'Kalimantan Tengah',
      postalCode: '73761',
      addressCountry: 'ID',
    },
    areaServed: 'Kabupaten Barito Selatan',
  });
  document.head.appendChild(script);
}

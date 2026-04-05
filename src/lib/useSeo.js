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
const BASE_URL = 'https://itah-bangkuang.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.webp`;
const DEFAULT_DESC =
  'Pusat jual beli produk unggulan warga Kelurahan Bangkuang. Mari dukung UMKM lokal dengan belanja mudah, aman, dan terpercaya di ItahBangkuang.';;

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
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: harga,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'LocalBusiness',
        name: tokoNama,
      },
    },
  });
  document.head.appendChild(script);
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
      addressLocality: 'Kelurahan Bangkuang',
      addressRegion: 'Kalimantan Tengah',
      addressCountry: 'ID',
    },
  });
  document.head.appendChild(script);
}

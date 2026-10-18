// Alamat ramah (slug) bila ada; jatuh kembali ke UUID bila slug belum terisi.
export const urlProduk = (p) => `/produk/${p?.slug || p?.id}`;
export const urlToko = (t) => `/toko/${t?.slug || t?.id}`;

// UUID standar (8-4-4-4-12)
export const adalahUuid = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v ?? ''));

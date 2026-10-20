/**
 * Menyiapkan foto sebelum diunggah: dikecilkan (sisi terpanjang maksimal 1280 px)
 * dan diubah ke WebP agar halaman lebih ringan dimuat. Bila browser tidak dapat
 * menghasilkan WebP, atau hasilnya tidak lebih kecil, foto asli dipakai apa adanya.
 */
export async function siapkanFoto(file, { maksSisi = 1280, kualitas = 0.82 } = {}) {
  try {
    if (!file?.type?.startsWith('image/') || file.type === 'image/gif') return file;

    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const skala = Math.min(1, maksSisi / Math.max(bmp.width, bmp.height));
    const lebar = Math.max(1, Math.round(bmp.width * skala));
    const tinggi = Math.max(1, Math.round(bmp.height * skala));

    const kanvas = document.createElement('canvas');
    kanvas.width = lebar;
    kanvas.height = tinggi;
    kanvas.getContext('2d').drawImage(bmp, 0, 0, lebar, tinggi);
    bmp.close?.();

    // WebP bila didukung; kalau tidak, JPEG, supaya foto besar tetap berhasil dikecilkan
    let blob = await new Promise((selesai) => kanvas.toBlob(selesai, 'image/webp', kualitas));
    let jenis = 'image/webp';
    if (!blob || blob.type !== jenis) {
      jenis = 'image/jpeg';
      blob = await new Promise((selesai) => kanvas.toBlob(selesai, jenis, kualitas));
    }
    if (!blob || blob.type !== jenis) return file;
    if (skala === 1 && blob.size >= file.size) return file;

    const nama = file.name.replace(/\.[^.]+$/, '') + (jenis === 'image/webp' ? '.webp' : '.jpg');
    return new File([blob], nama, { type: jenis });
  } catch {
    return file;
  }
}

/**
 * Status buka/tutup dari teks jam buka, hanya untuk bentuk sederhana seperti
 * "Setiap hari 07.00–17.00" atau "07:00 - 21:00". Teks yang menyebut hari tertentu
 * (Senin, Sabtu, dst.) tidak dapat dipastikan, jadi tidak ditampilkan status apa pun.
 * Waktu dihitung dalam WIB (Kalimantan Tengah).
 *
 * @returns {{ buka: boolean, teks: string } | null}
 */
export function statusBuka(teks, sekarang = new Date()) {
  const t = String(teks ?? '').trim();
  if (!t) return null;

  // Menyebut hari tertentu: tidak dapat dipastikan
  const tanpaSetiap = t.replace(/setiap hari|tiap hari|sehari-hari|harian/gi, '');
  if (/senin|selasa|rabu|kamis|jum'?at|sabtu|minggu|ahad|libur|tutup/i.test(tanpaSetiap)) return null;

  const m = t.match(/(\d{1,2})[.:](\d{2})\s*(?:-|–|—|s\/d|sd|sampai|hingga)\s*(\d{1,2})[.:](\d{2})/i);
  if (!m) return null;

  const mulai = Number(m[1]) * 60 + Number(m[2]);
  const selesai = Number(m[3]) * 60 + Number(m[4]);
  if ([m[1], m[3]].some((j) => Number(j) > 24) || [m[2], m[4]].some((mn) => Number(mn) > 59)) return null;

  const wib = new Date(sekarang.getTime() + 7 * 60 * 60 * 1000);
  const kini = wib.getUTCHours() * 60 + wib.getUTCMinutes();

  const buka =
    mulai === selesai
      ? true // 24 jam
      : mulai < selesai
        ? kini >= mulai && kini < selesai
        : kini >= mulai || kini < selesai; // melewati tengah malam

  const jam = (menit) => `${String(Math.floor(menit / 60) % 24).padStart(2, '0')}.${String(menit % 60).padStart(2, '0')}`;
  return buka
    ? { buka: true, teks: mulai === selesai ? 'Buka 24 jam' : `Buka · tutup ${jam(selesai)}` }
    : { buka: false, teks: `Tutup · buka ${jam(mulai)}` };
}

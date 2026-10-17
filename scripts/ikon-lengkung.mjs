// Gambar lengkung + toko untuk ikon aplikasi, selaras dengan merek di NavBar.
// `skala` mengecilkan isi agar muat di zona aman ikon maskable (sekitar 72%).
export const gambarLengkung = (skala = 1) => `
<g transform="translate(256 256) scale(${skala}) translate(-256 -256)">
  <!-- lengkung -->
  <path d="M142 380 V226 A114 114 0 0 1 370 226 V380 Q370 404 346 404 H166 Q142 404 142 380 Z" fill="#F4B98A"/>
  <!-- kanopi bergerigi -->
  <path d="M184 230 H328 V260 A24 24 0 0 1 280 260 A24 24 0 0 1 232 260 A24 24 0 0 1 184 260 Z" fill="#1F4D42"/>
  <!-- badan toko -->
  <rect x="198" y="304" width="116" height="66" rx="6" fill="#1F4D42"/>
  <!-- pintu -->
  <rect x="240" y="326" width="32" height="44" rx="5" fill="#F4B98A"/>
</g>`;

export const svgIkon = ({ maskable = false } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="latar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2F6A59"/>
      <stop offset="1" stop-color="#163A32"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" ${maskable ? '' : 'rx="112"'} fill="url(#latar)"/>
  ${gambarLengkung(maskable ? 0.84 : 1.12)}
</svg>`;

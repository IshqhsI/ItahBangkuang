// Gambar papan "IB" untuk ikon aplikasi. `skala` mengecilkan papan agar muat di zona aman ikon maskable.
export const gambarPapan = (skala = 1) => `
<g transform="translate(256 256) scale(${skala}) rotate(-4) translate(-256 -256)">
  <rect x="86" y="160" width="340" height="192" rx="26" fill="#F2C230" stroke="#141414" stroke-width="16"/>
  <rect x="110" y="184" width="292" height="144" rx="12" fill="none" stroke="#C8202B" stroke-width="7"/>
  <path d="M190 204 V308" stroke="#C8202B" stroke-width="26" stroke-linecap="butt" fill="none"/>
  <path d="M262 204 H294 a26 26 0 0 1 0 52 H262 M262 256 H300 a26 26 0 0 1 0 52 H262 M262 204 V308"
        stroke="#141414" stroke-width="24" stroke-linejoin="round" stroke-linecap="butt" fill="none"/>
</g>`;

export const svgIkon = ({ maskable = false } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" ${maskable ? '' : 'rx="112"'} fill="#C8202B"/>
  ${gambarPapan(maskable ? 0.74 : 1)}
</svg>`;

const fs = require('fs/promises');
const sharp = require('sharp');

const SRC  = './assets/icons/svg';
const DEST = './public/icons';      // quedarán expuestos por Vercel
const SIZE = 64;                    // 64 px = 4× de 16 px

(async () => {
  const svgs = (await fs.readdir(SRC)).filter(f => f.endsWith('.svg'));
  await Promise.all(
    svgs.map(async f => {
      const data = await fs.readFile(`${SRC}/${f}`);
      const base = f.replace('.svg', '');
      await sharp(data)
        .resize(SIZE, SIZE, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
        .png({ palette: true, effort: 7 })         // PNG-8 optimizado
        .toFile(`${DEST}/${base}.png`);
    })
  );
})(); 
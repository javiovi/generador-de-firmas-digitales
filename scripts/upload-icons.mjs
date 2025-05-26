import 'dotenv/config';                 // ← carga .env.local
import { readdir, readFile } from 'node:fs/promises';
import { put } from '@vercel/blob';

const ICON_DIR = './public/icons';
const files = await readdir(ICON_DIR);

for (const f of files) {
  if (!f.endsWith('.png')) continue;
  const data = await readFile(`${ICON_DIR}/${f}`);
  await put(`icons/${f}`, data, { access: 'public' });
  console.log('↑', f);
}

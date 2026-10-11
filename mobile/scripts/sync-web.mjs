import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(here, '..');
const source = path.resolve(mobileRoot, '..', 'index.html');
const destinationDir = path.join(mobileRoot, 'src');
const destination = path.join(destinationDir, 'index.html');
let html = await readFile(source, 'utf8');
const moduleScript = '<script type="module" src="/native-share-bridge.js"></script>\n';
if (!html.includes('native-share-bridge.js')) {
  if (!html.includes('</body>')) throw new Error('index.html is missing </body>');
  html = html.replace('</body>', moduleScript + '</body>');
}
await mkdir(destinationDir, { recursive: true });
await writeFile(destination, html, 'utf8');
console.log('Synced root index.html to mobile/src/index.html; original root file was not modified by the sync script.');

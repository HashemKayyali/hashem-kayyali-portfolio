import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = resolve(process.argv[2] ?? 'dist');
const files = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});
const html = readFileSync(join(root, 'index.html'), 'utf8');
const entryScripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
const rows = files(root).filter((file) => /\.(?:js|css|webp|png|woff2?)$/.test(file)).map((file) => {
  const buffer = readFileSync(file);
  const url = '/' + relative(root, file).replaceAll('\\', '/');
  return { url, bytes: buffer.length, gzipBytes: /\.(js|css)$/.test(file) ? gzipSync(buffer).length : null, entry: entryScripts.includes(url) };
});
const report = { root, entryScripts, assets: rows, externalFonts: [...html.matchAll(/<link[^>]+href="(https:[^"]+)"/g)].map((match) => match[1]).filter((url) => /fonts\.(googleapis|gstatic)\.com/.test(url)) };
if (process.argv[3]) {
  mkdirSync(dirname(resolve(process.argv[3])), { recursive: true });
  writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ entries: rows.filter((row) => row.entry), javascript: rows.filter((row) => row.url.endsWith('.js')), css: rows.filter((row) => row.url.endsWith('.css')), externalFonts: report.externalFonts }, null, 2));

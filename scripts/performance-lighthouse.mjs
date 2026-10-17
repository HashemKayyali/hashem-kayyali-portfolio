import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [url, output] = process.argv.slice(2);
if (!url || !output) throw new Error('Usage: node scripts/performance-lighthouse.mjs URL output.json');
const cli = resolve('output/performance-tooling/node_modules/lighthouse/cli/index.js');
if (!existsSync(cli)) throw new Error('Install official tooling: npm install --prefix output/performance-tooling --no-audit --no-fund lighthouse@13.5.0');
mkdirSync(dirname(resolve(output)), { recursive: true });
const chromePath = process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const run = spawnSync(process.execPath, [cli, url,
  '--only-categories=performance', '--form-factor=mobile', '--throttling-method=simulate',
  '--port=9228', '--chrome-flags=--headless=new --no-sandbox',
  '--output=json', `--output-path=${output}`, '--quiet',
], { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromePath }, windowsHide: true });
if (run.error) throw run.error;
process.exitCode = run.status ?? 1;

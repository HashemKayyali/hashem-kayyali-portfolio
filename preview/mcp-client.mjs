import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

// Actual official MCP servers, connected over stdio because this desktop session
// does not expose their configured tools in its tool catalog. No project runtime dependency.
export async function connect(server) {
  const args = server === 'playwright'
    ? ['@playwright/mcp@latest', '--headless', '--browser', 'chrome', '--isolated', '--viewport-size', '1440,1000', '--output-dir', 'output/playwright/motion-lab', '--image-responses', 'omit']
    : ['chrome-devtools-mcp@latest', '--headless', '--isolated', '--no-usage-statistics', '--no-performance-crux', '--viewport', '1440x1000', '--workspace', process.cwd()];
  const child = spawn(process.execPath, ['C:/Program Files/nodejs/node_modules/npm/bin/npx-cli.js', '--yes', ...args], { cwd: process.cwd(), windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  let serial = 0, buffer = ''; const waiting = new Map(); const log = [];
  child.stderr.on('data', data => log.push(String(data)));
  child.stdout.on('data', data => {
    buffer += data;
    let end;
    while ((end = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
      try { const message = JSON.parse(line); if (waiting.has(message.id)) { waiting.get(message.id)(message); waiting.delete(message.id); } } catch { log.push(line); }
    }
  });
  const request = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial;
    const timeout = setTimeout(() => { waiting.delete(id); reject(new Error(`${server}: ${method} timed out`)); }, 180000);
    waiting.set(id, message => { clearTimeout(timeout); message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result); });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
  await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'portfolio-local-review', version: '1.0' } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const inventory = await request('tools/list');
  await mkdir('output/playwright/motion-lab', { recursive: true });
  await writeFile(`output/playwright/motion-lab/${server}-tools.json`, JSON.stringify(inventory, null, 2));
  return { tools: inventory.tools, call: (name, arguments_ = {}) => request('tools/call', { name, arguments: arguments_ }), close: () => { child.stdin.end(); child.kill(); }, log };
}

if (process.argv[2] === 'list') {
  for (const server of ['playwright', 'devtools']) { const client = await connect(server); console.log(server, client.tools.map(tool => ({name:tool.name, input:tool.inputSchema}))); client.close(); }
}

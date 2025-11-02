/*
 Preflight smoke test:
 - Builds the app
 - Starts a production server on a temp port
 - Probes critical endpoints used by the client
 - Exits non-zero if any probe fails
*/

const { spawn } = require('child_process');
const http = require('http');

const PORT = process.env.PREFLIGHT_PORT ? Number(process.env.PREFLIGHT_PORT) : 4020;
const BASE = `http://localhost:${PORT}`;

const ENDPOINTS = [
  '/',
  '/api/hero',
  '/api/services',
  '/api/projects',
  '/api/experience',
  '/api/education',
  '/api/skills',
  '/api/contactInfo',
  '/api/blogs',
  '/api/chatbot',
  '/api/admin/testimonials',
];

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await probe('/');
      if (ok) return true;
    } catch {}
    await wait(500);
  }
  return false;
}

function probe(path, method = 'GET') {
  return new Promise((resolve) => {
    const req = http.request(BASE + path, { method, timeout: 10000 }, (res) => {
      // consider any 2xx a pass
      resolve(res.statusCode >= 200 && res.statusCode < 300);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function main() {
  console.log('\n[Preflight] Building...');
  const build = spawn('npm', ['run', '-s', 'build'], { stdio: 'inherit' });
  const buildCode = await new Promise((r) => build.on('close', r));
  if (buildCode !== 0) {
    console.error('[Preflight] Build failed');
    process.exit(1);
  }

  console.log(`\n[Preflight] Starting server on ${BASE} ...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'inherit' });

  const ready = await waitForServer(60000);
  if (!ready) {
    console.error('[Preflight] Server did not become ready in time');
    server.kill('SIGKILL');
    process.exit(1);
  }

  console.log('[Preflight] Probing endpoints...');
  const failures = [];
  for (const ep of ENDPOINTS) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await probe(ep);
    console.log(`  ${ok ? '✓' : '⨯'} ${ep}`);
    if (!ok) failures.push(ep);
  }

  server.kill('SIGKILL');

  if (failures.length) {
    console.error(`\n[Preflight] FAIL. ${failures.length} endpoint(s) failed:`);
    for (const f of failures) console.error(' -', f);
    process.exit(1);
  }

  console.log('\n[Preflight] PASS. All checks OK.');
}

main().catch((e) => {
  console.error('[Preflight] Uncaught error:', e);
  process.exit(1);
});

// Smoke tests: validators, same-address logic, and the application -> hub code round trip.
// Run with: npm test
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, '..');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => { if (!/scrollTo/.test(e.message)) errors.push(e.message); });

function load(rel) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  return new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://example.test/',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) { w.scrollTo = () => {}; },
  }).window;
}

(async () => {
  const app = load('public/index.html');
  const hub = load('internal/selection-diagnostic-hub.html');

  // Validators
  const t = (expr) => app.eval(expr);
  assert.equal(t(`validId('8001015009087')`), true);
  assert.equal(t(`validId('8001015009088')`), false, 'bad check digit');
  assert.equal(t(`validId('800101500908')`), false, 'too short');
  assert.equal(t(`validId('8002305009087')`), false, 'impossible birth date');
  assert.equal(t(`validEmail('name.s@example.co.za')`), true);
  assert.equal(t(`validEmail('bad@')`), false);
  assert.equal(t(`validDate('2024-02-29')`), true);
  assert.equal(t(`validDate('2023-02-29')`), false);
  assert.equal(t(`validDate('12345-01-01')`), false, 'five-digit year');
  assert.equal(t(`validYear('2019')`), true);
  assert.equal(t(`validYear('19')`), false);

  // Same-address question hides business address fields
  app.eval(`ST.step=2;render()`);
  const has = (id) => !!app.document.getElementById('m-' + id);
  app.eval(`ST.f['B10.5']='Yes';render()`);
  assert.equal(has('B13'), false);
  app.eval(`ST.f['B10.5']='No';render()`);
  assert.equal(has('B13'), true);

  // Application -> code -> hub
  app.eval(`
    EL.forEach((_, i) => ST.e[i] = '1');
    ST.f = {P2:'Nomusa Thandeka',P3:'Mkhize-Ndlovu',P4:'8001015009087',P5:'1996-05-04',P6:'24-29',
      P8:'She/Her',P13:'082 123 4567',P14:'nomusa.m@example.co.za',L1:'12 Main St, Madadeni',
      B1:'Mkhize | Ndlovu Plumbing & Electrical (Pty) Ltd',B5:'2021-02-01',
      B10:'Plumbing installation, repair, and maintenance',B20:'R241,000 to R500,000',O9:'4',O11:'2'};
    GT.forEach((_, i) => ST.t[i + 1] = i % 2 ? 'A' : 'D');
    GR.forEach((_, i) => ST.r[i + 1] = (i % 5) + 1);
    IRL.forEach((a, i) => ST.i[a.k] = [2, 4, 3, 1, 5, 9][i]);
    BDQ.forEach((_, i) => ST.b[i + 1] = i % 4);
    ST.ok = true; ST.step = LAST; render();
  `);
  await app.eval('submitApp()');
  const code = app.eval('ST.code');
  assert.match(code, /^IRM3\./);
  assert.ok(code.length < 600, 'code stays short, got ' + code.length);

  hub.eval(`S.tab='apps';render()`);
  hub.document.getElementById('jc').value = code;
  await hub.eval(`impCodes('jc')`);
  // Objects from the jsdom window have a different prototype; compare through JSON.
  const a = JSON.parse(hub.eval('JSON.stringify(S.apps[0])'));
  assert.equal(a.n, 'Mkhize | Ndlovu Plumbing & Electrical (Pty) Ltd');
  assert.equal(a.g, 'F');
  assert.equal(a.yo, true);
  assert.equal(a.ar, 'Madadeni');
  assert.deepEqual(a.il, { cr: 2, tr: 4, br: 3, ip: 1, tm: 5, fr: 9 });
  assert.equal(Object.keys(a.dg).length, 24);
  assert.equal(Object.keys(a.gt).length, 54);
  assert.equal(Object.keys(a.gr).length, 12);
  assert.equal(hub.eval('isEl(S.apps[0])'), true);

  // Re-importing the same code is skipped
  hub.document.getElementById('jc').value = code;
  await hub.eval(`impCodes('jc')`);
  assert.equal(hub.eval('S.apps.length'), 1);

  assert.deepEqual(errors, []);
  console.log('All smoke tests passed.');
})().catch((e) => { console.error(e); process.exit(1); });

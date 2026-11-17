// Optional real-browser verification. Uses a locally installed Chromium;
// no browser binaries are downloaded and the server binds only to loopback.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
const root = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    let path = resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) { response.writeHead(403).end(); return; }
    if (path.endsWith(sep) || !extname(path)) path += `${path.endsWith(sep) ? '' : sep}index.html`;
    const content = await readFile(path);
    response.writeHead(200, { 'content-type': mime[extname(path)] ?? 'application/octet-stream' }).end(content);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
    headless: true,
    args: process.getuid?.() === 0 ? ['--no-sandbox'] : [],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/examples/basic/index.html`);
  await page.locator('tsp-counter button').last().click();
  assert.match(await page.locator('tsp-counter span').textContent(), /Count: 6/);
  await page.getByPlaceholder('New task...').fill('Browser task');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  assert.match(await page.locator('tsp-task-board li').textContent(), /Browser task/);
  await page.locator('tsp-task-board input[type=checkbox]').check();
  await page.getByRole('button', { name: 'active', exact: true }).click();
  assert.equal(await page.locator('tsp-task-board li').count(), 0);
  await page.getByRole('button', { name: 'completed', exact: true }).click();
  assert.equal(await page.locator('tsp-task-board li').count(), 1);
  const behavior = await page.evaluate(async () => {
    const { define, html, signal, each, mount, unmount, svg, mathml } = await import('/src/index.js');
    const form = document.createElement('form');
    document.body.append(form);
    define.light('browser-field', ctx => {
      const internals = ctx.internals();
      ctx.effect(() => internals.setFormValue(String(ctx.props.value ?? 'initial')));
      return html`<span>${() => ctx.props.value}</span>`;
    }, { formAssociated: true });
    const field = document.createElement('browser-field');
    field.setAttribute('name', 'value'); field.setAttribute('value', 'first'); form.append(field);
    field.setAttribute('value', 'second');
    await new Promise(resolve => setTimeout(resolve, 0));
    const formValue = new FormData(form).get('value');
    let definitions = 0, disposed = 0;
    define.light('browser-row', ctx => {
      definitions++;
      ctx.disconnected(() => disposed++);
      return html`<input>`;
    });
    const target = document.createElement('div'); document.body.append(target);
    const rows = signal([1, 2]);
    const handle = mount(target, html`${each(rows, value => value, item => html`<browser-row data-key=${item}></browser-row>`)}`);
    const original = target.querySelector('browser-row');
    original.querySelector('input').value = 'retained';
    rows([2, 1]);
    await new Promise(resolve => setTimeout(resolve, 0));
    const moved = target.lastElementChild === original;
    const retained = original.querySelector('input').value;
    const afterMove = { definitions, disposed };
    unmount(target);
    await new Promise(resolve => setTimeout(resolve, 0));
    handle.dispose();
    mount(target, html`<svg>${svg`<circle cx=${3}></circle>`}</svg><math>${mathml`<mi>x</mi>`}</math>`);
    const namespaces = [...target.querySelectorAll('circle, mi')].map(node => node.namespaceURI);
    unmount(target); form.remove(); target.remove();
    return { formValue, moved, retained, afterMove, disposed, namespaces };
  });
  assert.equal(behavior.formValue, 'second');
  assert.ok(behavior.moved);
  assert.equal(behavior.retained, 'retained');
  assert.deepEqual(behavior.afterMove, { definitions: 2, disposed: 0 });
  assert.equal(behavior.disposed, 2);
  assert.deepEqual(behavior.namespaces, ['http://www.w3.org/2000/svg', 'http://www.w3.org/1998/Math/MathML']);
  // The global demo bundle is separately verified from the normal ESM build.
  await page.evaluate(async () => {
    const bundle = await import('/dist/glint.js');
    if (window.Glint !== undefined) throw new Error('Library import leaked a global');
    await import('/dist/glint.codepen.js');
    if (window.Glint?.html === undefined || typeof bundle.signal !== 'function') throw new Error('Bundle exports unavailable');
  });
  assert.deepEqual(errors, []);
  console.log('PASS Chromium: counter, tasks/filtering, form association, reactive props, keyed custom-element moves/disposal, namespaces, and both bundles');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  signal, computed, effect, batch, peek, isSignal, isComputed,
  createStateContainer, createSignalAdapter, tc39Signals,
  html, svg, mathml, mount, unmount, each, when, match, define,
  ref, model, configure, getConfig, TemplateResult, isTemplateResult,
} from '../src/index.js';
import { Scope } from '../src/core/scope.js';
let dom;
let handles;
beforeEach(() => {
  dom = new JSDOM('<main id="app"></main>', { url: 'http://localhost/' });
  for (const name of ['window', 'document', 'HTMLElement', 'customElements', 'Node', 'NodeFilter', 'MutationObserver', 'CustomEvent']) globalThis[name] = dom.window[name];
  handles = [];
  configure({ diagnostics: false });
});
afterEach(async () => {
  for (const handle of handles) handle.dispose();
  document.body.replaceChildren();
  await tick();
  dom.window.close();
});
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function render(value) { const handle = mount('#app', value); handles.push(handle); return handle; }
const app = () => document.querySelector('#app');

test('reactivity: computed identity, batching, dynamic dependencies, peek, and cleanup', () => {
  const a = signal(1), b = signal(10), chooseA = signal(true);
  const selected = computed(() => chooseA() ? a() : b());
  assert.ok(isSignal(a) && isComputed(selected));
  const log = [];
  const stop = effect(() => { log.push(selected()); return () => log.push('cleanup'); });
  batch(() => { a(2); a(3); });
  assert.deepEqual(log, [1, 'cleanup', 3]);
  chooseA(false);
  a(4);
  assert.deepEqual(log, [1, 'cleanup', 3, 'cleanup', 10]);
  let peeks = 0;
  const stopPeek = effect(() => { peek(a); peeks++; });
  a(5);
  assert.equal(peeks, 1);
  stop.dispose(); stop(); stopPeek();
  b(20);
  assert.equal(log.at(-1), 'cleanup');
  assert.throws(() => selected(5), /computed/);
  assert.equal(selected(), 20);
  selected.dispose();
  b(30);
  assert.equal(selected(), 20);
});

test('signal setters use Object.is and subscriptions return callable disposers', () => {
  const value = signal(NaN);
  let calls = 0;
  const stop = value.subscribe(() => calls++);
  value(NaN);
  assert.equal(calls, 1);
  value(0); value(-0);
  assert.equal(calls, 3);
  assert.ok(Object.is(value(), -0));
  stop(); value(1);
  assert.equal(calls, 3);
});

test('state shape compatibility, owned effects and idempotent disposal', () => {
  const state = createStateContainer();
  const shape = state({ count: 1, doubled: s => s.count() * 2 });
  const observed = [];
  state.effect(() => { observed.push(shape.doubled()); return () => observed.push('cleanup'); });
  shape.count(2);
  state.dispose(); state.dispose(); shape.count(3);
  assert.deepEqual(observed, [2, 'cleanup', 4, 'cleanup']);
  let late = 0;
  state.own(() => late++);
  state.effect(() => late++);
  assert.equal(late, 1);
  assert.ok(state.disposed);
  assert.equal(createSignalAdapter(tc39Signals), tc39Signals);
  assert.throws(() => createSignalAdapter({}), /requires/);
});

test('scope releases disposed children and completes cleanup after errors', () => {
  const scope = new Scope();
  const child = scope.child('child');
  child.dispose();
  assert.equal(scope.children.size, 0);
  const calls = [];
  scope.own(() => calls.push(1));
  scope.own(() => { calls.push(2); throw new Error('expected'); });
  assert.throws(() => scope.dispose(), AggregateError);
  assert.deepEqual(calls, [2, 1]);
});

test('templates bind nodes, attributes, interpolation, booleans, properties, and event aliases', () => {
  const value = signal('first'), disabled = signal(false);
  let clicks = 0;
  render(html`<button title="prefix ${value} / ${() => value().toUpperCase()}" ?disabled=${disabled} @click=${() => clicks++}>${value}</button>
    <input .value=${value} :checked=${disabled} onclick=${() => clicks++}>`);
  const button = app().querySelector('button'), input = app().querySelector('input');
  assert.equal(button.title, 'prefix first / FIRST');
  button.click(); input.click();
  assert.equal(clicks, 2);
  value('second'); disabled(true);
  assert.equal(button.textContent, 'second');
  assert.equal(button.title, 'prefix second / SECOND');
  assert.ok(button.disabled && input.checked);
  assert.equal(input.value, 'second');
  disabled(false);
  assert.ok(!button.hasAttribute('disabled'));
});

test('template updates preserve nodes and replace event handlers without invoking them', () => {
  let first = 0, second = 0;
  const view = (text, handler) => html`<button @click=${handler}>${text}</button>`;
  const handle = render(view('first', () => first++));
  const button = app().querySelector('button');
  assert.equal(first, 0);
  handle.update(view('second', () => second++));
  assert.equal(app().querySelector('button'), button);
  button.click();
  assert.equal(first, 0); assert.equal(second, 1);
  handle.dispose(); button.click();
  assert.equal(second, 1);
  assert.throws(() => handle.update(view('late', null)), /disposed/);
});

test('refs update and clear on branch removal and template source replacement', () => {
  const first = ref(), second = ref(), visible = signal(true);
  const view = reference => html`<input ${reference}>`;
  const handle = render(view(first));
  const input = first.current;
  handle.update(view(second));
  assert.equal(first.current, null); assert.equal(second.current, input);
  handle.update(html`${when(visible, () => view(first))}`);
  assert.ok(first.current);
  assert.equal(second.current, null);
  visible(false);
  assert.equal(first.current, null);
});

test('SVG and MathML namespaces and template identities', () => {
  const x = signal(3);
  render(html`<svg>${svg`<circle cx=${x} viewBox=${'0 0 10 10'}></circle>`}</svg><math>${mathml`<mi>${'x'}</mi>`}</math>`);
  const circle = app().querySelector('circle'), mi = app().querySelector('mi');
  assert.equal(circle.namespaceURI, 'http://www.w3.org/2000/svg');
  assert.equal(circle.getAttribute('viewBox'), '0 0 10 10');
  assert.equal(mi.namespaceURI, 'http://www.w3.org/1998/Math/MathML');
  x(4); assert.equal(circle.getAttribute('cx'), '4');
  assert.ok(isTemplateResult(html`a`));
  assert.ok(html`a` instanceof TemplateResult);
});

test('keyed each keeps row DOM, input state, and reactive item/index on reorder and replacement', () => {
  const rows = signal([{ id: 1, text: 'one' }, { id: 2, text: 'two' }]);
  let constructions = 0;
  render(html`<ul>${each(rows, row => row.id, (item, index) => {
    constructions++;
    return html`<li data-id=${() => item().id}><input><span>${() => item().text}:${index}</span></li>`;
  })}</ul>`);
  const one = app().querySelector('[data-id="1"]'), two = app().querySelector('[data-id="2"]');
  one.querySelector('input').value = 'user input';
  rows([{ id: 2, text: 'TWO' }, { id: 1, text: 'ONE' }]);
  assert.deepEqual([...app().querySelectorAll('li')], [two, one]);
  assert.equal(one.querySelector('span').textContent, 'ONE:1');
  assert.equal(one.querySelector('input').value, 'user input');
  assert.equal(constructions, 2);
  rows([{ id: 1, text: 'remaining' }]);
  assert.equal(app().querySelector('li'), one);
  assert.equal(one.querySelector('span').textContent, 'remaining:0');
  assert.ok(!two.isConnected);
});

test('array keys preserve identity without coercion and missing keys use positions', () => {
  const view = (key, label) => html`<p key=${key}>${label}</p>`;
  const items = signal([view(1, 'number'), view('1', 'string')]);
  render(html`${items}`);
  const [number, string] = app().querySelectorAll('p');
  items([view('1', 'STRING'), view(1, 'NUMBER')]);
  assert.deepEqual([...app().querySelectorAll('p')], [string, number]);
  assert.equal(number.textContent, 'NUMBER');
  assert.ok(!number.hasAttribute('key'));
});

test('duplicate keys fail before mutating list DOM', () => {
  const items = signal([1, 2]);
  render(html`${each(items, item => item, item => html`<span>${item}</span>`)}`);
  assert.throws(() => items([1, 1]), /Duplicate key/);
  assert.equal(app().textContent, '12');
  items([2, 3]);
  assert.equal(app().textContent, '23');
});

test('when/match keep stable branches, accept arrays, update specs, and dispose removed effects', () => {
  const value = signal(1), visible = signal(true), choice = signal('a');
  let reads = 0;
  const dynamic = () => { reads++; return value(); };
  const yes = () => html`<span>${dynamic}</span>`;
  const view = condition => html`${when(condition, yes, () => ['off', html`<b>!</b>`])}`;
  const handle = render(view(visible));
  const span = app().querySelector('span');
  visible(2);
  assert.equal(app().querySelector('span'), span);
  value(2); assert.equal(span.textContent, '2');
  visible(false);
  const oldReads = reads;
  value(3); assert.equal(reads, oldReads);
  assert.equal(app().textContent, 'off!');
  const other = signal(true);
  handle.update(view(other));
  assert.equal(app().textContent, '3');
  visible(true); assert.equal(app().textContent, '3');
  handle.update(html`${match(choice, { a: () => html`<i>A</i>`, _: key => html`<i>${key}</i>` })}`);
  choice('b'); assert.equal(app().textContent, 'b');
  choice(undefined); assert.equal(app().textContent, '');
  handle.update(html`${match(signal(undefined), { default: () => 'fallback' })}`);
  assert.equal(app().textContent, 'fallback');
});

test('mount replacement, unmount and nested removal clean listeners and subscriptions', () => {
  const count = signal(1), visible = signal(true);
  let calls = 0, reads = 0;
  const view = () => html`<button @click=${() => calls++}>${() => { reads++; return count(); }}</button>`;
  render(html`${when(visible, view)}`);
  const button = app().querySelector('button');
  visible(false);
  button.click(); count(2);
  assert.equal(calls, 0); assert.equal(reads, 1);
  render(view());
  const current = app().querySelector('button');
  render(html`replacement`);
  current.click(); count(3);
  assert.equal(calls, 0); assert.equal(reads, 2);
  unmount(app()); assert.equal(app().textContent, '');
});

test('legacy raw each callbacks still work via each.value', () => {
  const rows = signal([{ id: 1, text: 'old' }]);
  render(html`${each.value(rows, row => row.id, row => html`<p>${row.text}</p>`)}`);
  const p = app().querySelector('p');
  rows([{ id: 1, text: 'new' }]);
  assert.equal(app().querySelector('p'), p);
  assert.equal(p.textContent, 'new');
});

test('custom elements: reactive props, object definitions, aliases, events, disposal and reconnection', async () => {
  let setups = 0, connected = 0, disconnected = 0, cleanup = 0;
  const outside = signal(1);
  define('test-counter', {
    setup(ctx) {
      setups++;
      ctx.connected(() => connected++);
      ctx.disconnected(() => disconnected++);
      ctx.effect(() => { outside(); return () => cleanup++; });
      return { button: ctx.ref() };
    },
    view(ctx, local) {
      return html`<button ${local.button} @click=${() => ctx.emit('selected', ctx.props.startValue, { cancelable: true })}>${() => ctx.props.startValue}</button>`;
    },
  });
  const element = document.createElement('test-counter');
  element.setAttribute('start-value', '3'); document.body.append(element);
  assert.equal(element.shadowRoot, null);
  const button = element.querySelector('button');
  assert.equal(button.textContent, '3');
  element.setAttribute('start-value', '5'); await tick();
  assert.equal(button.textContent, '5');
  let emitted;
  element.addEventListener('selected', event => emitted = event);
  button.click(); assert.equal(emitted.detail, 5); assert.ok(emitted.composed && emitted.cancelable);
  outside(2); assert.equal(cleanup, 1);
  element.remove(); await tick();
  assert.equal(disconnected, 1); assert.equal(cleanup, 2); assert.ok(element.state.disposed);
  button.click(); assert.equal(cleanup, 2);
  document.body.append(element); await tick();
  assert.equal(setups, 2); assert.equal(connected, 2);
  element.remove(); await tick(); assert.equal(disconnected, 2);
});

test('custom element moves within keyed lists retain runtime identity', async () => {
  let constructions = 0, destroyed = 0;
  define.light('test-row', ctx => {
    constructions++; ctx.onDestroy(() => destroyed++);
    return html`<input>`;
  });
  const rows = signal([1, 2]);
  render(html`${each(rows, row => row, item => html`<test-row data-id=${item}></test-row>`)}`);
  const first = app().querySelector('test-row');
  rows([2, 1]); await tick();
  assert.equal([...app().querySelectorAll('test-row')][1], first);
  assert.equal(constructions, 2); assert.equal(destroyed, 0);
  rows([2]); await tick(); assert.equal(destroyed, 1);
});

test('define defaults to light DOM and reserves shadow DOM for explicit opt-in', () => {
  define('test-default', () => html`default`);
  define.shadow('test-shadow', () => html`shadow`);
  define.light('test-light', () => html`light`);
  for (const name of ['test-default', 'test-shadow', 'test-light']) document.body.append(document.createElement(name));
  assert.equal(document.querySelector('test-default').shadowRoot, null);
  assert.equal(document.querySelector('test-default').textContent, 'default');
  assert.ok(document.querySelector('test-shadow').shadowRoot);
  assert.equal(document.querySelector('test-light').textContent, 'light');
  assert.equal(define('test-light', () => html`ignored`), customElements.get('test-light'));
  assert.throws(() => define('invalid', () => html`bad`));
});

test('models use owner state, retain owned alias and explicitly release shared resources', () => {
  const state = createStateContainer();
  const source = signal(1);
  let ownedCleanup = 0, sharedCleanup = 0;
  const factory = model(s => { s.effect(() => { source(); return () => ownedCleanup++; }); return { count: s.signal(1) }; });
  const instance = factory(state);
  assert.equal(instance.count(), 1);
  state.dispose(); assert.equal(ownedCleanup, 1);
  const ownedState = createStateContainer();
  model.owned(() => ({ dispose: () => ownedCleanup++ }))({ state: ownedState });
  ownedState.dispose(); assert.equal(ownedCleanup, 2);
  const shared = model.shared('test', s => { s.own(() => sharedCleanup++); return {}; });
  assert.equal(shared(), shared());
  const old = shared(); model.disposeShared('test');
  assert.equal(sharedCleanup, 1); assert.notEqual(shared(), old);
  model.disposeShared('test');
  assert.throws(() => model(null), /function/);
});

test('construction diagnostics are opt-in and ignore intentional peek/effect reads', () => {
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => warnings.push(args);
  try {
    configure({ diagnostics: true });
    assert.equal(getConfig().diagnostics, true);
    const value = signal(1);
    define.light('test-warning', ctx => {
      value(); peek(value); ctx.effect(() => value());
      return html`ok`;
    });
    document.body.append(document.createElement('test-warning'));
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0][1].count, 1);
    define.light('test-peek', () => html`${peek(value)}`);
    document.body.append(document.createElement('test-peek'));
    assert.equal(warnings.length, 1);
  } finally { console.warn = original; }
});

test('changing each specs rebinds view closures and source dependencies without replacing row nodes', () => {
  const first = signal([{ id: 1, text: 'one' }]);
  const second = signal([{ id: 1, text: 'two' }]);
  const row = (item, prefix) => html`<p>${prefix}:${() => item().text}</p>`;
  const view = (items, prefix) => html`${each(items, item => item.id, item => row(item, prefix))}`;
  const handle = render(view(first, 'A'));
  const p = app().querySelector('p');
  handle.update(view(second, 'B'));
  assert.equal(app().querySelector('p'), p);
  assert.equal(p.textContent, 'B:two');
  first([{ id: 1, text: 'stale' }]);
  assert.equal(p.textContent, 'B:two');
  second([{ id: 1, text: 'fresh' }]);
  assert.equal(p.textContent, 'B:fresh');
});

test('node expressions handle iterables, nested arrays, DOM nodes and structural mode transitions', () => {
  const element = document.createElement('strong'); element.textContent = 'node';
  const value = signal(element);
  render(html`${value}`);
  assert.equal(app().querySelector('strong'), element);
  value('text'); value(element);
  assert.equal(app().querySelector('strong'), element);
  value(new Set(['a', ['b', null, false]]));
  assert.equal(app().textContent, 'ab');
  value(when(true, () => ['c', html`<i>d</i>`]));
  assert.equal(app().textContent, 'cd');
  value({ unsupported: true }); assert.equal(app().textContent, '');
  value(0); assert.equal(app().textContent, '0');
});

test('positional arrays update templates in place and repeated branch toggles release child scopes', () => {
  const view = text => html`<input .value=${text}>`;
  const value = signal([view('first')]);
  render(html`${value}`);
  const input = app().querySelector('input');
  value([view('second')]);
  assert.equal(app().querySelector('input'), input);
  assert.equal(input.value, 'second');
  value([]); assert.ok(!input.isConnected);
});

test('boolean attributes and camelCase properties work alongside ordinary attribute removal', () => {
  const value = signal(true), name = signal('value');
  render(html`<div hidden=${value} data-name=${name} .customProperty=${value}></div>`);
  const div = app().querySelector('div');
  assert.equal(div.getAttribute('hidden'), '');
  assert.equal(div.customProperty, true);
  value(false); name(null);
  assert.ok(!div.hasAttribute('hidden') && !div.hasAttribute('data-name'));
  assert.equal(div.customProperty, false);
});

test('event handlers can be signals or listener objects and are removed when cleared', () => {
  let calls = 0;
  const handler = signal(() => calls++);
  render(html`<button @click=${handler}>click</button>`);
  const button = app().querySelector('button');
  button.click(); assert.equal(calls, 1);
  handler({ handleEvent() { calls += 2; } });
  button.click(); assert.equal(calls, 3);
  handler(null); button.click(); assert.equal(calls, 3);
});

test('failed mounting releases already-wired listeners and refs', () => {
  const reference = ref();
  assert.throws(() => render(html`<button ${reference}>ok</button><p ${'invalid ref'}></p>`), /ref/);
  assert.equal(reference.current, null);
  assert.equal(app().textContent, '');
});

test('static refs and SVG templates in keyed arrays retain namespaces and clear on removal', () => {
  const reference = ref();
  const view = (key, x) => svg`<circle key=${key} ${reference} cx=${x}></circle>`;
  const items = signal([view('circle', 1)]);
  render(html`<svg>${items}</svg>`);
  const circle = reference.current;
  items([view('circle', 2)]);
  assert.equal(reference.current, circle);
  assert.equal(circle.getAttribute('cx'), '2');
  items([]); assert.equal(reference.current, null);
});

test('disposing unused computed values does not evaluate them or create resources late', () => {
  let calls = 0;
  const state = createStateContainer();
  const unused = state.computed(() => ++calls);
  state.dispose();
  assert.equal(calls, 0);
  assert.equal(unused(), undefined);
  state.computed(() => ++calls);
  assert.equal(calls, 0);
});

test('props accept numeric forms, booleans, JSON and both attribute-name aliases', () => {
  define.light('test-props', ctx => html`<p>${() => JSON.stringify(ctx.props)}</p>`);
  const element = document.createElement('test-props');
  element.setAttribute('start-value', '03'); element.setAttribute('enabled', '');
  element.setAttribute('items', '[1,2]'); document.body.append(element);
  const props = element.ctx.props;
  assert.equal(props.startValue, 3); assert.equal(props['start-value'], 3);
  assert.equal(props.enabled, true); assert.deepEqual(props.items, [1, 2]);
});

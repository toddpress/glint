import { define, html, mount } from '../../src/index.js';
import { createDemoLoop, createPedalAudio } from './audio.js';

const initialPedals = [
  { id: 'compressor', name: 'Compressor', label: 'Threshold', min: -50, max: 0, step: 1, value: -24, enabled: true },
  { id: 'drive', name: 'Overdrive', label: 'Drive', min: 0, max: 1, step: 0.01, value: 0.55, enabled: true },
  { id: 'cabinet', name: 'Cabinet IR', enabled: true },
  { id: 'delay', name: 'Delay', label: 'Mix', min: 0, max: 1, step: 0.01, value: 0.2, enabled: true },
];

define('glint-pedalboard', ({ state, effect, onDestroy }) => {
  const pedals = state.signal(initialPedals);
  const active = state.signal('');
  const playingDemo = state.computed(() => String(active() === 'demo'));
  const playingGuitar = state.computed(() => String(active() === 'guitar'));
  const status = state.signal('');
  const irName = state.signal('');
  const level = state.signal(0.2);
  const positionStatus = state.signal('');
  let context;
  let audio;
  let source;
  let stream;
  let draggedId;
  let sourceRequest = 0;
  let irRequest = 0;
  const guitarDeviceId = state.signal('');

  const prepareAudio = async () => {
    if (!context) {
      const next = new AudioContext();
      try {
        const engine = createPedalAudio(next);
        engine.setChain(pedals());
        engine.setLevel(level());
        context = next;
        audio = engine;
      } catch (error) {
        await next.close();
        throw error;
      }
    }
    if (context.state !== 'running') await context.resume();
  };

  effect(() => {
    const chain = pedals();
    if (audio) audio.setChain(chain);
  });

  effect(() => {
    const volume = level();
    if (audio) audio.setLevel(volume);
  });

  const releaseInput = () => {
    if (source) {
      source.stop?.();
      source.disconnect();
      source = undefined;
    }
    stream?.getTracks().forEach((track) => track.stop());
    stream = undefined;
  };

  const stop = () => {
    sourceRequest++;
    releaseInput();
    active('');
    status('Stopped');
  };

  const play = async (kind, file) => {
    const request = ++sourceRequest;
    releaseInput();
    active('');
    status(kind === 'guitar' ? 'Waiting for audio input…' : 'Loading audio…');

    try {
      await prepareAudio();
      if (request !== sourceRequest) return;
      if (kind === 'guitar') {
        const captured = await navigator.mediaDevices.getUserMedia({ audio: {
          deviceId: guitarDeviceId() ? { exact: guitarDeviceId() } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } });
        if (request !== sourceRequest) {
          captured.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = captured;
        source = context.createMediaStreamSource(stream);
      } else if (kind === 'file') {
        const buffer = await context.decodeAudioData(await file.arrayBuffer());
        if (request !== sourceRequest) return;
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
      } else {
        source = createDemoLoop(context);
      }

      source.connect(audio.input);
      source.start?.();
      active(kind);
      status({ demo: 'Playing demo loop', file: `Looping ${file?.name}`, guitar: 'Monitoring guitar input' }[kind]);
    } catch (error) {
      if (request !== sourceRequest) return;
      releaseInput();
      status(`Audio unavailable. ${error.message}`);
    }
  };

  const devices = state.signal([]);
  const listInputs = async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      devices(all.filter(({ kind, deviceId }) => kind === 'audioinput' && deviceId && deviceId !== 'default'));
    } catch {
      // The default input is still available through the permission prompt.
    }
  };

  const readFile = (event, useFile) => {
    const [file] = event.currentTarget.files;
    event.currentTarget.value = '';
    if (file) useFile(file);
  };

  const loadIR = async (file) => {
    const request = ++irRequest;
    status(`Loading IR ${file.name}…`);
    try {
      await prepareAudio();
      if (request !== irRequest) return;
      const buffer = await audio.decodeIR(file);
      if (request !== irRequest) return;
      audio.setIR(buffer);
      audio.setChain(pedals());
      irName(file.name);
      status(`Loaded cabinet IR ${file.name}`);
    } catch (error) {
      if (request === irRequest) status(`IR unavailable. ${error.message}`);
    }
  };

  onDestroy(() => {
    sourceRequest++;
    irRequest++;
    releaseInput();
    context?.close();
    context = undefined;
    audio = undefined;
  });

  const updatePedal = (id, changes) => {
    pedals(pedals().map((pedal) => pedal.id === id ? { ...pedal, ...changes } : pedal));
  };

  const move = (id, index) => {
    const chain = pedals();
    const from = chain.findIndex((pedal) => pedal.id === id);
    if (from < 0 || from === index || index < 0 || index >= chain.length) return;
    const next = [...chain];
    const [pedal] = next.splice(from, 1);
    next.splice(index, 0, pedal);
    pedals(next);
    positionStatus(`${pedal.name} moved to position ${index + 1} of ${next.length}.`);
  };

  const renderPedal = (pedal, index, chain) => html`
    <li key=${pedal.id} class="pedal pedal--${pedal.id}"
      ondragover=${(event) => {
        if (!draggedId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drop-target');
      }}
      ondragleave=${(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.classList.remove('drop-target');
      }}
      ondrop=${(event) => {
        if (!draggedId) return;
        event.preventDefault();
        event.currentTarget.classList.remove('drop-target');
        const id = draggedId;
        draggedId = undefined;
        move(id, index);
      }}>
      <div class="pedal-top">
        <span class="drag-handle" draggable="true" title="Drag to reorder ${pedal.name}"
          ondragstart=${(event) => {
            draggedId = pedal.id;
            event.dataTransfer.setData('text/plain', pedal.id);
            event.dataTransfer.effectAllowed = 'move';
          }}
          ondragend=${() => { draggedId = undefined; }}>⠿</span>
        <div class="move-buttons">
          <button type="button" aria-label="Move ${pedal.name} earlier" aria-disabled=${String(index === 0)}
            onclick=${() => move(pedal.id, index - 1)}>←</button>
          <button type="button" aria-label="Move ${pedal.name} later" aria-disabled=${String(index === chain.length - 1)}
            onclick=${() => move(pedal.id, index + 1)}>→</button>
        </div>
      </div>
      <h2>${pedal.name}</h2>
      <div class="pedal-control">
        <div hidden=${pedal.id !== 'cabinet'}>
          <label class="file-button">Load IR <input type="file" accept=".wav,.aif,.aiff,.flac,audio/*"
            onchange=${(event) => readFile(event, loadIR)}></label>
          <span class="file-name">${() => irName() || 'No IR loaded · dry signal'}</span>
        </div>
        <label hidden=${pedal.id === 'cabinet'}>${pedal.label} <output>${pedal.value}</output>
          <input type="range" min=${pedal.min} max=${pedal.max} step=${pedal.step} :value=${pedal.value ?? 0}
            oninput=${(event) => updatePedal(pedal.id, { value: event.currentTarget.valueAsNumber })}>
        </label>
      </div>
      <button class="footswitch" type="button" aria-label="Enable ${pedal.name}"
        aria-pressed=${String(pedal.enabled)}
        onclick=${() => updatePedal(pedal.id, { enabled: !pedal.enabled })}>
        <span class="led" aria-hidden="true"></span>
        ${pedal.enabled ? 'On' : 'Bypassed'}
      </button>
    </li>
  `;

  return html`
    <section class="transport" aria-label="Audio controls">
      <div class="sources">
        <button type="button" class="primary" aria-pressed=${playingDemo}
          onclick=${() => play('demo')}>Play demo</button>
        <label class="file-button">Loop audio file <input type="file" accept="audio/*"
          onchange=${(event) => readFile(event, (file) => play('file', file))}></label>
        <button type="button" aria-pressed=${playingGuitar}
          onclick=${async () => { await play('guitar'); await listInputs(); }}>Guitar input</button>
        <button type="button" onclick=${stop}>Stop</button>
      </div>
      <div class="settings">
        <label>Input device
          <select onfocus=${listInputs} onchange=${(event) => guitarDeviceId(event.currentTarget.value)}>
            <option value="">System default</option>
            ${() => devices().map(({ deviceId, label }, index) =>
              html`<option key=${deviceId} value=${deviceId} :selected=${guitarDeviceId() === deviceId}>${label || `Input ${index + 1}`}</option>`)}
          </select>
        </label>
        <label class="volume">Output <input type="range" min="0" max="1" step="0.01" :value=${level}
          oninput=${(event) => level(event.currentTarget.valueAsNumber)}></label>
      </div>
      <p class="status" role="status">${status}</p>
    </section>
    <div class="chain-label"><span>Input</span><span>Signal chain</span><span>Output</span></div>
    <ol class="pedals" aria-label="Effect order">${() => pedals().map(renderPedal)}</ol>
    <p class="sr-only" role="status">${positionStatus}</p>
  `;
}, { useShadow: false });

mount('#app', html`<glint-pedalboard></glint-pedalboard>`);

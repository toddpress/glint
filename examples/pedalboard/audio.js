import Tuna from 'tunajs';

export function createPedalAudio(context) {
  const tuna = new Tuna(context);
  const input = context.createGain();
  const output = context.createGain();
  const cabinet = context.createConvolver();
  const effects = {
    compressor: new tuna.Compressor({
      threshold: -24, ratio: 4, attack: 10, release: 120, automakeup: false,
    }),
    drive: new tuna.Overdrive({
      drive: 0.45, curveAmount: 0.55, outputGain: -9, algorithmIndex: 0,
    }),
    cabinet,
    delay: new tuna.Delay({ delayTime: 290, feedback: 0.28, wetLevel: 0.2, dryLevel: 1 }),
  };
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -12;
  limiter.ratio.value = 20;
  output.connect(limiter);
  limiter.connect(context.destination);
  output.gain.value = 0.2;

  let route;
  const controls = new Map();

  return {
    input,
    setLevel(value) {
      output.gain.setTargetAtTime(value, context.currentTime, 0.015);
    },
    setChain(pedals) {
      for (const { id, value } of pedals) {
        if (controls.get(id) === value) continue;
        controls.set(id, value);
        if (id === 'compressor') effects.compressor.threshold = value;
        if (id === 'drive') effects.drive.curveAmount = value;
        if (id === 'delay') effects.delay.wetLevel = value;
      }

      const enabled = pedals.filter(({ id, enabled }) => enabled && (id !== 'cabinet' || cabinet.buffer));
      const nextRoute = enabled.map(({ id }) => id).join(',');
      if (nextRoute === route) return;
      route = nextRoute;

      input.disconnect();
      for (const effect of Object.values(effects)) (effect.output ?? effect).disconnect();

      let tail = input;
      for (const { id } of enabled) {
        const effect = effects[id];
        tail.connect(effect.input ?? effect);
        tail = effect.output ?? effect;
      }

      tail.connect(output);
    },
    async decodeIR(file) {
      const buffer = await context.decodeAudioData(await file.arrayBuffer());
      if (![1, 2, 4].includes(buffer.numberOfChannels)) {
        throw new Error('Choose an IR with 1, 2, or 4 channels.');
      }
      return buffer;
    },
    setIR(buffer) {
      cabinet.buffer = buffer;
    },
  };
}

export function createDemoLoop(context) {
  const beat = 0.36;
  const notes = [40, 47, 52, 55, 40, 50, 55, 59, 43, 50, 55, 59, 38, 45, 50, 54];
  const buffer = context.createBuffer(
    1, Math.round(context.sampleRate * beat * notes.length), context.sampleRate,
  );
  const data = buffer.getChannelData(0);

  notes.forEach((note, index) => {
    const frequency = 440 * 2 ** ((note - 69) / 12);
    const start = Math.round(index * beat * context.sampleRate);
    const end = Math.min(data.length, start + Math.round(beat * context.sampleRate));
    for (let sample = start; sample < end; sample++) {
      const time = (sample - start) / context.sampleRate;
      const phase = time * frequency * 2 * Math.PI;
      const envelope = Math.min(time / 0.008, 1) * Math.exp(-time * 11);
      data[sample] = 0.55 * envelope * (
        Math.sin(phase) + 0.38 * Math.sin(2 * phase) + 0.18 * Math.sin(3 * phase)
      );
    }
  });

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

/* Browser-local persistence and audio scheduled outside the canvas frame loop. */
(() => {
  'use strict';
  const key = 'steadystate.still.v1';
  let context;
  let chime;
  let pending;
  let alarmKey = '';
  const scheduled = new Set();
  let fullscreenError = '';

  function isFullscreen() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function toggleFullscreen() {
    fullscreenError = '';
    const entering = !isFullscreen();
    const target = entering ? document.documentElement : document;
    const action = entering
      ? target.requestFullscreen || target.webkitRequestFullscreen
      : target.exitFullscreen || target.webkitExitFullscreen;
    if (!action) return false;
    try {
      // Invoke inside the button's user gesture; a deferred request can be denied.
      const result = action.call(target);
      if (result?.catch) result.catch(() => { fullscreenError = 'Could not change fullscreen. Use your browser’s fullscreen option.'; });
      return true;
    } catch {
      return false;
    }
  }

  // Keep Escape working even if the canvas loses keyboard focus in fullscreen.
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isFullscreen()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleFullscreen();
    }
  }, { capture: true });

  function audio() {
    if (!context) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return null;
      context = new Audio();
      chime = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const samples = chime.getChannelData(0);
      for (let i = 0; i < samples.length; i++) {
        const t = i / context.sampleRate;
        for (const [frequency, offset] of [[523.25, 0], [659.25, .22], [783.99, .44]]) {
          const age = t - offset;
          if (age >= 0) samples[i] += Math.sin(Math.PI * 2 * frequency * age) * Math.min(age / .012, 1) * Math.exp(-age * 3.2) * .19;
        }
      }
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function play(volume, delay = 0) {
    const ctx = audio();
    if (!ctx) return null;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = chime;
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start(ctx.currentTime + Math.max(0, delay));
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    return source;
  }

  function schedule(state) {
    const nextKey = state.running && state.sound && state.volume > 0
      ? `${state.deadline}:${state.volume}` : '';
    if (nextKey === alarmKey) return;
    if (pending && pending.deadline > Date.now() / 1000) {
      pending.source.stop();
      scheduled.delete(pending.deadline);
    }
    pending = null;
    alarmKey = nextKey;
    if (!nextKey || state.deadline <= Date.now() / 1000) return;
    const source = play(state.volume, state.deadline - Date.now() / 1000);
    if (source) {
      pending = { source, deadline: state.deadline };
      scheduled.add(state.deadline);
      // Only recent completion IDs are needed to prevent a duplicate chime.
      if (scheduled.size > 24) scheduled.delete(scheduled.values().next().value);
    }
  }

  // Resume audio after the first user gesture, including a restored active timer.
  for (const type of ['pointerdown', 'keydown']) {
    window.addEventListener(type, () => {
      if (context?.state === 'suspended') context.resume().catch(() => {});
    }, { capture: true });
  }

  window.StillBrowser = {
    save(json) {
      try { localStorage.setItem(key, json); return true; }
      catch { return false; }
    },
    load() {
      try { return localStorage.getItem(key); }
      catch { return null; }
    },
    schedule,
    preview(volume) { play(volume); },
    alarmWasScheduled(deadline) { return scheduled.has(deadline); },
    isFullscreen,
    toggleFullscreen,
    takeFullscreenError() {
      const error = fullscreenError;
      fullscreenError = '';
      return error;
    },
  };
})();

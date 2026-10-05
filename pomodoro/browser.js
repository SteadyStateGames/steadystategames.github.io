/* Browser-local persistence and audio scheduled outside the canvas frame loop. */
(() => {
  'use strict';
  const key = 'steadystate.still.v1';
  let context;
  const chimes = [];
  let music;
  let musicGain;
  let musicPath = '';
  let musicWanted = false;
  let musicError = '';
  let musicRequest = 0;
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
      const notes = [
        [[523.25, 0], [659.25, .22], [783.99, .44]],
        [[261.63, 0], [392, .32]],
        [[659.25, 0], [880, .14], [987.77, .28], [1318.51, .42]],
      ];
      for (let variant = 0; variant < 3; variant++) {
        const buffer = context.createBuffer(1, context.sampleRate * 2.5, context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) {
          const t = i / context.sampleRate;
          for (const [frequency, offset] of notes[variant]) {
            const age = t - offset;
            if (age < 0) continue;
            const envelope = Math.min(age / .012, 1) * Math.exp(-age * [3.2, 2.5, 4][variant]);
            let tone = Math.sin(Math.PI * 2 * frequency * age) * [.19, .16, .14][variant];
            if (variant === 1) tone += Math.sin(Math.PI * 2 * frequency * 2.76 * age) * .045 + Math.sin(Math.PI * 2 * frequency * 4.05 * age) * .02;
            samples[i] += tone * envelope;
          }
        }
        chimes.push(buffer);
      }
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function play(volume, delay = 0, variant = 0) {
    const ctx = audio();
    if (!ctx) return null;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = chimes[Math.max(0, Math.min(2, variant | 0))];
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start(ctx.currentTime + Math.max(0, delay));
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    return source;
  }

  function schedule(state) {
    const nextKey = state.running && !state.stopwatch && state.sound && state.volume > 0
      ? `${state.deadline}:${state.volume}:${state.chime_variant || 0}` : '';
    if (nextKey === alarmKey) return;
    if (pending && pending.deadline > Date.now() / 1000) {
      pending.source.stop();
      scheduled.delete(pending.deadline);
    }
    pending = null;
    alarmKey = nextKey;
    if (!nextKey || state.deadline <= Date.now() / 1000) return;
    const source = play(state.volume, state.deadline - Date.now() / 1000, state.chime_variant);
    if (source) {
      pending = { source, deadline: state.deadline };
      scheduled.add(state.deadline);
      // Only recent completion IDs are needed to prevent a duplicate chime.
      if (scheduled.size > 24) scheduled.delete(scheduled.values().next().value);
    }
  }

  async function syncMusic(state) {
    musicWanted = Boolean(state.playing);
    if (!music) {
      music = new Audio();
      music.loop = true;
      music.preload = 'none';
      music.addEventListener('error', () => { musicError = 'Could not load this song. Try another background.'; });
    }
    music.loop = state.loop !== false;
    if (musicPath !== state.path) {
      music.pause();
      musicPath = state.path;
      music.removeAttribute('src');
      musicError = '';
      ++musicRequest;
    }
    if (!music.hasAttribute('src') && musicWanted) {
      const request = ++musicRequest;
      try {
        const source = musicPath.startsWith('custom:')
          ? await window.StillLibrary.resolveTrack(musicPath.slice(7))
          : new URL(musicPath, document.baseURI).href;
        if (request !== musicRequest || !musicWanted) return;
        music.src = source;
      } catch (error) {
        if (request === musicRequest) musicError = error.message;
        return;
      }
    }
    if (musicGain) musicGain.gain.value = state.muted ? 0 : Math.max(0, Math.min(1, state.volume));
    if (!musicWanted) { music.pause(); return; }
    const ctx = audio();
    if (!ctx) { musicError = 'This browser could not play music.'; return; }
    if (!musicGain) {
      musicGain = ctx.createGain();
      ctx.createMediaElementSource(music).connect(musicGain).connect(ctx.destination);
    }
    musicGain.gain.value = state.muted ? 0 : Math.max(0, Math.min(1, state.volume));
    if (music.paused) {
      if (music.ended) music.currentTime = 0;
      const requestedPath = musicPath;
      music.play().catch(error => {
        if (requestedPath !== musicPath || !musicWanted || error.name === 'AbortError') return;
        musicError = error.name === 'NotAllowedError' ? 'Press Play to start the music.' : 'Could not play this song. Try another background.';
      });
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
    preview(volume, variant = 0) { play(volume, 0, variant); },
    syncMusic,
    musicStatus() {
      return JSON.stringify({ playing: Boolean(music && !music.paused), path: musicPath,
        volume: musicGain?.gain.value || 0, currentTime: music?.currentTime || 0, loop: music?.loop || false,
        ended: music?.ended || false });
    },
    takeMusicError() { const error = musicError; musicError = ''; return error; },
    isMusicEnded() { return Number(Boolean(musicWanted && music?.hasAttribute('src') && !music.loop && music.ended)); },
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

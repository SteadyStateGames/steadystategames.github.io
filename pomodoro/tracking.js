/* The optional extension sends category transitions, never browsing URLs. */
(() => {
  let events = [], connected = false, active = false, seen = 0;
  window.addEventListener('message', event => {
    const data = event.data;
    if (event.source !== window || event.origin !== location.origin || data?.type !== 'pomodoro-distraction') return;
    if (typeof data.active !== 'boolean' || !Array.isArray(data.events)) return;
    connected = true; seen = Date.now(); active = data.active;
    for (const transition of data.events) {
      if (typeof transition.active !== 'boolean' || !Number.isFinite(transition.at)) continue;
      if (transition.at > Date.now() / 1000 + 2) continue;
      events.push({ active: transition.active, at: transition.at });
    }
    events.sort((a, b) => a.at - b.at);
  });
  window.StillTracking = {
    download() {
      const link = document.createElement('a');
      link.href = new URL('pomodoro-tracking-helper.zip', document.baseURI).href;
      link.download = 'pomodoro-tracking-helper.zip';
      document.body.append(link); link.click(); link.remove();
    },
    poll() {
      const result = { connected: connected && Date.now() - seen < 75000, active, events };
      events = [];
      return JSON.stringify(result);
    },
  };
})();

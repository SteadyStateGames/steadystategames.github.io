// Opt-in, silent QA instrumentation. Normal players never see this panel.
(() => {
  const query = new URLSearchParams(location.search);
  if (query.get('qa_silent') !== '1' || query.get('qa_turn') !== '1') return;
  const Original = window.RTCPeerConnection;
  const peers = new Set();
  let created = 0;
  window.RTCPeerConnection = class extends Original {
    createDataChannel(...args) {
      const channel = super.createDataChannel(...args);
      // Godot also creates capability probes with no data channel.
      if (!peers.has(this)) { peers.add(this); created++; }
      return channel;
    }
  };
  const boot = () => {
    const panel = document.createElement('output');
    panel.id = 'rtc-qa-status';
    panel.style.cssText = 'position:fixed;bottom:0;right:0;z-index:9999;padding:3px 6px;background:#fff6dc;color:#183c2c;font:12px monospace;pointer-events:none';
    document.body.appendChild(panel);
    let busy = false;
    setInterval(async () => {
      if (busy) return;
      busy = true;
      let relay = 0, direct = 0, pending = 0;
      try {
        for (const peer of peers) {
          if (peer.connectionState === 'closed') { peers.delete(peer); continue; }
          if (peer.connectionState !== 'connected') { pending++; continue; }
          const reports = await peer.getStats();
          let selected;
          reports.forEach(report => {
            if (report.type === 'transport' && report.selectedCandidatePairId) selected = reports.get(report.selectedCandidatePairId);
          });
          if (!selected) reports.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.nominated) selected = report;
          });
          const local = selected && reports.get(selected.localCandidateId);
          const remote = selected && reports.get(selected.remoteCandidateId);
          if (local?.candidateType === 'relay' || remote?.candidateType === 'relay') relay++;
          else if (selected) direct++;
          else pending++;
        }
        panel.textContent = `QA network: relay ${relay} · direct ${direct} · pending ${pending} · links ${created}`;
      } catch { panel.textContent = 'QA network: statistics unavailable'; }
      finally { busy = false; }
    }, 1000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();

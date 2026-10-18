// CSS pixels define layout and input; backing pixels only define sharpness.
(() => {
  'use strict';
  let limit = 0;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  const api = window.LAND_VIEWPORT = { width: 1280, height: 720, insets: [0, 0, 0, 0], revision: 0,
    configure(value) { limit = Number(value) || 0; resize(); } };
  function resize() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    if (!probe.isConnected) document.body.append(probe);
    const vv = window.visualViewport;
    // Pinch magnification belongs to the browser, not to the game's resolution.
    const useVisual = vv && Math.abs(vv.scale - 1) < 0.01;
    const w = Math.max(1, Math.round(useVisual ? vv.width : innerWidth));
    const h = Math.max(1, Math.round(useVisual ? vv.height : innerHeight));
    const qaDpr = window.LAND_QA_SILENT === true ? Number(new URLSearchParams(location.search).get('qa_dpr')) : 0;
    let ratio = [1, 2, 3].includes(qaDpr) ? qaDpr : (window.devicePixelRatio || 1);
    if (limit) ratio = Math.min(ratio, limit / Math.max(w, h));
    const bw = Math.max(1, Math.round(w * ratio)), bh = Math.max(1, Math.round(h * ratio));
    canvas.style.position = 'fixed';
    canvas.style.left = `${useVisual ? vv.offsetLeft : 0}px`;
    canvas.style.top = `${useVisual ? vv.offsetTop : 0}px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (canvas.width !== bw) canvas.width = bw;
    if (canvas.height !== bh) canvas.height = bh;
    const css = getComputedStyle(probe);
    const insets = [css.paddingLeft, css.paddingTop, css.paddingRight, css.paddingBottom].map(v => parseFloat(v) || 0);
    if (api.width !== w || api.height !== h || String(api.insets) !== String(insets)) {
      api.width = w; api.height = h; api.insets = insets; api.revision++;
    }
  }
  function settle() {
    resize();
    // Safari can publish an intermediate size while rotating or restoring a PWA.
    [60, 180, 400, 800].forEach(ms => setTimeout(resize, ms));
  }
  addEventListener('DOMContentLoaded', () => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta && !meta.content.includes('viewport-fit')) meta.content += ', viewport-fit=cover';
    new ResizeObserver(resize).observe(document.documentElement);
    settle();
  });
  ['resize', 'orientationchange', 'pageshow', 'focus'].forEach(e => addEventListener(e, settle));
  document.addEventListener('visibilitychange', settle);
  document.addEventListener('fullscreenchange', settle);
  window.visualViewport?.addEventListener('resize', settle);
  window.visualViewport?.addEventListener('scroll', resize);
})();

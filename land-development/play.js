// This is the project's own Web export, hosted on the studio website.
const GAME_URL = './game/index.html?v=20261018r2';
const launcher = document.querySelector('#launcher');
const surface = document.querySelector('#game');
const play = document.querySelector('#play');

play.addEventListener('click', () => {
  if (surface.querySelector('iframe')) return;
  const url = new URL(GAME_URL, location.href);
  const query = new URLSearchParams(location.search);
  // Preserve explicitly opted-in silent QA without changing player audio.
  if (query.get('qa_silent') === '1') {
    url.searchParams.set('qa_silent', '1');
    if (query.get('qa_turn') === '1') url.searchParams.set('qa_turn', '1');
  }
  const frame = document.createElement('iframe');
  frame.title = 'Land Development';
  frame.allow = 'autoplay; fullscreen; gamepad';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.src = url.href;
  surface.append(frame);
  surface.hidden = false;
  launcher.hidden = true;
  frame.focus();
  // Unsupported or declined fullscreen still fills the available viewport.
  if (surface.requestFullscreen) surface.requestFullscreen().catch(() => {});
});

// A child iframe cannot see Safari's top-level visual viewport (keyboard,
// browser chrome and rotation). Size its surface here, in the parent document.
function fitGame() {
  const vv = window.visualViewport;
  const visual = vv && Math.abs(vv.scale - 1) < 0.01;
  surface.style.inset = 'auto';
  surface.style.left = `${visual ? vv.offsetLeft : 0}px`;
  surface.style.top = `${visual ? vv.offsetTop : 0}px`;
  surface.style.width = `${Math.round(visual ? vv.width : innerWidth)}px`;
  surface.style.height = `${Math.round(visual ? vv.height : innerHeight)}px`;
}
function settleGame() {
  fitGame();
  [60, 180, 400, 800].forEach(ms => setTimeout(fitGame, ms));
}
['resize', 'orientationchange', 'pageshow'].forEach(e => addEventListener(e, settleGame));
visualViewport?.addEventListener('resize', settleGame);
visualViewport?.addEventListener('scroll', fitGame);
settleGame();

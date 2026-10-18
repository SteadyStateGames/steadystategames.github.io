// This is the project's own Web export, hosted on the studio website.
const GAME_URL = './game/index.html';
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

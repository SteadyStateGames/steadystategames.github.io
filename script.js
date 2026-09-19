const search = document.querySelector('#search');
const cards = [...document.querySelectorAll('.game-card')];
const count = document.querySelector('#count');
const status = document.querySelector('#search-status');
const emptyState = document.querySelector('#empty-state');

function filterGames() {
  const query = search.value.trim().toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  let visible = 0;
  for (const card of cards) {
    const text = `${card.dataset.search} ${card.querySelector('h2').textContent}`.toLocaleLowerCase();
    card.hidden = !query.split(/\s+/).every(word => text.includes(word));
    if (!card.hidden) visible++;
  }
  count.textContent = String(visible).padStart(2, '0');
  emptyState.hidden = visible !== 0;
  status.textContent = `${visible} ${visible === 1 ? 'game' : 'games'} found.`;
}

document.querySelector('.search').hidden = false;
document.querySelector('#year').textContent = new Date().getFullYear();
search.addEventListener('input', filterGames);
document.querySelector('#reset-search').addEventListener('click', () => {
  search.value = '';
  filterGames();
  search.focus();
});
// Reconcile a search restored by the browser when navigating back from a game.
window.addEventListener('pageshow', filterGames);

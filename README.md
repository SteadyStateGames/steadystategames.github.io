# Steady State Games

The static game library at https://steadystategames.dev/, hosted on GitHub Pages.

## Preview locally

Run `python -m http.server 4173 --bind 127.0.0.1` in this folder, then open http://127.0.0.1:4173/.
No dependencies or build step are required. Game links go to the deployed games.

## Add or update a game

The catalog is in `index.html`. Duplicate a `.game-card`, update its title, description,
`data-search` keywords, artwork, and links. Use a full verified browser-game URL and
the game's own itch.io URL when available. Update the starting collection count.
Search derives its entries from the cards. The catalog and links work without JavaScript.

Artwork comes from the studio's published game icons and itch.io covers, stored locally
in `assets/`. Styling lives in `styles.css`; optional search is in `script.js`.

## Hosting

Keep `CNAME` set to `steadystategames.dev`. The individual games deploy through their
own repositories; the homepage links to those existing URLs without duplicating builds.
There is no root service worker to interfere with the games' own caches.

Verified catalog (September 19, 2026):

| Game | Browser | itch.io |
| --- | --- | --- |
| Barrage Blockade | https://steadystategames.dev/Barrage-Blockade/ | Not listed on the public profile |
| Solitaire | https://steadystategames.dev/SolitaireForMyBeautifulWife/ | https://steadystategames.itch.io/soliatire |
| Stephanie's Colorful Crafting | https://steadystategames.dev/Stephanie-s-Colorful-Crafting/ | https://steadystategames.itch.io/stephanie-colorful-crafting |

The `10kFonts` repository is a font collection, so it is not included in the game catalog.

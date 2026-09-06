# My Song Builder — V1 Fresh Build

## GitHub Pages setup

Upload **the files themselves** to the root of your repository. The repository root should show:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `sw.js`
- `icon-192.png`
- `icon-512.png`
- `README.md`

Do **not** rename `index.html` to `index`, `styles.css` to `styles`, or `sw.js` to `sw`.

Then in GitHub:

1. Repository → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/(root)**
5. Save

Your page should then be available at:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/`

## V1 features

- 4–8 strings
- Guitar, bass, or custom
- Common tuning presets and editable custom tuning
- Fret input low → high using `X`, `0`, `1`, `2`, etc.
- Automatic sounding-note calculation
- Automatic chord-name estimation
- Starter chord-shape library plus automatic learning by tuning
- Sections with letter, optional name, and notes
- Label preference: `C — Chorus` or `Section C`
- Drag sections into the organizer
- Copy mode instruction: **Select Copy to duplicate.**
- Repeat count and arrangement notes
- Touch-friendly `Add →`, `↑`, `↓`, and `Copy` fallbacks for iPhone
- Practice output
- Theory output with ranked key estimate
- Practice PNG export
- Local browser song saving
- PWA/offline shell with iPhone home-screen icon

## Storage

Songs and learned chord shapes are saved in the browser's local storage on that device/browser.

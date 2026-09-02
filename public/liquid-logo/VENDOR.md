Vendored from https://github.com/collidingScopes/liquid-logo @ c733c38a043009b873cb9a6062c0defa9c70ee7d (MIT).
Not published on npm and has no package.json, so the source is copied here.
Omitted: assets/ (demo logo images, ~9MB) and the full mp4-muxer-main source (only build/mp4-muxer.js kept).
demo.reference.html is upstream index.html with the umami analytics tag removed; it still pulls dat.gui and Font Awesome from CDNs.
Script load order: shaders.js, presets.js, mp4-muxer/mp4-muxer.js, canvasVideoExport.js, background-removal.js, gui-controls.js, main.js

## Local modifications
- `index.html` — regenerated from upstream `index.html` (kept as `demo.reference.html`). Serving this folder had no index, which is why `localhost:8000` showed a directory listing.
  - script path fixed: `mp4-muxer-main/build/mp4-muxer.js` -> `mp4-muxer/mp4-muxer.js`
  - demo-logo buttons: added Tropify; removed Nike / Mario / Pikachu (their assets are not vendored)
  - removed `assets/siteOGImage4.png` <img> and the buymeacoffee image (not vendored / external)
- `main.js:191` — default logo on load changed from `apple` to `tropify`
- `assets/` — only the small upstream demo logos are vendored (apple, github, pepsi, playstation, spotify, umbrella, youtube, favicon) plus `tropify.png`
- `renders/` — stills captured from the tool, not upstream content

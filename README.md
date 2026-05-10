# Kunal Kaushik — Portfolio

A single-page site: your name, short intro, contact in the header, then projects with space for one or two images and a full written description.

## Run locally

```bash
npm install
npm run dev
```

## Edit copy and contact

- **`src/content/profile.ts`** — `name`, `subtext`, and `links` (email, LinkedIn, GitHub, resume path).

## Edit projects

- **`src/content/projects.ts`** — list of `Project` objects:

  - **`title`**, **`summary`** (one line under the title).
  - **`tags`** — small chips shown under the summary.
  - **`media`** — array of files in `public/`. Each entry is either a string or an object:
    - `'/projects/arm-1.jpg'` — string, auto-detected as image
    - `'/projects/arm-demo.mp4'` — string, auto-detected as video by extension
    - Object form (use this whenever you want a caption):
      ```ts
      {
        src: '/projects/arm-demo.mp4',
        caption: 'Bring-up demo · 5 ms loop',
        poster: '/projects/arm-poster.jpg', // optional video thumbnail
        alt: 'Robot arm settling into pose', // optional, defaults to project title
        type: 'video', // optional, auto-detected from src
      }
      ```

    Recognized video extensions: `.mp4`, `.webm`, `.mov`, `.m4v`, `.ogg`, `.ogv` (`.mp4` recommended for best browser support). Empty array shows two dashed placeholders.

    **Captions** are only shown inside the "Look closer" lightbox, so they don't clutter the card.
  - **`paragraphs`** — each string is one paragraph of your write-up.

### Layout adapts to media count

| Items | Display |
| ----- | ------- |
| 0     | Two dashed placeholders |
| 1–2   | Stacked at full width |
| 3+    | First two stacked at full width; the column becomes scrollable (with an animated **Scroll for more** indicator) and the rest reveal as you scroll inside it |

Click **Look closer** on any tile to open the lightbox, which supports `← →` and `Esc`, plays videos with native controls, shows a position counter, and renders the caption below the image.

Add a new project by copying an existing block and changing `id`.

## Resume PDF

Put the file at `public/Kunal Kaushik - Resume.pdf` or change `links.resume` in `profile.ts`.

## Deploying

```bash
npm run build      # outputs dist/
npm run preview    # local smoke test of the production build
```

Drop the `dist/` folder on any static host — Vercel, Netlify, Cloudflare Pages, or GitHub Pages all work out of the box. After your first deploy, update three places to your final URL:

1. `index.html` — `og:url`, `<link rel="canonical">`, and the `url` field inside the JSON-LD block.
2. `public/robots.txt` — the `Sitemap:` line.

### Asset tips

All project images, the resume PDF, and the demo video live in `public/`. They're shipped as-is, so:

- Keep images under ~500 KB where possible. Large PNGs (rift1, snosight3d, etc.) compress well as JPG/WebP — try [squoosh.app](https://squoosh.app) for one-shot resizes.
- Videos: `.mp4` (H.264) is the safest format. The site uses `preload="metadata"` so only a few hundred KB load up front per video; the full file streams once a viewer presses play. If a clip is over ~10 MB consider compressing with `ffmpeg -i in.mp4 -vcodec libx264 -crf 28 out.mp4`.
- The first project's first image is loaded eagerly with `fetchpriority="high"` for a fast LCP — keep that one extra optimized.

### Performance notes

- Google Fonts are loaded **non-blocking** (preload + swap pattern) so first paint never waits on the network.
- The lightbox is **code-split** (`React.lazy`) and only downloads when someone clicks "Look closer."
- `history.scrollRestoration` is set to `manual` and the page resets to the top on every load and on bfcache restore.
# designportfolio

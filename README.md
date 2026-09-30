# Kunal Kaushik — Portfolio

A handwritten portfolio on textured ivory paper. The header contains your name, a portrait, a small “Right now” box, and contact links. Projects begin as compact notebook entries with an open-notes prompt. Expanded entries contain manual carousels with buttons, position indicators, arrow keys, and touch swipes. Videos play muted when selected; click the video to pause or resume. Zoom fades and scales smoothly, and closes with Escape. Names and project titles reveal gently on entry; no introductory paragraph is displayed.

## Run

```sh
npm install
npm run dev
npm run build
npm run lint
```

## Add or edit projects

Copy `templates/project.json` into `src/content/projects/your-project.json`. Set a unique `id`, title, category, and order. Lower order appears first. Files are discovered automatically.

- `summary`: what you built and why.
- `outcome`: a measured result or concrete accomplishment you can support.
- `highlights`: short engineering notes shown on the paper.
- `media`: files from `public/`, in carousel order. Strings are detected as images or videos. Objects support `src`, `alt`, `caption`, `type`, and video `poster`.
- `paragraphs`: full technical details included in the agent-readable version.
- `links`: optional objects with `label` and `href` for demos or code.
- `status: "coming-soon"`: a planned entry. NMbL lab, FSAE, and the BLDC driver are currently placeholders.

Categories: `Robotics`, `Computer vision`, `Electronics`. Empty media arrays render text only. Add any number of images; the carousel adapts automatically. Visitors can open the displayed image at full size, and videos have native playback controls. Carousels never advance automatically.

## Personal details

Edit `src/content/profile.ts` for age, song, and contact links. Song of the day is a manual selection.

The supplied portrait is optimized in `public/portrait.jpg`. Its centered crop is set by `.portrait img` in the stylesheet.

## Paper aesthetic

`src/index.css` contains the paper, pencil marks, tape, ink, and handwriting styles. Lora provides upright, formal lettering in graphite colors. `public/graphite-grain.svg` adds subtle pencil texture to headings; shaded hole punches line the left margin. The background texture is `public/paper-texture.png`; its generation prompt is documented in `docs/paper-texture.md`.

## Agent-readable content

`npm run dev` and `npm run build` regenerate `/ai/`, `/llms.txt`, and `/llms-full.txt` from the same profile and project files. To refresh these while the dev server is running, run `node scripts/generate-ai.mjs`.

## Domain

Recommended: `kunalk.dev`; full-name alternative: `kunalkaushik.me`. September 29, 2026 registry checks found no registration records for those candidates. `kunalkaushik.com` and `kunalk.com` were registered. Confirm purchase availability and pricing at a registrar. No domain has been purchased.

After connecting a domain, update URLs in `index.html`, `public/robots.txt`, and `public/sitemap.xml`. `npm run build` produces `dist/` for your existing static host.

## Notebook refinements

The paper and ruled lines cover the full background. Your name writes in on arrival; project titles animate once when they enter view. A decorative equalizer animates beside the song (it does not indicate audio playback). All animation respects reduced-motion preferences.

Carousel images stay mounted and are preloaded near the viewport for smooth crossfades. Photo windows use each image’s natural aspect ratio, without letterboxing. Click the visible zoom label to open the integrated viewer; it supports Escape, keyboard arrows, native focus containment, and navigation controls. Background scrolling is locked while it is open.

`public/favicon.svg` is the hand-drawn 2k tab icon.



SEO and AI discovery are generated during builds. See docs/seo-launch.txt for domain setup, deployment, Search Console, and Bing indexing steps. The production HTML is prerendered and hydrates into the same interactive portfolio.


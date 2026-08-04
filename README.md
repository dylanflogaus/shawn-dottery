# Shawn Dottery Campaign Site

Campaign website for **Shawn Dottery**, Republican candidate for Delaware State Representative (3rd District).

**Theme:** A Voice for the Quiet People

## Stack

Plain HTML, CSS, and JavaScript. No build step. Designed for later deployment to a Cloudflare Worker via [Workers Assets](https://developers.cloudflare.com/workers/static-assets/).

## Local preview

From the project root:

```bash
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080).

Alternatively:

```bash
npm run preview
```

## Project layout

```
index.html                 Home
meet-shawn.html            Meet Shawn
priorities.html            Priorities overview
priorities/*.html          Issue detail pages
events.html                Events calendar
get-involved.html          Volunteer + email signup
contact.html               Contact form
donate.html                Donate (dummy WinRed link)
privacy.html / terms.html  Legal stubs
assets/
  css/styles.css           Design system + page styles
  js/layout.js             Shared header/footer loader
  js/main.js               Nav, reveals, form stubs
  partials/                Header + footer HTML
  img/                     Optimized web images
photos/                    Original source photos
wrangler.jsonc             Cloudflare Workers Assets config
```

## Cloudflare deploy (later)

1. Install / log in to Wrangler if needed: `npx wrangler login`
2. Preview with the Worker runtime: `npm run cf:dev`
3. Deploy: `npm run deploy`

`wrangler.jsonc` serves the project root as static assets. No Worker script is required for the static Home page.

## Design notes

- Palette: deep navy, warm cream, considered red, brass accents
- Type: Fraunces (display) + Libre Franklin (body) via Google Fonts
  - For production, prefer self-hosting fonts for privacy and performance
- Donate CTA is prominent in the sticky nav (dummy `#donate` link for now)

## Out of scope (this pass)

Meet Shawn, priority detail pages, News, Events, Volunteer, Donate, and Contact are previewed or stubbed on the Home page and will be built after the visual direction is approved.

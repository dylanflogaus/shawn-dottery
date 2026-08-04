# Shawn Dottery Campaign Site

Campaign website for **Shawn Dottery**, Republican candidate for Delaware State Representative (3rd District).

**Theme:** A Voice for the Quiet People

## Stack

- **Frontend:** Plain HTML, CSS, and JavaScript. No build step. Designed for deployment to Cloudflare Workers via [Workers Assets](https://developers.cloudflare.com/workers/static-assets/).
- **Backend:** Dockerized Django admin + RSVP API (PostgreSQL). Events are managed in Django and exported to static JSON for the site.

## Local preview (static site)

From the project root:

```bash
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080).

Alternatively:

```bash
npm run preview
```

## Django backend (events + RSVP)

Django runs in Docker, not on the host Python environment.

### Start

```bash
cp .env.example .env   # first time only
docker compose up -d --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py seed_events
docker compose exec web python manage.py export_events
```

- Admin: [http://localhost:8000/admin/](http://localhost:8000/admin/)
- RSVP API: `POST http://localhost:8000/api/rsvp/`

A local `.env` is gitignored. Use `.env.example` as the template.

### Publish workflow (campaign staff)

1. Open Django admin and add or edit events.
2. Mark events **Published** (and optionally **Featured** for the homepage).
3. Select any event(s) and run the admin action **Export events to site**, or run:

   ```bash
   docker compose exec web python manage.py export_events
   ```

4. Confirm [`assets/data/events.json`](assets/data/events.json) updated.
5. Preview the static site with `npm run dev`.
6. Deploy the static site: `npm run deploy`.

Event listings on the live site come from the exported JSON. RSVP submissions need a separately hosted Django API (see below).

### RSVP configuration

The events page and homepage read the API base URL from:

- `<meta name="campaign-api" content="...">`, or
- `data-api-base` on `<body>`

Local defaults point at `http://localhost:8000`. For production, set both to your hosted Django URL (no trailing slash), for example `https://api.yourdomain.com`, and add that site origin to `CORS_ALLOWED_ORIGINS` in the Django environment.

`POST /api/rsvp/` body:

```json
{
  "event_slug": "coffee-with-shawn",
  "name": "Jane Neighbor",
  "email": "jane@example.com"
}
```

RSVPs appear in Django admin and can be exported as CSV.

### Production hosting notes

| Piece | Hosting |
|-------|---------|
| Static site (`*.html`, assets, `events.json`) | Cloudflare Workers Assets (`npm run deploy`) |
| Django admin + RSVP API | Separate host (Railway, Fly.io, a VPS, etc.) with PostgreSQL |

Events still display if only the static JSON is deployed. RSVP buttons need the Django API online and the correct `campaign-api` / `data-api-base` URL.

## Project layout

```
index.html                 Home
meet-shawn.html            Meet Shawn
priorities.html            Priorities overview
priorities/*.html          Issue detail pages
events.html                Events calendar (loads assets/data/events.json)
get-involved.html          Volunteer + email signup
contact.html               Contact form
donate.html                Donate (dummy WinRed link)
privacy.html / terms.html  Legal stubs
assets/
  css/styles.css           Design system + page styles
  js/layout.js             Shared header/footer loader
  js/events.js             Fetch + render events from JSON
  js/main.js               Nav, reveals, forms, RSVP modal
  data/events.json         Exported event data (from Django)
  partials/                Header + footer HTML
  img/                     Optimized web images
backend/                   Django project (admin + RSVP API)
Dockerfile                 Django image
docker-compose.yml         web + PostgreSQL
.env.example               Backend env template
photos/                    Original source photos
wrangler.jsonc             Cloudflare Workers Assets config
```

## Cloudflare deploy (static site)

1. Install / log in to Wrangler if needed: `npx wrangler login`
2. Preview with the Worker runtime: `npm run cf:dev`
3. Deploy: `npm run deploy`

`wrangler.jsonc` serves the project root as static assets. No Worker script is required for the static Home page.

## Design notes

- Palette: deep navy, warm cream, considered red, brass accents
- Type: Fraunces (display) + Libre Franklin (body) via Google Fonts
  - For production, prefer self-hosting fonts for privacy and performance
- Donate CTA is prominent in the sticky nav (dummy `#donate` link for now)

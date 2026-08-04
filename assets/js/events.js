(() => {
  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const eventsUrl = () => {
    const root = document.body.dataset.root || "";
    return `${root}assets/data/events.json`;
  };

  const emptyMessage = (message) =>
    `<p class="events-empty">${escapeHtml(message)}</p>`;

  const renderFeaturedCard = (event) => `
    <article class="event-card reveal is-visible">
      <div class="event-card__date" aria-hidden="true">
        <span>${escapeHtml(event.month_abbr)}</span>
        <span>${escapeHtml(event.day)}</span>
      </div>
      <p class="meta">${escapeHtml(event.category)}</p>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.description)}</p>
    </article>
  `;

  const renderEventRow = (event) => `
    <article class="event-row reveal is-visible" data-event-slug="${escapeHtml(event.slug)}">
      <div class="event-card__date" aria-hidden="true">
        <span>${escapeHtml(event.month_abbr)}</span>
        <span>${escapeHtml(event.day)}</span>
      </div>
      <div class="event-row__body">
        <p class="meta">${escapeHtml(event.category)}</p>
        <h3>${escapeHtml(event.title)}</h3>
        <div class="event-row__meta">
          <span>${escapeHtml(event.time_display)}</span>
          <span>${escapeHtml(event.location)}</span>
        </div>
        <p>${escapeHtml(event.description)}</p>
        <div class="event-row__actions">
          <button
            class="btn btn-secondary"
            type="button"
            data-rsvp
            data-event-slug="${escapeHtml(event.slug)}"
            data-event-title="${escapeHtml(event.title)}"
          >
            RSVP
          </button>
          <span data-rsvp-status></span>
        </div>
      </div>
    </article>
  `;

  const loadEvents = async () => {
    const listEl = document.getElementById("events-list");
    const featuredEl = document.getElementById("featured-events");
    if (!listEl && !featuredEl) return;

    let data;
    try {
      const response = await fetch(eventsUrl(), { credentials: "same-origin" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
    } catch (error) {
      const message = "Events are temporarily unavailable. Please check back soon.";
      if (listEl) listEl.innerHTML = emptyMessage(message);
      if (featuredEl) featuredEl.innerHTML = emptyMessage(message);
      console.warn("Failed to load events.json", error);
      return;
    }

    const events = Array.isArray(data.events) ? data.events : [];

    if (listEl) {
      listEl.innerHTML = events.length
        ? events.map(renderEventRow).join("")
        : emptyMessage("No upcoming events right now. Check back soon.");
      document.dispatchEvent(new CustomEvent("site:events-ready"));
    }

    if (featuredEl) {
      const featured = events.filter((event) => event.featured).slice(0, 3);
      featuredEl.innerHTML = featured.length
        ? featured.map(renderFeaturedCard).join("")
        : emptyMessage("No upcoming events right now. Check back soon.");
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadEvents);
  } else {
    loadEvents();
  }
})();

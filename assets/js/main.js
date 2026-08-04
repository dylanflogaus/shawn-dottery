(() => {
  const initHeader = () => {
    const header = document.getElementById("site-header");
    const toggle = document.querySelector(".nav-toggle");
    const mobileNav = document.getElementById("mobile-nav");

    const onScroll = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && mobileNav) {
      const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        mobileNav.classList.toggle("is-open", open);
        mobileNav.hidden = !open;
      };

      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        setOpen(open);
      });

      mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
      });

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setOpen(false);
      });
    }
  };

  /* Scroll reveals */
  const initReveals = () => {
    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach((el) => observer.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-visible"));
    }
  };

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const getApiBase = () => {
    const meta = document.querySelector('meta[name="campaign-api"]');
    const fromMeta = meta?.getAttribute("content")?.trim();
    const fromBody = document.body.dataset.apiBase?.trim();
    return (fromBody || fromMeta || "").replace(/\/$/, "");
  };

  /* Generic form stubs */
  const initForms = () => {
    document.querySelectorAll("[data-form-stub]").forEach((form) => {
      const status = form.querySelector("[data-form-status]");
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = form.querySelector('input[type="email"]');
        if (email && !isValidEmail(email.value || "")) {
          if (status) status.textContent = "Please enter a valid email address.";
          email.focus();
          return;
        }

        const success =
          form.dataset.successMessage ||
          "Thanks for joining. We'll be in touch soon.";
        if (status) status.textContent = success;
        form.reset();
      });
    });
  };

  const ensureRsvpModal = () => {
    let modal = document.getElementById("rsvp-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "rsvp-modal";
    modal.className = "rsvp-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="rsvp-modal__backdrop" data-rsvp-close></div>
      <div
        class="rsvp-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rsvp-modal-title"
      >
        <button class="rsvp-modal__close" type="button" data-rsvp-close aria-label="Close">
          &times;
        </button>
        <p class="section-label">RSVP</p>
        <h2 id="rsvp-modal-title">Reserve your spot</h2>
        <p class="rsvp-modal__event" data-rsvp-event-label></p>
        <form class="rsvp-modal__form" novalidate>
          <input type="hidden" name="event_slug" data-rsvp-slug />
          <label class="sr-only" for="rsvp-name">Full name</label>
          <input
            id="rsvp-name"
            name="name"
            type="text"
            autocomplete="name"
            required
            placeholder="Your name"
          />
          <label class="sr-only" for="rsvp-email">Email address</label>
          <input
            id="rsvp-email"
            name="email"
            type="email"
            autocomplete="email"
            required
            placeholder="Email address"
          />
          <button class="btn btn-primary" type="submit">Send RSVP</button>
          <p class="form-status" data-rsvp-form-status role="status" aria-live="polite"></p>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  };

  let activeRsvpButton = null;

  const closeRsvpModal = () => {
    const modal = document.getElementById("rsvp-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("rsvp-modal-open");
    activeRsvpButton = null;
  };

  const openRsvpModal = (button) => {
    const modal = ensureRsvpModal();
    const slug = button.dataset.eventSlug || "";
    const title = button.dataset.eventTitle || "this event";
    const slugInput = modal.querySelector("[data-rsvp-slug]");
    const label = modal.querySelector("[data-rsvp-event-label]");
    const status = modal.querySelector("[data-rsvp-form-status]");
    const form = modal.querySelector("form");

    if (slugInput) slugInput.value = slug;
    if (label) label.textContent = title;
    if (status) status.textContent = "";
    if (form) form.reset();
    if (slugInput) slugInput.value = slug;

    activeRsvpButton = button;
    modal.hidden = false;
    document.body.classList.add("rsvp-modal-open");
    modal.querySelector("#rsvp-name")?.focus();
  };

  const submitRsvp = async (form) => {
    const status = form.querySelector("[data-rsvp-form-status]");
    const name = form.querySelector("#rsvp-name");
    const email = form.querySelector("#rsvp-email");
    const slug = form.querySelector("[data-rsvp-slug]")?.value?.trim();
    const apiBase = getApiBase();

    if (!slug) {
      if (status) status.textContent = "Missing event. Please try again.";
      return;
    }
    if (!name?.value.trim()) {
      if (status) status.textContent = "Please enter your name.";
      name?.focus();
      return;
    }
    if (!email || !isValidEmail(email.value || "")) {
      if (status) status.textContent = "Please enter a valid email address.";
      email?.focus();
      return;
    }
    if (!apiBase) {
      if (status) {
        status.textContent =
          "RSVP is not configured yet. Please contact the campaign.";
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (status) status.textContent = "Sending…";

    try {
      const response = await fetch(`${apiBase}/api/rsvp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          event_slug: slug,
          name: name.value.trim(),
          email: email.value.trim(),
        }),
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(payload.error || "Could not save your RSVP.");
      }

      const message =
        payload.message || "RSVP saved – we'll confirm by email.";
      if (status) status.textContent = message;

      if (activeRsvpButton) {
        const rowStatus = activeRsvpButton
          .closest(".event-card, .event-row")
          ?.querySelector("[data-rsvp-status]");
        if (rowStatus) rowStatus.textContent = message;
        activeRsvpButton.disabled = true;
        activeRsvpButton.textContent = "RSVP Sent";
      }

      window.setTimeout(closeRsvpModal, 900);
    } catch (error) {
      if (status) {
        status.textContent =
          error instanceof Error
            ? error.message
            : "Could not save your RSVP. Please try again.";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  const bindRsvpControls = () => {
    const modal = ensureRsvpModal();

    document.querySelectorAll("[data-rsvp]").forEach((button) => {
      if (button.dataset.rsvpBound === "1") return;
      button.dataset.rsvpBound = "1";
      button.addEventListener("click", () => openRsvpModal(button));
    });

    if (modal.dataset.rsvpBound === "1") return;
    modal.dataset.rsvpBound = "1";

    modal.querySelectorAll("[data-rsvp-close]").forEach((el) => {
      el.addEventListener("click", closeRsvpModal);
    });

    modal.querySelector("form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitRsvp(event.currentTarget);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeRsvpModal();
    });
  };

  /* Video placeholder (Home) */
  const initVideo = () => {
    const videoBtn = document.querySelector("[data-video-placeholder]");
    if (!videoBtn) return;
    videoBtn.addEventListener("click", () => {
      const label = videoBtn.querySelector("span:last-child");
      if (label) label.textContent = "Video coming soon";
    });
  };

  let booted = false;
  const boot = () => {
    if (booted) return;
    booted = true;
    initHeader();
    initReveals();
    initForms();
    bindRsvpControls();
    initVideo();
  };

  document.addEventListener("site:chrome-ready", boot);
  document.addEventListener("site:events-ready", () => {
    bindRsvpControls();
  });

  /* Fallback if layout.js is absent or chrome already present */
  if (document.getElementById("site-header")) {
    boot();
  }
})();

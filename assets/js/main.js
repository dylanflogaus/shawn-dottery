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

    document.querySelectorAll("[data-rsvp]").forEach((button) => {
      button.addEventListener("click", () => {
        const status = button
          .closest(".event-card, .event-row")
          ?.querySelector("[data-rsvp-status]");
        if (status) {
          status.textContent = "RSVP saved – we'll confirm by email.";
        }
        button.disabled = true;
        button.textContent = "RSVP Sent";
      });
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
    initVideo();
  };

  document.addEventListener("site:chrome-ready", boot);

  /* Fallback if layout.js is absent or chrome already present */
  if (document.getElementById("site-header")) {
    boot();
  }
})();

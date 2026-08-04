(() => {
  const root = document.body.dataset.root || "";
  const activeNav = document.body.dataset.nav || "";

  const applyRoot = (html) => html.replaceAll("{{ROOT}}", root);

  const setActiveNav = () => {
    if (!activeNav) return;
    document.querySelectorAll(`[data-nav="${activeNav}"]`).forEach((link) => {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    });
  };

  const initChrome = () => {
    setActiveNav();
    document.dispatchEvent(new CustomEvent("site:chrome-ready"));
  };

  const mount = async () => {
    const headerSlot = document.getElementById("site-chrome");
    const footerSlot = document.getElementById("site-footer-slot");
    if (!headerSlot || !footerSlot) {
      initChrome();
      return;
    }

    try {
      const [headerRes, footerRes] = await Promise.all([
        fetch(`${root}assets/partials/header.html`),
        fetch(`${root}assets/partials/footer.html`),
      ]);

      if (!headerRes.ok || !footerRes.ok) {
        throw new Error("Failed to load layout partials");
      }

      const [headerHtml, footerHtml] = await Promise.all([
        headerRes.text(),
        footerRes.text(),
      ]);

      headerSlot.outerHTML = applyRoot(headerHtml);
      footerSlot.outerHTML = applyRoot(footerHtml);
      initChrome();
    } catch (error) {
      console.error(error);
      initChrome();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();

/* Shared enhancement layer: keeps the original visual effects, safely initialises
   them only where needed, and adds accessible mobile navigation. */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = prefersReducedMotion.matches;

  const toggle = document.querySelector(".hamburger");
  const panel = document.getElementById("mySidenav");
  const closeButton = panel?.querySelector(".closebtn");
  let previousFocus = null;

  if (toggle && panel && closeButton) {
    const isOpen = () => panel.classList.contains("is-open");
    const focusable = () =>
      Array.from(panel.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));

    function closeMenu({ restoreFocus = true } = {}) {
      if (!isOpen()) return;
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      if (restoreFocus && previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      } else if (panel.contains(document.activeElement)) {
        toggle.focus();
      }
      panel.inert = true;
      panel.setAttribute("aria-hidden", "true");
    }

    function openMenu() {
      previousFocus = document.activeElement;
      panel.inert = false;
      panel.removeAttribute("aria-hidden");
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation");
      closeButton.focus();
    }

    toggle.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
    closeButton.addEventListener("click", () => closeMenu());
    panel.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    document.addEventListener("keydown", (event) => {
      if (!isOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Do not leave an off-screen menu open after switching to desktop layout.
    window.matchMedia("(min-width: 1201px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu({ restoreFocus: false });
    });
  }

  // Preserve Swiper's coverflow carousel, navigation, pagination and keyboard use.
  if (document.querySelector(".portfolio__container") && typeof window.Swiper === "function") {
    new window.Swiper(".portfolio__container", {
      effect: reducedMotion ? "slide" : "coverflow",
      grabCursor: true,
      centeredSlides: true,
      coverflowEffect: {
        rotate: 50, stretch: 0, depth: 100, modifier: 1,
        slideShadows: true
      },
      slidesPerView: 1,
      loop: true,
      spaceBetween: 20,
      watchOverflow: true,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      keyboard: { enabled: true, onlyInViewport: true },
      mousewheel: false,
      a11y: {
        enabled: true,
        prevSlideMessage: "Previous project",
        nextSlideMessage: "Next project",
        paginationBulletMessage: "Go to project {{index}}"
      },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 20 }
      }
    });
  }

  // Keep the original terminal typing effect on the homepage, and never try to
  // mount it on legal/archive pages that do not have an .input element.
  const terminal = document.querySelector(".input");
  if (terminal) {
    if (!reducedMotion && typeof window.Typed === "function") {
      new window.Typed(".input", {
        strings: [
          "sudo apt install nodejs ",
          "sudo apt install npm ",
          "Welcome to my website.",
          "I love to Code :) "
        ],
        showCursor: true,
        cursorChar: "|",
        typeSpeed: 120,
        backSpeed: 60,
        loop: true
      });
    } else {
      terminal.textContent = "Welcome to my website.";
    }
  }

  // Keep the tilt/glare interaction for mouse and touch devices, where wanted.
  if (!reducedMotion && typeof window.VanillaTilt !== "undefined") {
    const tiltElements = document.querySelectorAll(".trinket");
    if (tiltElements.length) {
      window.VanillaTilt.init(tiltElements, {
        max: 23,
        speed: 400,
        glare: true,
        "max-glare": 0.1
      });
    }
  }
})();

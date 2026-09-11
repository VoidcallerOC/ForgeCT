(() => {
  "use strict";

  window.va =
    window.va ||
    function (...args) {
      (window.vaq = window.vaq || []).push(args);
    };

  const track = (name, properties = {}) => {
    window.va("event", { name, ...properties });
  };

  track("landing_page_view", {
    page: document.body.dataset.conversionPage || window.location.pathname,
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-track]");
    if (!target) return;
    track(target.getAttribute("data-track"));
  });

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = currentYear;
  });

  // Reveal-on-scroll
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  // Scroll progress bar
  const progressBar = document.querySelector("[data-scroll-progress]");
  if (progressBar) {
    let ticking = false;
    const paintProgress = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(100, (scrolled / max) * 100) : 0;
      progressBar.style.width = pct.toFixed(2) + "%";
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(paintProgress);
        ticking = true;
      }
    };
    paintProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  // Cursor spotlight (pointer only, non-touch)
  const spotlight = document.querySelector("[data-cursor-spotlight]");
  if (
    spotlight &&
    !reducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    let px = -1000;
    let py = -1000;
    let raf = 0;
    const paint = () => {
      spotlight.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      raf = 0;
    };
    document.addEventListener(
      "pointermove",
      (event) => {
        px = event.clientX;
        py = event.clientY;
        spotlight.classList.add("is-on");
        if (!raf) raf = window.requestAnimationFrame(paint);
      },
      { passive: true },
    );
    document.addEventListener("pointerleave", () => {
      spotlight.classList.remove("is-on");
    });
  }

  // Magnetic buttons
  const magnets = document.querySelectorAll("[data-magnetic]");
  if (
    magnets.length &&
    !reducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    magnets.forEach((btn) => {
      const strength = 0.28;
      btn.addEventListener("pointermove", (event) => {
        const rect = btn.getBoundingClientRect();
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // Marquee — duplicate track so the CSS translateX(-50%) yields a seamless loop
  const marqueeTrack = document.querySelector("[data-marquee] .marquee-track");
  if (marqueeTrack) {
    const clone = marqueeTrack.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marqueeTrack.parentNode.appendChild(clone);
  }

  // Work filter chips
  const workGrid = document.querySelector("[data-work-grid]");
  const filterChips = document.querySelectorAll("[data-filter]");
  const emptyState = document.querySelector("[data-work-empty]");
  const visibleCount = document.querySelector("[data-work-visible]");
  const totalCount = document.querySelector("[data-work-total]");
  const filterReset = document.querySelector("[data-filter-reset]");

  if (workGrid && filterChips.length) {
    const items = Array.from(workGrid.querySelectorAll("[data-work-item]"));
    if (totalCount) totalCount.textContent = String(items.length);

    const applyFilter = (key) => {
      let shown = 0;
      items.forEach((item) => {
        const cats = (item.getAttribute("data-categories") || "").split(/\s+/);
        const match = key === "all" || cats.includes(key);
        item.classList.toggle("is-hidden", !match);
        if (match) shown += 1;
      });
      filterChips.forEach((chip) => {
        const on = chip.getAttribute("data-filter") === key;
        chip.classList.toggle("is-active", on);
        chip.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (visibleCount) visibleCount.textContent = String(shown);
      if (emptyState) emptyState.hidden = shown !== 0;
    };

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        applyFilter(chip.getAttribute("data-filter"));
      });
    });
    if (filterReset) {
      filterReset.addEventListener("click", () => applyFilter("all"));
    }
  }

  // Hero stat counter (small flourish; skip on reduced motion)
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length && !reducedMotion && "IntersectionObserver" in window) {
    const runCount = (el) => {
      const target = Number(el.getAttribute("data-count-to")) || 0;
      const duration = 900;
      const start = performance.now();
      const from = 0;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(from + (target - from) * eased));
        if (t < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => counterIO.observe(el));
  }

  // Package picker
  const packages = {
    local: {
      name: "Local Business Site",
      price: "$2,000 total — 2 × $1,000",
      blurb:
        "Your shop page. Three to five pages: your hours, your floor, how to walk in, paid across two milestone payments.",
      bullets: [
        "Local Business — Deposit · $1,000",
        "Local Business — Final delivery · $1,000",
      ],
    },
    system: {
      name: "Site and System",
      price: "$6,000 total — 3 × $2,000",
      blurb:
        "Events, play nights, collection intake, or a bigger site around your shop, paid across three milestone payments.",
      bullets: [
        "Site and System — Deposit · $2,000",
        "Site and System — Build · $2,000",
        "Site and System — Launch · $2,000",
      ],
    },
    product: {
      name: "Product Site",
      price: "$16,000 total — 4 × $4,000",
      blurb:
        "A catalog or checkout that matches how you actually sell, paid across four milestone payments.",
      bullets: [
        "Tier 3 — Deposit · $4,000",
        "Tier 3 — First round of edits · $4,000",
        "Tier 3 — Second round of edits · $4,000",
        "Tier 3 — Launch · $4,000",
      ],
    },
  };

  const picker = document.querySelector("[data-package-picker]");
  if (picker) {
    const nameEl = picker.querySelector("[data-package-name]");
    const priceEl = picker.querySelector("[data-package-price]");
    const blurbEl = picker.querySelector("[data-package-blurb]");
    const bulletsEl = picker.querySelector("[data-package-bullets]");
    const tabs = picker.querySelectorAll("[data-package]");

    const paint = (key) => {
      const pack = packages[key];
      if (!pack) return;
      nameEl.textContent = pack.name;
      priceEl.textContent = pack.price;
      blurbEl.textContent = pack.blurb;
      bulletsEl.innerHTML = pack.bullets
        .map((item) => `<li>${item}</li>`)
        .join("");
      tabs.forEach((tab) => {
        const on = tab.getAttribute("data-package") === key;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        paint(tab.getAttribute("data-package"));
      });
    });
  }

  // Visit path
  const visit = document.querySelector("[data-visit-path]");
  if (visit) {
    const steps = [
      {
        label: "Hours and door",
        copy: "Mon–Sun · address · how to walk in. Built so a phone in the lot finds you before they drive past.",
      },
      {
        label: "What is on your floor",
        copy: "Collections, events, and what you carry — without hunting Facebook for the real hours.",
      },
      {
        label: "Call or walk in",
        copy: "Your phone, your map, and a page you can keep current.",
      },
    ];
    const labelEl = visit.querySelector("[data-visit-label]");
    const copyEl = visit.querySelector("[data-visit-copy]");
    const items = visit.querySelectorAll("[data-visit-step]");

    const show = (index) => {
      const step = steps[index];
      if (!step) return;
      labelEl.textContent = step.label;
      copyEl.textContent = step.copy;
      items.forEach((item) => {
        item.classList.toggle(
          "is-active",
          item.getAttribute("data-visit-step") === String(index),
        );
      });
    };

    visit.querySelectorAll("[data-visit-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        show(Number(btn.getAttribute("data-visit-btn")));
      });
    });
  }

  // Contact form
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  const bookingForm = form?.matches("[data-booking-form]");

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      status.textContent =
        "Please complete the required fields before sending.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      siteUrl: String(formData.get("siteUrl") || "").trim(),
      message: bookingForm
        ? [
            "Appointment request:",
            `Preferred date: ${String(formData.get("preferredDate") || "").trim()}`,
            `Preferred time: ${String(formData.get("preferredTime") || "").trim()}`,
            `Time zone: ${String(formData.get("timezone") || "").trim()}`,
            "",
            String(formData.get("message") || "").trim(),
          ].join("\n")
        : String(formData.get("message") || "").trim(),
      website: String(formData.get("website") || "").trim(),
    };

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    status.textContent = bookingForm
      ? "Sending your appointment request…"
      : "Sending your inquiry…";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        status.textContent =
          result.error ||
          "The message could not be sent. Email create@forge-ct.com instead.";
        return;
      }

      form.reset();
      track("lead_form_success", {
        source:
          form.getAttribute("data-form-source") || window.location.pathname,
      });
      status.textContent = bookingForm
        ? "Request received. I’ll confirm the appointment by email."
        : "Received. I’ll reply with three practical fixes within 24 hours.";
    } catch {
      status.textContent =
        "The message could not be sent. Email create@forge-ct.com instead.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
})();

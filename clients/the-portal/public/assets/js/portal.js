// THE PORTAL — interactions. No dependencies.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hours as listed on theportalct.com/contact. [open, close] in 24h; index 0 = Sunday.
  const HOURS = [
    [12, 20],
    [12, 20],
    [12, 23],
    [12, 23],
    [12, 23],
    [12, 24],
    [10, 22],
  ];
  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const fmt = (h) =>
    h === 24 || h === 0
      ? "midnight"
      : h === 12
        ? "noon"
        : h > 12
          ? `${h - 12} p.m.`
          : `${h} a.m.`;

  function storeNow() {
    // Wall-clock time in Manchester, CT regardless of the visitor's timezone.
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      get("weekday"),
    );
    return { day, hour: Number(get("hour")) + Number(get("minute")) / 60 };
  }

  function status() {
    const { day, hour } = storeNow();
    const [o, c] = HOURS[day];
    if (hour >= o && hour < c)
      return {
        open: true,
        day,
        short: `Open · til ${fmt(c)}`,
        long: `Open now, until ${fmt(c)}`,
      };
    if (hour < o)
      return {
        open: false,
        day,
        short: `Opens ${fmt(o)}`,
        long: `Closed now. Opens today at ${fmt(o)}`,
      };
    const n = (day + 1) % 7;
    return {
      open: false,
      day,
      short: `Opens ${DAYS[n].slice(0, 3)} ${fmt(HOURS[n][0])}`,
      long: `Closed now. Opens ${DAYS[n]} at ${fmt(HOURS[n][0])}`,
    };
  }

  function paintStatus() {
    const s = status();
    $$("[data-open-status]").forEach((el) => {
      el.classList.toggle("is-open", s.open);
      const t = $("[data-open-text]", el);
      if (t)
        t.textContent = el.dataset.openStatus === "long" ? s.long : s.short;
    });
    $$("[data-hours-row]").forEach((row) =>
      row.classList.toggle("is-today", Number(row.dataset.hoursRow) === s.day),
    );
  }
  paintStatus();
  setInterval(paintStatus, 60_000);

  // Header: measure height, scrolled state, mobile menu.
  const header = $("[data-header]");
  const setHdr = () =>
    header &&
    document.documentElement.style.setProperty(
      "--hdr",
      `${header.offsetHeight}px`,
    );
  setHdr();
  addEventListener("resize", setHdr);
  const onScroll = () => header?.classList.toggle("is-scrolled", scrollY > 12);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = $("[data-menu]");
  const closeMenu = () => {
    header.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  menuBtn?.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") !== "true";
    header.style.setProperty(
      "--menu-top",
      `${Math.round(header.getBoundingClientRect().bottom)}px`,
    );
    header.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $("#nav-list a")?.focus();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header?.classList.contains("is-open")) {
      closeMenu();
      menuBtn.focus();
    }
  });
  matchMedia("(min-width: 1040px)").addEventListener(
    "change",
    (m) => m.matches && closeMenu(),
  );

  // Demo ribbon (per-visitor dismissal).
  const ribbon = $(".demo-ribbon");
  try {
    if (sessionStorage.getItem("portal-ribbon") === "x") ribbon.hidden = true;
  } catch {}
  $("[data-ribbon-close]")?.addEventListener("click", () => {
    ribbon.hidden = true;
    setHdr();
    try {
      sessionStorage.setItem("portal-ribbon", "x");
    } catch {}
  });

  // Scroll reveal.
  const io =
    "IntersectionObserver" in window &&
    new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
  $$(".reveal").forEach((el) =>
    io ? io.observe(el) : el.classList.add("is-in"),
  );

  // Pointer-follow glow on realm cards.
  $$(".realm").forEach((card) =>
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty(
        "--mx",
        `${((e.clientX - r.left) / r.width) * 100}%`,
      );
      card.style.setProperty(
        "--my",
        `${((e.clientY - r.top) / r.height) * 100}%`,
      );
    }),
  );

  // Event filters.
  const chips = $$("[data-filter]");
  const events = $$("[data-cat]");
  const empty = $("[data-empty]");
  const applyFilter = (cat) => {
    chips.forEach((c) =>
      c.setAttribute("aria-pressed", String(c.dataset.filter === cat)),
    );
    let shown = 0;
    events.forEach((ev) => {
      const show = cat === "all" || ev.dataset.cat === cat;
      ev.hidden = !show;
      shown += show;
    });
    if (empty) empty.hidden = shown > 0;
    const live = $("[data-filter-count]");
    if (live)
      live.textContent = `${shown} event type${shown === 1 ? "" : "s"} shown`;
  };
  chips.forEach((c) =>
    c.addEventListener("click", () => {
      applyFilter(c.dataset.filter);
      history.replaceState(
        null,
        "",
        c.dataset.filter === "all" ? location.pathname : `#${c.dataset.filter}`,
      );
    }),
  );
  if (chips.length) {
    const h = location.hash.slice(1);
    applyFilter(chips.some((c) => c.dataset.filter === h) ? h : "all");
  }

  // Where to Begin quiz — mapping taken from the store's own guide.
  const quiz = $("[data-quiz]");
  if (quiz) {
    const MAP = {
      board: {
        label: "Board games",
        qs: [2, 3, 6],
        href: "/tabletop#board",
        blurb:
          "You like shared goals, sharp decisions and a good puzzle. Start at the library shelf — over five hundred titles to try at the table.",
      },
      cards: {
        label: "Collectible card games",
        qs: [1, 3],
        href: "/cards",
        blurb:
          "Collecting plus head-to-head play. Friday Night Magic, prereleases and drafts are your way in.",
      },
      minis: {
        label: "Miniatures games",
        qs: [1, 3, 5],
        href: "/tabletop#minis",
        blurb:
          "You collect, you paint, you compete. Seventeen tables and a terrain collection are waiting.",
      },
      rpg: {
        label: "Roleplaying games",
        qs: [2, 4, 5, 6],
        href: "/rpg",
        blurb:
          "Story, imagination and teamwork. Grab dice and a sourcebook, or ask about a learn-to-play session.",
      },
    };
    const boxes = $$("input[type=checkbox]", quiz);
    const out = $("[data-quiz-result]");
    const render = () => {
      const yes = new Set(
        boxes.filter((b) => b.checked).map((b) => Number(b.value)),
      );
      const scores = Object.entries(MAP).map(([k, v]) => [
        k,
        v.qs.filter((q) => yes.has(q)).length / v.qs.length,
      ]);
      scores.forEach(([k, s]) => {
        const f = $(`[data-bar="${k}"]`, out);
        if (f) f.style.width = `${Math.round(s * 100)}%`;
      });
      const title = $("[data-result-title]", out);
      const blurb = $("[data-result-blurb]", out);
      const cta = $("[data-result-cta]", out);
      if (yes.size === 0) {
        title.textContent = "Answer to reveal your path";
        blurb.textContent =
          "Flip any statement that sounds like you. Your result updates as you go.";
        cta.hidden = true;
        return;
      }
      if (yes.size === 6) {
        title.textContent = "Omnigamer";
        blurb.textContent =
          "Yes to everything — you'll enjoy every corner of the hobby, and this store will always have something open for you.";
        cta.href = "/events";
        cta.textContent = "See every event type";
        cta.hidden = false;
        return;
      }
      const [best] = scores.sort(
        (a, b) => b[1] - a[1] || MAP[b[0]].qs.length - MAP[a[0]].qs.length,
      );
      const m = MAP[best[0]];
      title.textContent = best[1] === 1 ? m.label : `Leaning: ${m.label}`;
      blurb.textContent = m.blurb;
      cta.href = m.href;
      cta.textContent = `Explore ${m.label.toLowerCase()}`;
      cta.hidden = false;
    };
    boxes.forEach((b) => b.addEventListener("change", render));
    $("[data-quiz-reset]")?.addEventListener("click", () => {
      boxes.forEach((b) => (b.checked = false));
      render();
    });
    render();
  }

  // Hero: drifting motes pulled toward the portal.
  const cv = $(".hero__canvas");
  if (cv && !reduced) {
    const ctx = cv.getContext("2d");
    let w, h, dpr, motes, cx, cy, raf;
    const N = innerWidth < 700 ? 46 : 110;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w > 900 ? w * 0.72 : w * 0.5;
      cy = w > 900 ? h * 0.5 : h * 0.32;
    };
    const spawn = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random() * 0.6 + 0.15,
      s: Math.random() * 0.25 + 0.05,
      hue:
        Math.random() < 0.7
          ? "242,182,90"
          : Math.random() < 0.5
            ? "139,108,255"
            : "79,227,214",
    });
    size();
    motes = Array.from({ length: N }, spawn);
    addEventListener("resize", size);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        const dx = cx - m.x,
          dy = cy - m.y,
          d = Math.hypot(dx, dy) || 1;
        m.x += (dx / d) * m.s + (-dy / d) * m.s * 0.9;
        m.y += (dy / d) * m.s + (dx / d) * m.s * 0.9 - 0.04;
        if (d < 30)
          Object.assign(m, spawn(), { x: Math.random() < 0.5 ? 0 : w });
        const fade = Math.min(1, d / 160);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.hue},${m.a * fade})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const vis = new IntersectionObserver(([e]) =>
      e.isIntersecting
        ? (raf = requestAnimationFrame(tick))
        : cancelAnimationFrame(raf),
    );
    vis.observe(cv);
  }

  document.documentElement.classList.remove("no-js");
})();

import { useEffect, useRef } from "react";

/**
 * Ambient starfield behind the whole site: fine fog-coloured points in a shallow 3D volume, plus a soft
 * ribbon of denser points that undulates very slowly. The field turns a few degrees per minute, and a
 * fine pointer nudges nearby points aside. Decorative only: aria-hidden, pointer-events: none (CSS).
 *
 * Cost control:
 * - Point count scales with viewport area and is lower on coarse pointers, low-core devices, or Save-Data.
 * - Device pixel ratio is capped (1.5 desktop, 1.25 touch); points are drawn as 1–2px squares.
 * - Animation is capped at ~30fps and stops when the tab is hidden (requestAnimationFrame pauses).
 * - prefers-reduced-motion: one static frame, no animation loop and no pointer response.
 */
type Point = {
  x: number; // -1..1 in field space
  y: number;
  z: number; // -1..1 depth before rotation
  size: number; // base radius in CSS px
  alpha: number; // base opacity
  ribbon: number; // 0 = dust, else the point's position along the ribbon (-1..1)
  ox: number; // eased pointer offset (CSS px)
  oy: number;
};

const FRAME_MS = 1000 / 30;
const TURN_PER_MS = (2 * Math.PI) / (40 * 60 * 1000); // one full turn every 40 minutes
const RIBBON_SPEED = 0.00006; // ribbon phase per ms (~1.7 min per wave cycle)
const FOCAL = 2.4;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makePoints(count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const isRibbon = i % 3 === 0; // a third of the points form the soft structure
    if (isRibbon) {
      const u = rand(-1, 1);
      points.push({
        x: u * 1.25,
        y: rand(-0.11, 0.11) * (1 - Math.abs(u) * 0.4),
        z: rand(-0.3, 0.3),
        size: rand(0.6, 1.3),
        alpha: rand(0.28, 0.62),
        ribbon: u,
        ox: 0,
        oy: 0,
      });
    } else {
      points.push({
        x: rand(-1.3, 1.3),
        y: rand(-1.1, 1.1),
        z: rand(-1, 1),
        size: rand(0.5, 1.4),
        alpha: rand(0.16, 0.6),
        ribbon: 0,
        ox: 0,
        oy: 0,
      });
    }
  }
  return points;
}

function pointCount(width: number, height: number, lowPower: boolean) {
  const base = Math.round((width * height) / 1250);
  const scaled = lowPower ? base * 0.55 : base;
  return Math.max(180, Math.min(lowPower ? 460 : 1100, Math.round(scaled)));
}

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const lowPower = !finePointer || (navigator.hardwareConcurrency || 8) <= 4 || Boolean(nav.connection?.saveData);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points: Point[] = [];
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

    function resize() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      const widthChanged = w !== width;
      width = w;
      height = h;
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.5);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Only reseed when the width changes, so mobile toolbar show/hide doesn't reshuffle the field.
      if (widthChanged || points.length === 0) points = makePoints(pointCount(w, h, lowPower));
    }

    function draw(time: number, animate: boolean) {
      ctx!.clearRect(0, 0, width, height);
      const angle = time * TURN_PER_MS;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const phase = time * RIBBON_SPEED;
      const scale = Math.max(width, height) * 0.62;
      const cx = width / 2;
      const cy = height * 0.52;
      const radius = finePointer ? 150 : 0;
      const usePointer = animate && pointer.active && radius > 0;

      for (const p of points) {
        let y = p.y;
        let z = p.z;
        if (p.ribbon) {
          // Slow travelling wave with a gentle twist: the "soft structure".
          y += Math.sin(p.ribbon * 2.2 + phase) * 0.26 + Math.sin(p.ribbon * 4.1 - phase * 0.6) * 0.06;
          z += Math.cos(p.ribbon * 1.7 + phase * 0.8) * 0.3;
        }
        // Rotate around the vertical axis, with a fixed slight tilt.
        const rx = p.x * cos - z * sin;
        const rz = p.x * sin + z * cos;
        const depth = FOCAL / (FOCAL + rz + 1.2);
        let sx = cx + rx * scale * depth;
        let sy = cy + (y * 0.92 + rz * 0.08) * scale * depth;
        if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

        if (usePointer) {
          const dx = sx - pointer.x;
          const dy = sy - pointer.y;
          const dist = Math.hypot(dx, dy);
          let tx = 0;
          let ty = 0;
          if (dist < radius && dist > 0.01) {
            const force = (1 - dist / radius) ** 2 * 22 * depth;
            tx = (dx / dist) * force;
            ty = (dy / dist) * force;
          }
          p.ox += (tx - p.ox) * 0.08;
          p.oy += (ty - p.oy) * 0.08;
        } else if (p.ox || p.oy) {
          p.ox *= 0.92;
          p.oy *= 0.92;
          if (Math.abs(p.ox) < 0.05 && Math.abs(p.oy) < 0.05) p.ox = p.oy = 0;
        }
        sx += p.ox;
        sy += p.oy;

        const near = Math.min(1, Math.max(0, (depth - 0.55) / 0.75)); // 0 far .. 1 near
        const a = Math.min(0.85, p.alpha * (0.55 + near * 0.8));
        const s = p.size * (0.75 + near * 1.1);
        ctx!.fillStyle = `rgba(230, 230, 230, ${a.toFixed(3)})`;
        ctx!.fillRect(sx - s / 2, sy - s / 2, s, s);
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const delta = now - last;
      if (delta < FRAME_MS) return;
      last = now;
      elapsed += Math.min(delta, 100); // no jump after a backgrounded tab
      pointer.x += (pointer.tx - pointer.x) * 0.15;
      pointer.y += (pointer.ty - pointer.y) * 0.15;
      draw(elapsed, true);
    }

    function start() {
      cancelAnimationFrame(raf);
      resize();
      if (motionQuery.matches) {
        canvas!.dataset.mode = "static";
        draw(elapsed, false);
      } else {
        canvas!.dataset.mode = "animated";
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (motionQuery.matches) draw(elapsed, false);
      }, 150);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      if (!pointer.active) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
        pointer.active = true;
      }
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    start();
    window.addEventListener("resize", onResize, { passive: true });
    motionQuery.addEventListener("change", start);
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", start);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}

"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(subscribe, () => true, () => false);

const LIGHT_COLORS = ["#99F6E4", "#5EEAD4", "#2DD4BF", "#0F766E", "#CCFBF1"];
const DARK_COLORS = ["#5EEAD4", "#2DD4BF", "#0D9488", "#042F2E", "#14B8A6"];

const BLOBS = [
  { left: -14, top: -16, size: 72, color: 0, duration: 9 },
  { left: 42, top: -10, size: 60, color: 1, duration: 11 },
  { left: 52, top: 44, size: 82, color: 2, duration: 10 },
  { left: -18, top: 42, size: 66, color: 3, duration: 12 },
  { left: 30, top: 56, size: 56, color: 1, duration: 8.5 },
];

const MAX_OFFSET = 8;
const EYE_POSITION: { x: number; y: number }[] = [
  { x: 80, y: 120 },
  { x: 150, y: 120 },
];

export function MeshGradientSVG({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";
  const colors = !mounted || !isDark ? LIGHT_COLORS : DARK_COLORS;

  const clipId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const eyeRefs = useRef<(SVGEllipseElement | null)[]>([]);

  useEffect(() => {
    if (reduceMotion) return;

    let raf = 0;
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function handleMouseMove(event: MouseEvent) {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      target.x = Math.max(
        -MAX_OFFSET,
        Math.min(MAX_OFFSET, (event.clientX - centerX) * 0.08)
      );
      target.y = Math.max(
        -MAX_OFFSET,
        Math.min(MAX_OFFSET, (event.clientY - centerY) * 0.08)
      );
    }

    function loop() {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      EYE_POSITION.forEach((pos, index) => {
        eyeRefs.current[index]?.setAttribute("cx", String(pos.x + current.x));
        eyeRefs.current[index]?.setAttribute("cy", String(pos.y + current.y));
      });
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", handleMouseMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <motion.div
      ref={wrapperRef}
      className={className}
      animate={
        reduceMotion ? undefined : { y: [0, -8, 0], scaleY: [1, 1.08, 1] }
      }
      transition={{
        duration: 2.8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "top center" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="231"
        height="289"
        viewBox="0 0 231 289"
        className="h-auto w-full text-slate-900 dark:text-slate-100"
      >
        <defs>
          <clipPath id={clipId}>
            <path d="M230.809 115.385V249.411C230.809 269.923 214.985 287.282 194.495 288.411C184.544 288.949 175.364 285.718 168.26 280C159.746 273.154 147.769 273.461 139.178 280.23C132.638 285.384 124.381 288.462 115.379 288.462C106.377 288.462 98.1451 285.384 91.6055 280.23C82.912 273.385 70.9353 273.385 62.2415 280.23C55.7532 285.334 47.598 288.411 38.7246 288.462C17.4132 288.615 0 270.667 0 249.359V115.385C0 51.6667 51.6756 0 115.404 0C179.134 0 230.809 51.6667 230.809 115.385Z" />
          </clipPath>
        </defs>

        <foreignObject width="231" height="289" clipPath={`url(#${clipId})`}>
          <div className="relative h-full w-full overflow-hidden bg-[#0d9488]">
            {BLOBS.map((blob, index) => (
              <div
                key={index}
                className="animate-drift absolute rounded-full"
                style={{
                  left: `${blob.left}%`,
                  top: `${blob.top}%`,
                  width: `${blob.size}%`,
                  height: `${blob.size}%`,
                  background: `radial-gradient(circle at 50% 50%, ${colors[blob.color]} 0%, transparent 68%)`,
                  animationDuration: `${blob.duration}s`,
                  animationDelay: `${index * -1.4}s`,
                }}
              />
            ))}
          </div>
        </foreignObject>

        <ellipse
          ref={(node) => {
            eyeRefs.current[0] = node;
          }}
          cx="80"
          cy="120"
          rx="20"
          ry="30"
          fill="currentColor"
          className="animate-blink"
        />
        <ellipse
          ref={(node) => {
            eyeRefs.current[1] = node;
          }}
          cx="150"
          cy="120"
          rx="20"
          ry="30"
          fill="currentColor"
          className="animate-blink"
        />
      </svg>
    </motion.div>
  );
}

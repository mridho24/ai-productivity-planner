"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

const LIGHT_COLORS = ["#99F6E4", "#5EEAD4", "#2DD4BF", "#134E4A", "#CCFBF1"];
const DARK_COLORS = ["#5EEAD4", "#2DD4BF", "#0D9488", "#042F2E", "#14B8A6"];

const MAX_OFFSET = 8;
const EYE_POSITION: { x: number; y: number }[] = [
  { x: 80, y: 120 },
  { x: 150, y: 120 },
];

export function MeshGradientSVG({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const clipId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduceMotion) return;

    let raf = 0;
    function handleMouseMove(event: MouseEvent) {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (event.clientX - centerX) * 0.08;
      const deltaY = (event.clientY - centerY) * 0.08;

      raf = requestAnimationFrame(() => {
        setEyeOffset({
          x: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, deltaX)),
          y: Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, deltaY)),
        });
      });
    }

    window.addEventListener("mousemove", handleMouseMove);
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
        reduceMotion
          ? undefined
          : { y: [0, -8, 0], scaleY: [1, 1.08, 1] }
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
          <div className="h-full w-full">
            <MeshGradient colors={colors} className="h-full w-full" speed={1} />
          </div>
        </foreignObject>

        <motion.ellipse
          rx="20"
          ry="30"
          fill="currentColor"
          className="animate-blink"
          animate={
            reduceMotion
              ? undefined
              : {
                  cx: EYE_POSITION[0].x + eyeOffset.x,
                  cy: EYE_POSITION[0].y + eyeOffset.y,
                }
          }
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        />
        <motion.ellipse
          rx="20"
          ry="30"
          fill="currentColor"
          className="animate-blink"
          animate={
            reduceMotion
              ? undefined
              : {
                  cx: EYE_POSITION[1].x + eyeOffset.x,
                  cy: EYE_POSITION[1].y + eyeOffset.y,
                }
          }
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        />
      </svg>
    </motion.div>
  );
}

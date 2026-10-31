// Adapted from Magic UI (MIT). See THIRD_PARTY_NOTICES.md.
import { motion, useReducedMotion } from "motion/react";

export function BorderBeam({
  paused = false,
  color = "#8c64cd",
  duration = 7,
}: {
  paused?: boolean;
  color?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="border-beam" aria-hidden="true">
      <motion.div
        style={{
          width: 100,
          offsetPath: "rect(0 auto auto 0 round 100px)",
          background: `linear-gradient(to left,${color},transparent)`,
        }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: paused || reduced ? "30%" : ["0%", "100%"] }}
        transition={{
          repeat: paused || reduced ? 0 : Infinity,
          ease: "linear",
          duration: paused || reduced ? 0 : duration,
        }}
      />
    </div>
  );
}

import { type ReactNode, type CSSProperties, type PointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

export function GlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(-500),
    y = useMotionValue(-500);
  const glow = useMotionTemplate`radial-gradient(400px circle at ${x}px ${y}px, rgba(164,126,225,.11), transparent 75%)`;
  const reduced = useReducedMotion();
  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }
  return (
    <div
      className={`glow-card ${className}`}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(-500);
        y.set(-500);
      }}
    >
      <motion.div
        aria-hidden="true"
        className="card-spotlight"
        style={{ background: glow }}
      />
      {children}
    </div>
  );
}

export function MagneticLink({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  const x = useSpring(0, { stiffness: 300, damping: 20 }),
    y = useSpring(0, { stiffness: 300, damping: 20 });
  const reduced = useReducedMotion();
  return (
    <motion.a
      href={href}
      className={className}
      style={{ x, y }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const r = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - r.left - r.width / 2) * 0.12);
        y.set((event.clientY - r.top - r.height / 2) * 0.12);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.a>
  );
}

export function Waveform({ active = false }: { active?: boolean }) {
  return (
    <span className={`waveform ${active ? "active" : ""}`} aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--bar": `${9 + ((i * 23) % 35)}px`,
              "--delay": `${-(i % 7) * 0.18}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

// Adapted from Magic UI (MIT). See THIRD_PARTY_NOTICES.md.
import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

export function NumberTicker({
  value,
  startValue = 0,
}: {
  value: number;
  startValue?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(startValue);
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (visible) motionValue.set(value);
  }, [visible, value, motionValue]);
  useEffect(() => {
    if (reduced && ref.current)
      ref.current.textContent = value.toLocaleString("en-IN");
    return spring.on("change", (latest) => {
      if (ref.current && !reduced)
        ref.current.textContent = Math.round(latest).toLocaleString("en-IN");
    });
  }, [spring, reduced, value]);
  return (
    <span ref={ref} aria-hidden="true">
      {value.toLocaleString("en-IN")}
    </span>
  );
}

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "./button";
import "./text-effects.css";

// Adapted from the 21st.dev animated Hero rotating-word pattern.
const words = ["Price.", "Availability.", "Delivery."];

export function Hero({ paused = false }: { paused?: boolean }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const still = paused || !!reducedMotion;

  useEffect(() => {
    if (still) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % words.length), 2000);
    return () => window.clearInterval(timer);
  }, [still]);

  return (
    <div className="text-effects-hero">
      <div>
        <h2>
          <span className="text-effects-sr-only">One brief. Price. Availability. Delivery.</span>
          <span aria-hidden="true">One brief. <span className="text-effects-word">
            {still ? words[index] : <AnimatePresence mode="wait" initial={false}>
              <motion.span key={words[index]} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}>
                {words[index]}
              </motion.span>
            </AnimatePresence>}
          </span></span>
        </h2>
        <p>Share your brief and shop contacts. Sauda helps you gather the details; you decide what to buy.</p>
      </div>
      <div className="text-effects-actions">
        <Button asChild variant="outline" size="lg"><a href="#/workspace">Open workspace <ArrowUpRight size={16} aria-hidden="true" /></a></Button>
        <Button asChild variant="ghost" size="lg"><a href="#playground">Try the playground <ArrowDown size={16} aria-hidden="true" /></a></Button>
      </div>
    </div>
  );
}

export default Hero;

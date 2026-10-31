import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import "./text-effects.css";

// Adapted from the 21st.dev EncryptedText component.
export interface EncryptedTextProps {
  text: string;
  className?: string;
  revealDelayMs?: number;
  flipDelayMs?: number;
  charset?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
  paused?: boolean;
}

export function EncryptedText({
  text,
  className,
  revealDelayMs = 50,
  flipDelayMs = 50,
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?",
  encryptedClassName,
  revealedClassName,
  paused = false,
}: EncryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();
  const [revealCount, setRevealCount] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const characters = Array.from(text);
  const alphabet = Array.from(charset);
  const still = paused || !!reducedMotion || alphabet.length === 0;

  useEffect(() => {
    setRevealCount(0);
    setScrambled([]);
  }, [text, charset]);

  useEffect(() => {
    if (!inView || still || !text || revealCount >= Array.from(text).length) return;
    const timer = window.setTimeout(() => setRevealCount((count) => count + 1), revealDelayMs);
    return () => window.clearTimeout(timer);
  }, [inView, still, text, charset, revealDelayMs, revealCount]);

  useEffect(() => {
    const characters = Array.from(text);
    const alphabet = Array.from(charset);
    if (!inView || still || !text || revealCount >= characters.length) return;
    const flip = () => setScrambled(characters.map((character, index) =>
      index < revealCount || /\s/u.test(character)
        ? character
        : alphabet[Math.floor(Math.random() * alphabet.length)],
    ));
    flip();
    const timer = window.setInterval(flip, flipDelayMs);
    return () => window.clearInterval(timer);
  }, [inView, still, text, charset, revealCount, flipDelayMs]);

  return (
    <span ref={ref} className={className}>
      <span className="text-effects-sr-only">{text}</span>
      <span aria-hidden="true">{characters.map((character, index) => {
        const revealed = still || index < revealCount;
        return <span className={revealed ? revealedClassName : encryptedClassName} key={index}>{revealed ? character : scrambled[index] ?? character}</span>;
      })}</span>
    </span>
  );
}

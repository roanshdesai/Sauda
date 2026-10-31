import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { Liquid } from "liquid-gooey";
import { VoiceBeam } from "voice-glow";
import { BorderBeam } from "border-beam";
import { SaudaMark } from "./components/Brand";
import SculptureHero from "./components/ui/liquid-sculpture-hero";
import { EncryptedText } from "./components/ui/encrypted-text";
import { Hero } from "./components/ui/animated-hero";
import AsciiSilk from "./components/ui/ascii-silk";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./landing.css";

const examples = [
  { label: "Birthday watches", item: "32 children's watches", quantity: 32, budget: 844, min: 300, max: 1500, step: 1, detail: "Delivery by 3 November" },
  { label: "Wedding kurtas", item: "5 green kurtas", quantity: 5, budget: 5000, min: 1500, max: 7000, step: 100, detail: "Size 38, local pickup" },
  { label: "Party favours", item: "24 cotton gift bags", quantity: 24, budget: 200, min: 100, max: 400, step: 10, detail: "Delivery quoted separately" },
];
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const faqs = [
  ["What can I ask Sauda to buy?", "Share the product, quantity, budget, deadline and shop contacts. Sauda is designed to ask about availability, price and delivery. It does not buy anything for you."],
  ["Does Sauda find the shops?", "Not yet. This version uses contacts you provide. Live calling is currently limited to verified, consenting test recipients."],
  ["Can it go over my budget?", "Your brief sets the spending ceiling and whether delivery must fit inside it. The workspace flags quotes that exceed your constraints or need confirmation."],
  ["Does it work in my language?", "English, Hindi and Hinglish are configured language choices. The latest language prompt passed text checks, but phone and audio behaviour still needs a fresh test."],
  ["Are these real quotes?", "No. The playground is a text simulation with example numbers, not merchant quotes. The workspace uses the real API for saved requests and available test-call results."],
];

function Brand() {
  return <span className="landing-brand"><SaudaMark /> sauda</span>;
}

function Playground({ motionPaused }: { motionPaused: boolean }) {
  const reduced = useReducedMotion();
  const [selection, setSelection] = useState(0);
  const [budget, setBudget] = useState(examples[0].budget);
  const [language, setLanguage] = useState("English");
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const example = examples[selection];
  const opening = Math.round(budget * 0.82);
  const counter = Math.round(budget * 0.94);
  const messages = language === "हिन्दी" ? [
    `नमस्ते, ${example.quantity} पीस के लिए ${money(opening)} प्रति पीस हो सकता है?`,
    `उदाहरण के लिए, ${money(counter)} प्रति पीस हो सकता है।`,
    "क्या आप उपलब्धता और डिलीवरी की जानकारी बता सकते हैं?",
    "ज़रूर, कृपया सारी जानकारी की पुष्टि कर लें।",
  ] : language === "Hinglish" ? [
    `Namaste, ${example.quantity} pieces ke liye ${money(opening)} each ho sakta hai?`,
    `Example ke liye, ${money(counter)} each ho sakta hai.`,
    "Availability aur delivery details bata sakte hain?",
    "Zaroor, please saari details confirm kar lena.",
  ] : [
    `Hello, could you do ${money(opening)} each for ${example.quantity} pieces?`,
    `As an example, I could offer ${money(counter)} each.`,
    "Could you also confirm availability and delivery details?",
    "Of course. Please check all the details before deciding.",
  ];
  useEffect(() => {
    if (!playing) return;
    if (stage >= messages.length) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setStage((current) => current + 1), 1150);
    return () => window.clearTimeout(timer);
  }, [playing, stage, messages.length]);
  function reset() { setPlaying(false); setStage(0); }
  function choose(index: number) { setSelection(index); setBudget(examples[index].budget); reset(); }
  function start() {
    if (playing) { setPlaying(false); return; }
    if (reduced || motionPaused) { setStage(messages.length); setPlaying(false); return; }
    if (stage === messages.length) setStage(0);
    setPlaying(true);
  }
  const level = () => 0.42 + 0.23 * Math.sin(Date.now() / 220) + 0.1 * Math.sin(Date.now() / 73);
  return (
    <section className="landing-playground landing-shell" id="playground">
      <div className="play-intro">
        <h2>Try a little<br />talking shop.</h2>
        <p>Pick an example, set a budget, and see how a conversation could unfold. No calls are made.</p>
      </div>
      <div className="play-layout">
        <div className="play-setup">
          <p className="play-label">Choose an example</p>
          <Liquid className="scenario-control" fill="#151514" aria-label="Example shopping scenarios">
            <Liquid.Item effect="move" move={{ stretch: 0.6, trail: 0.35 }} className="scenario-indicator-wrap">
              <span className="scenario-indicator" style={{ transform: `translateX(${selection * 100}%)`, transition: reduced || motionPaused ? "none" : undefined }} />
            </Liquid.Item>
            {examples.map((item, index) => <button type="button" key={item.label} aria-pressed={selection === index} onClick={() => choose(index)}>{item.label}</button>)}
          </Liquid>
          <div className="brief-summary"><span>EXAMPLE BRIEF</span><h3>{example.item}</h3><p>{example.detail}</p></div>
          <div className="budget-head"><label htmlFor="example-budget">Maximum per item</label><strong>{money(budget)}</strong></div>
          <input id="example-budget" className="budget-range" type="range" min={example.min} max={example.max} step={example.step} value={budget} onChange={(event) => { setBudget(Number(event.target.value)); reset(); }} />
          <div className="range-ends"><span>{money(example.min)}</span><span>{money(example.max)}</span></div>
          <label className="language-label" htmlFor="example-language">Conversation language</label>
          <select id="example-language" value={language} onChange={(event) => { setLanguage(event.target.value); reset(); }}><option>English</option><option>हिन्दी</option><option>Hinglish</option></select>
          <p className="example-note">Example figures only. Not a merchant quote.</p>
        </div>
        <div className="play-conversation">
          <div className="conversation-heading"><div><span>TEXT SIMULATION</span><h3>A possible conversation</h3></div><span className="no-call">No audio or calls</span></div>
          <VoiceBeam level={level} active={playing && !motionPaused && !reduced} paused={!playing || motionPaused || !!reduced} colorVariant="mono" theme="auto">
            <div className="conversation-body">
              {stage === 0 ? <p className="conversation-empty">Your example conversation will appear here. Press play to begin.</p> : <div className="conversation-lines" aria-live="polite">{messages.slice(0, stage).map((message, index) => <div className={`conversation-line ${index % 2 === 0 ? "from-sauda" : "from-shop"}`} key={index}><span>{index % 2 === 0 ? "SAUDA" : "SHOP · EXAMPLE"}</span><p>{message}</p></div>)}</div>}
            </div>
          </VoiceBeam>
          <div className="conversation-actions"><span role="status">{playing ? "Playing example" : stage === messages.length ? "Example complete" : stage ? "Example paused" : "Ready when you are"}</span><div><button type="button" className="reset-button" onClick={reset} aria-label="Reset example"><RotateCcw size={16} /> Reset</button><button type="button" className="play-button" onClick={start}>{playing ? <Pause size={15} /> : <Play size={15} fill="currentColor" />} {playing ? "Pause" : stage === messages.length ? "Replay" : stage ? "Resume" : "Play example"}</button></div></div>
        </div>
      </div>
    </section>
  );
}

function FinalAction({ motionPaused }: { motionPaused: boolean }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  return <div className="final-action" onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)} onFocus={() => setActive(true)} onBlur={() => setActive(false)}><BorderBeam size="pulse-inner" colorVariant="mono" theme="dark" active={active && !motionPaused && !reduced} style={{ display: "inline-block" }}><a className="landing-button" href="#/workspace">Open workspace <ArrowUpRight size={18} /></a></BorderBeam></div>;
}

export default function Landing() {
  const reduced = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const still = motionPaused || !!reduced;
  const reveal = { initial: still ? false as const : { opacity: 0, y: 25 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: still ? 0 : 0.6 } };
  return (
    <div className="landing" data-theme={theme}>
      <a className="landing-skip" href="#main">Skip to content</a>
      <main id="main">
        <SculptureHero
          brand="sauda"
          navLinks={[
            { label: "Playground", href: "#playground" },
            { label: "Approach", href: "#built-for-you" },
            { label: "Questions", href: "#questions" },
          ]}
          navCta={{ label: "Workspace", href: "#/workspace" }}
          navExtra={
            <button
              className="sh-theme landing-motion"
              type="button"
              onClick={() => setMotionPaused((value) => !value)}
              aria-pressed={motionPaused}
              aria-label={motionPaused ? "Resume visuals" : "Pause visuals"}
              title={motionPaused ? "Resume visuals" : "Pause visuals"}
            >
              {motionPaused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          }
          eyebrow="YOUR INTENT. A VOICE OF ITS OWN."
          headline={"Voice agents.\nReimagined"}
          headlineAccent="Reimagined"
          body="Tell Sauda what you’re looking for. Set your terms. Let a voice agent ask about price, availability and delivery — while you keep the final say."
          primaryCta={{ label: "Create a brief", href: "#/workspace" }}
          secondaryCta={{ label: "Explore the playground", href: "#playground" }}
          backdropText="sauda"
          background="#EBE9E5"
          darkBackground="#111110"
          theme={theme}
          onThemeChange={setTheme}
          loadFonts={false}
          paused={still}
          mobileSculptureScale={0.85}
          hint="Move across the form"
          hintTouch="Touch the form"
        />
        <section className="landing-manifesto"><div className="landing-shell"><Hero paused={still} /></div></section>
        <motion.div {...reveal}><Playground motionPaused={still} /></motion.div>
        <motion.section {...reveal} className="landing-story landing-shell" id="built-for-you">
          <div className="story-signal">
            <AsciiSilk paused={still} />
            <div className="signal-caption">
              <span>PROCEDURAL STUDY / 001</span>
              <p><EncryptedText text="From intent to conversation." paused={still} revealDelayMs={35} /></p>
              <span>Silk · Voxel · No audio input</span>
            </div>
          </div>
          <div className="story-copy">
            <span className="landing-eyebrow"><EncryptedText text="THE HUMAN STAYS IN THE LOOP" paused={still} /></span>
            <h2>You choose.<br /><em>Sauda asks.</em></h2>
            <p>One clear brief. A conversation on your terms. Every detail back with you, ready to review.</p>
            <div className="story-steps">
              <div><h3>01 / Set your brief</h3><p>The item, the budget, the deadline and the shop contacts you provide.</p></div>
              <div><h3>02 / Give it a voice</h3><p>English, Hindi or Hinglish. Calls require configured access and explicit recipient consent.</p></div>
              <div><h3>03 / Keep the final say</h3><p>Review quote details and available transcript evidence. Nothing is purchased automatically.</p></div>
            </div>
          </div>
        </motion.section>
        <motion.section {...reveal} className="landing-faq landing-shell" id="questions"><div><h2>Good questions.<br /><span>Clear answers.</span></h2><p>The details before you get started.</p></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<Plus className="faq-plus" size={19} /><Minus className="faq-minus" size={19} /></summary><p>{answer}</p></details>)}</div></motion.section>
        <motion.section {...reveal} className="landing-closing landing-shell"><p>Less chasing. More choosing.</p><h2>Ready to talk<br /><span>shop?</span></h2><FinalAction motionPaused={still} /><ArrowRight className="closing-arrow" size={38} aria-hidden="true" /></motion.section>
      </main>
      <footer className="landing-footer landing-shell"><a href="#" aria-label="Sauda home"><Brand /></a><p>Quote-only, always.</p><span>© {new Date().getFullYear()} Sauda</span><a href="#/workspace">Open workspace <ArrowUpRight size={14} /></a></footer>
    </div>
  );
}

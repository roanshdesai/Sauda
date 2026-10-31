import { SaudaMark } from "./components/Brand";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { ThinkingOrb } from "thinking-orbs";
import { MetalFx } from "metal-fx";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  FileText,
  Gift,
  Headphones,
  Languages,
  LockKeyhole,
  Menu,
  Minus,
  Pause,
  Phone,
  Play,
  Plus,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Truck,
  Watch,
  X,
  Zap,
} from "lucide-react";
import { BlurFade } from "./components/BlurFade";
import { NumberTicker } from "./components/NumberTicker";
import { AnimatedBeam } from "./components/AnimatedBeam";
import { BorderBeam } from "./components/BorderBeam";
import { GlowCard, MagneticLink, Waveform } from "./components/Surfaces";

const examples = [
  {
    label: "Birthday watches",
    item: "32 kids' watches",
    icon: Watch,
    quantity: 32,
    max: 844,
    min: 300,
    limit: 1500,
    step: 1,
    location: "Marine Drive",
    delivery: 0,
    detail: "Any working children's watch. Delivery by 3 November.",
  },
  {
    label: "Wedding kurtas",
    item: "5 green kurtas",
    icon: ShoppingBag,
    quantity: 5,
    max: 5000,
    min: 1500,
    limit: 7000,
    step: 100,
    location: "Breach Candy",
    delivery: 0,
    detail: "Men's size 38. All five ready for local pickup.",
  },
  {
    label: "Party favours",
    item: "24 cotton gift bags",
    icon: Gift,
    quantity: 24,
    max: 200,
    min: 100,
    limit: 400,
    step: 10,
    location: "South Mumbai",
    delivery: 50,
    detail: "Natural cotton. Delivery charges confirmed separately.",
  },
];
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const phrases = [
  {
    label: "English",
    lang: "en",
    text: "Could you do a better price for 32 pieces?",
    reply: "For 32, could you do ₹740 each and include delivery?",
  },
  {
    label: "हिन्दी",
    lang: "hi",
    text: "बत्तीस लेने पर कुछ कम हो सकता है?",
    reply:
      "बत्तीस के लिए प्रति नग सात सौ चालीस रुपये कर दीजिए। पहुँचाने का खर्च भी शामिल होगा?",
  },
  {
    label: "Hinglish",
    lang: "hi-Latn",
    text: "32 pieces chahiye. Best price kya hoga?",
    reply:
      "32 ke liye ₹740 each kar sakte hain? Delivery bhi include kar dijiye.",
  },
];
const faq = [
  [
    "What can I ask Sauda to buy?",
    "Tell Sauda the product, quantity, maximum budget, deadline and the shops to call. It asks about stock, negotiates a quote and confirms delivery or pickup details. Sauda doesn't buy anything—it brings the quote back to you.",
  ],
  [
    "Can it go over my budget?",
    "Your brief defines the spending ceiling and whether delivery must fit inside it. The agent is instructed to start lower and stay within your limit. The workspace flags quotes that exceed your constraints or need confirmation.",
  ],
  [
    "Does it find the shops?",
    "This version uses contacts you provide. Automatic shop discovery isn't available yet. Live calling is currently limited to verified, consenting test recipients.",
  ],
  [
    "Can it speak English, Hindi and Hinglish?",
    "Yes, these are the configured language choices. The agent asks for your preference and is instructed to stick with it. The latest language prompt passed text checks; phone-audio behaviour still needs a fresh test.",
  ],
  [
    "Are the deals on this page real?",
    "The landing-page examples are interactive illustrations, not merchant quotes. Your protected workspace contains saved requests and results from actual completed test calls, with transcripts and review flags.",
  ],
];

function Brand() {
  return (
    <span className="sauda-brand">
      <SaudaMark />
      sauda
    </span>
  );
}

function CallNetwork({ paused }: { paused: boolean }) {
  const container = useRef<HTMLDivElement>(null),
    brief = useRef<HTMLDivElement>(null),
    core = useRef<HTMLDivElement>(null),
    shop = useRef<HTMLDivElement>(null),
    quote = useRef<HTMLDivElement>(null);
  return (
    <div
      className="network-scene"
      ref={container}
      aria-label="Illustration of a shopping brief becoming a negotiated quote"
    >
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-light" aria-hidden="true" />
      <div className="network-label">
        <span className="live-dot" /> THE SAUDA LOOP <span>ILLUSTRATION</span>
      </div>
      <AnimatedBeam
        containerRef={container}
        fromRef={brief}
        toRef={core}
        curvature={-35}
        pathColor="#9d88bf"
        pathOpacity={0.4}
        gradientStartColor="#8e6ccb"
        gradientStopColor="#efa998"
        duration={4}
        paused={paused}
      />
      <AnimatedBeam
        containerRef={container}
        fromRef={core}
        toRef={shop}
        curvature={80}
        pathColor="#9d88bf"
        pathOpacity={0.4}
        gradientStartColor="#8e6ccb"
        gradientStopColor="#efa998"
        delay={1}
        duration={4}
        paused={paused}
      />
      <AnimatedBeam
        containerRef={container}
        fromRef={core}
        toRef={quote}
        curvature={-70}
        pathColor="#9d88bf"
        pathOpacity={0.4}
        gradientStartColor="#8e6ccb"
        gradientStopColor="#efa998"
        delay={2}
        duration={4}
        paused={paused}
      />
      <div className="network-node brief-node" ref={brief}>
        <span className="node-icon">
          <ShoppingBag size={18} />
        </span>
        <div>
          <span>YOUR BRIEF</span>
          <strong>32 birthday watches</strong>
          <p>Up to ₹844 / piece</p>
        </div>
        <span className="node-check">
          <Check size={11} />
        </span>
      </div>
      <div className="agent-core" ref={core}>
        <div className="core-rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="core-orb" aria-hidden="true">
          <ThinkingOrb
            state="weaving"
            size={64}
            theme="light"
            paused={paused}
            speed={0.65}
          />
        </div>
        <div className="core-name">
          sauda<span>LET'S TALK PRICE.</span>
        </div>
      </div>
      <div className="network-node shop-node" ref={shop}>
        <div className="node-head">
          <Store size={17} />
          <span className="example-chip">SHOP 01</span>
        </div>
        <strong>Let's make it ₹740?</strong>
        <Waveform active={!paused} />
        <span className="node-muted">A better opening offer.</span>
      </div>
      <div className="network-node quote-node" ref={quote}>
        <BorderBeam paused={paused} />
        <div className="node-head">
          <span className="quote-dot" /> EXAMPLE QUOTE <CheckCheck size={15} />
        </div>
        <strong>
          ₹790<span>/ watch</span>
        </strong>
        <div className="quote-node-bottom">
          <Truck size={12} /> Delivery included <span>↘</span>
        </div>
      </div>
      <div className="network-mini">
        <LockKeyhole size={12} />
        <span>Your maximum stays private.</span>
      </div>
      <div className="scene-coordinate">BRIEF → CALL → NEGOTIATE → REVIEW</div>
    </div>
  );
}

function DealPlayground({ paused }: { paused: boolean }) {
  const [selection, setSelection] = useState(0),
    [budget, setBudget] = useState(844),
    [stage, setStage] = useState(0),
    [playing, setPlaying] = useState(false);
  const item = examples[selection];
  const opening = Math.floor((budget * 0.88) / 10) * 10;
  const quote = Math.floor((budget * 0.94) / 10) * 10;
  useEffect(() => {
    if (!playing || stage === 3) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStage((s) => Math.min(s + 1, 3)), 1700);
    return () => clearTimeout(timer);
  }, [playing, stage]);
  function select(i: number) {
    setSelection(i);
    setBudget(examples[i].max);
    setStage(0);
    setPlaying(false);
  }
  const conversation = [
    {
      who: "Sauda",
      text: `For ${item.quantity} pieces, could you do ${rupees(opening)} each?`,
    },
    {
      who: "Shopkeeper",
      text: `I can offer ${rupees(quote)} each for the full quantity.`,
    },
    {
      who: "Sauda",
      text:
        selection === 1
          ? "And all five are size 38, ready for pickup?"
          : "Could you include delivery? And confirm the full quantity?",
    },
    {
      who: "Shopkeeper",
      text:
        selection === 1
          ? "Yes, all five are available for pickup."
          : item.delivery
            ? `All ${item.quantity} are available. Delivery is ${rupees(item.delivery)} extra.`
            : `Yes, all ${item.quantity}. Delivery is included.`,
    },
  ];
  return (
    <section className="playground section-shell" id="playground">
      <div className="section-intro">
        <BlurFade inView>
          <span className="section-label">
            <SlidersHorizontal size={13} /> THE DEAL PLAYGROUND
          </span>
          <h2>
            Don't just read about it.
            <br />
            <span>Put it to the test.</span>
          </h2>
        </BlurFade>
        <p>
          Pick a brief. Set a budget.
          <br />
          Watch how the conversation could unfold.
          <br />
          <small>Interactive illustration. No phone call is made.</small>
        </p>
      </div>
      <div className="scenario-tabs" role="group" aria-label="Shopping example">
        {examples.map((example, i) => (
          <button
            key={example.label}
            aria-pressed={selection === i}
            onClick={() => select(i)}
          >
            <example.icon size={17} />
            {example.label}
            {selection === i && (
              <motion.span
                className="scenario-active"
                layoutId="scenario-active"
              />
            )}
          </button>
        ))}
      </div>
      <GlowCard className="deal-console">
        <div className="console-bar">
          <span>
            <i />
            <i />
            <i />
          </span>
          <span>sauda / negotiation-studio</span>
          <span className="simulation-label">SIMULATION</span>
        </div>
        <div className="console-body">
          <div className="brief-controls">
            <div className="section-label">01 / YOUR RULES</div>
            <span className="large-product-icon">
              <item.icon size={28} />
            </span>
            <h3>{item.item}</h3>
            <p>{item.detail}</p>
            <div className="budget-heading">
              <label htmlFor="demo-budget">Maximum per item</label>
              <strong>{rupees(budget)}</strong>
            </div>
            <input
              id="demo-budget"
              type="range"
              min={item.min}
              max={item.limit}
              step={item.step}
              value={budget}
              onChange={(event) => {
                setBudget(Number(event.target.value));
                setStage(0);
                setPlaying(false);
              }}
            />
            <div className="range-labels">
              <span>{rupees(item.min)}</span>
              <span>{rupees(item.limit)}</span>
            </div>
            <div className="brief-total">
              <span>{item.quantity} items · product budget</span>
              <strong>{rupees(budget * item.quantity)}</strong>
            </div>
            <div className="private-note">
              <ShieldCheck size={14} /> Your ceiling isn't the opening offer.
            </div>
            <button
              className="lime-button simulate-button"
              onClick={() => {
                if (stage === 3) setStage(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
              {playing
                ? "Pause example"
                : stage === 3
                  ? "Run it again"
                  : "Start the negotiation"}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="conversation-stage">
            <div className="conversation-heading">
              <span className="section-label">02 / THE CONVERSATION</span>
              <Waveform active={playing && !paused} />
            </div>
            <div className="chat-stack" aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="popLayout">
                {conversation.slice(0, stage + 1).map((message, i) => (
                  <motion.div
                    layout
                    key={`${selection}-${budget}-${i}`}
                    className={`chat-line ${i % 2 ? "merchant" : "agent"}`}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="chat-avatar">
                      {i % 2 ? <Store size={15} /> : <SaudaMark small />}
                    </div>
                    <div>
                      <span>{message.who}</span>
                      <p>{message.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="conversation-controls">
              <span>
                {
                  [
                    "Opening below your ceiling",
                    "Working towards a price",
                    "Checking the details",
                    "Quote collected. Your decision.",
                  ][stage]
                }
              </span>
              <div role="group" aria-label="Conversation steps">
                {[0, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={stage >= n ? "is-done" : ""}
                    aria-current={stage === n ? "step" : undefined}
                    aria-label={`Conversation step ${n + 1}`}
                    onClick={() => {
                      setStage(n);
                      setPlaying(false);
                    }}
                  >
                    {n + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={`result-panel ${stage === 3 ? "complete" : ""}`}>
            <span className="section-label">03 / BACK TO YOU</span>
            <div className="result-icon">
              {stage === 3 ? <CheckCheck size={24} /> : <FileText size={24} />}
            </div>
            <span className="result-caption">
              {stage === 3 ? "Illustrative quote" : "Opening offer"}
            </span>
            <div
              className="result-price"
              aria-label={rupees(stage === 3 ? quote : opening)}
            >
              ₹
              <NumberTicker
                value={stage === 3 ? quote : opening}
                startValue={budget}
                key={`${selection}-${budget}-${stage === 3}`}
              />
            </div>
            <span className="result-unit">per item</span>
            <dl>
              <div>
                <dt>Quantity</dt>
                <dd>{item.quantity}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>
                  {stage === 3
                    ? selection === 1
                      ? "Pickup"
                      : item.delivery
                        ? rupees(item.delivery)
                        : "Included"
                    : "Ask the shop"}
                </dd>
              </div>
              <div>
                <dt>Product total</dt>
                <dd>
                  {stage === 3
                    ? rupees(quote * item.quantity)
                    : "Awaiting quote"}
                </dd>
              </div>
            </dl>
            <div className="result-verdict">
              <ShieldCheck size={13} />
              {stage === 3
                ? "Review before you decide"
                : "No order. No commitment."}
            </div>
            <span className="result-note">
              Example only. Prices are not merchant offers.
            </span>
          </div>
        </div>
      </GlowCard>
    </section>
  );
}

function LanguageCard({ paused }: { paused: boolean }) {
  const [language, setLanguage] = useState(0);
  const phrase = phrases[language];
  return (
    <GlowCard className="feature-language">
      <div className="feature-heading">
        <span className="feature-icon">
          <Languages size={21} />
        </span>
        <span className="feature-index">01 / LANGUAGE</span>
      </div>
      <h3>
        Your language.
        <br />
        Your kind of conversation.
      </h3>
      <p>English, Hindi, Hinglish. Choose the tone that feels like you.</p>
      <div
        className="language-switch"
        role="group"
        aria-label="Language text preview"
      >
        {phrases.map((p, i) => (
          <button
            key={p.label}
            aria-pressed={i === language}
            onClick={() => setLanguage(i)}
          >
            {p.label}
            {i === language && <motion.span layoutId="lang-pill" />}
          </button>
        ))}
      </div>
      <div className="language-preview">
        <AnimatePresence mode="wait">
          <motion.div
            key={language}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: paused ? 0 : 0.2 }}
            lang={phrase.lang}
          >
            <div>
              <span>YOU</span>
              <p>{phrase.text}</p>
            </div>
            <div>
              <span>
                <SaudaMark small /> SAUDA
              </span>
              <p>{phrase.reply}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="micro-caption">TEXT PREVIEW · NO MICROPHONE ACCESS</span>
    </GlowCard>
  );
}

export default function Landing() {
  const reduced = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false),
    [menuOpen, setMenuOpen] = useState(false),
    [openFaq, setOpenFaq] = useState<number | null>(null);
  const paused = !!reduced || motionPaused;
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 35 });
  useEffect(() => {
    if (paused) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 0.9 });
    return () => lenis.destroy();
  }, [paused]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  return (
    <div
      className={`sauda-v2 ${paused ? "motion-paused" : ""}`}
      data-theme="light"
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <motion.div className="page-progress" style={{ scaleX }} />
      <header className="v2-header">
        <a href="#" aria-label="Sauda home">
          <Brand />
        </a>
        <nav className={menuOpen ? "open" : ""} aria-label="Main navigation">
          <a href="#playground" onClick={() => setMenuOpen(false)}>
            Playground
          </a>
          <a href="#built-for-you" onClick={() => setMenuOpen(false)}>
            Why Sauda
          </a>
          <a href="#questions" onClick={() => setMenuOpen(false)}>
            FAQs
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="motion-toggle"
            aria-label={
              motionPaused ? "Resume looping effects" : "Pause looping effects"
            }
            aria-pressed={motionPaused}
            onClick={() => setMotionPaused((p) => !p)}
          >
            {motionPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <a className="header-cta" href="#/workspace">
            Open workspace <ArrowUpRight size={15} />
          </a>
          <button
            className="nav-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="v2-hero section-shell">
          <div className="hero-ambient" aria-hidden="true" />
          <div className="hero-copy">
            <BlurFade delay={0.05}>
              <div className="release-pill">
                <span className="live-dot" /> MADE FOR THE BOLNA BUILDATHON{" "}
                <ChevronRight size={12} />
              </div>
            </BlurFade>
            <BlurFade delay={0.15} offset={14}>
              <h1>
                You shop.
                <br />
                We <span>bargain.</span>
                <svg viewBox="0 0 460 25" aria-hidden="true">
                  <motion.path
                    d="M4 19 Q200 -8 452 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: paused ? 0 : 0.8 }}
                  />
                </svg>
              </h1>
            </BlurFade>
            <BlurFade delay={0.25}>
              <p>
                Your shopping list deserves a better price.
                <br />
                Sauda calls the shops, does the back-and-forth,
                <br className="desktop-break" /> and brings the deal back to
                you.
              </p>
              <div className="hero-buttons">
                <MetalFx
                  preset="silver"
                  theme="light"
                  strength={0.65}
                  paused={paused}
                >
                  <MagneticLink href="#/workspace" className="lime-button">
                    Find my better deal <ArrowUpRight size={18} />
                  </MagneticLink>
                </MetalFx>
                <a className="secondary-link" href="#playground">
                  <span>
                    <Play size={11} fill="currentColor" />
                  </span>{" "}
                  Try the playground
                </a>
              </div>
              <div className="hero-assurances">
                <span>
                  <Check size={12} /> Your budget
                </span>
                <span>
                  <Check size={12} /> Your language
                </span>
                <span>
                  <Check size={12} /> Your final say
                </span>
              </div>
            </BlurFade>
          </div>
          <BlurFade delay={0.25} className="hero-network">
            <CallNetwork paused={paused} />
          </BlurFade>
          <div className="hero-bottom">
            <span>
              <Headphones size={14} /> LESS CALLING AROUND. MORE GETTING ON WITH
              LIFE.
            </span>
            <a href="#playground">
              SCROLL TO MAKE A DEAL <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <div className="capability-strip">
          <div>
            {[
              "REAL VOICE CALLS",
              "A BETTER OPENING OFFER",
              "DELIVERY DETAILS",
              "ENGLISH · हिन्दी · HINGLISH",
              "YOUR FINAL SAY",
            ].map((text) => (
              <span key={text}>
                <span className="strip-diamond">✦</span>
                {text}
              </span>
            ))}
          </div>
        </div>
        <DealPlayground paused={paused} />
        <section className="features section-shell" id="built-for-you">
          <BlurFade inView>
            <span className="section-label">
              <Sparkles size={13} /> BUILT FOR THE WAY YOU SHOP
            </span>
            <h2>
              A little less chasing.
              <br />
              <span>A lot more control.</span>
            </h2>
          </BlurFade>
          <div className="feature-grid">
            <LanguageCard paused={paused} />
            <GlowCard className="feature-budget">
              <div className="feature-heading">
                <span className="feature-icon">
                  <LockKeyhole size={21} />
                </span>
                <span className="feature-index">02 / BUDGET</span>
              </div>
              <h3>
                A ceiling.
                <br />
                Not a starting price.
              </h3>
              <p>
                Sauda opens below your maximum and leaves room to negotiate.
              </p>
              <div className="budget-visual">
                <div>
                  <span>SAUDA'S OPENING</span>
                  <strong>₹4,400</strong>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 0.88 }}
                    viewport={{ once: true }}
                    transition={{ duration: paused ? 0 : 1 }}
                  />
                </div>
                <div>
                  <span>YOUR PRIVATE LIMIT</span>
                  <strong>₹5,000</strong>
                  <div />
                </div>
              </div>
              <span className="micro-caption">ILLUSTRATIVE PRICE STRATEGY</span>
              <BorderBeam paused={paused} duration={10} />
            </GlowCard>
            <GlowCard className="feature-delivery">
              <div className="feature-heading">
                <span className="feature-icon">
                  <Truck size={21} />
                </span>
                <span className="feature-index">03 / THE DETAILS</span>
              </div>
              <h3>
                “And delivery?”
                <br />
                Already on the list.
              </h3>
              <p>
                The price is only part of the story. Quantity, availability and
                delivery get their own questions.
              </p>
              <div className="check-stack">
                {[
                  "All 32 available?",
                  "Delivery to Marine Drive?",
                  "Can you waive the fee?",
                  "Ready by 3 November?",
                ].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.15,
                      duration: paused ? 0 : 0.35,
                    }}
                  >
                    <span>
                      <Check size={12} />
                    </span>
                    {label}
                    <span className="check-tick">0{i + 1}</span>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
            <GlowCard className="feature-evidence">
              <div>
                <div className="feature-heading">
                  <span className="feature-icon">
                    <FileText size={21} />
                  </span>
                  <span className="feature-index">04 / NO GUESSWORK</span>
                </div>
                <h3>
                  The quote.
                  <br />
                  And what was actually said.
                </h3>
                <p>
                  Review the transcript, item price, delivery charges and
                  missing details before you decide.
                </p>
                <a href="#/workspace" className="inline-link">
                  Go to your quote workspace <ArrowUpRight size={15} />
                </a>
              </div>
              <div className="evidence-art">
                <div className="evidence-card rear">
                  <span>CALL TRANSCRIPT</span>
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="evidence-card front">
                  <div>
                    <FileText size={17} />
                    <span>QUOTE EVIDENCE</span>
                    <CheckCheck size={14} />
                  </div>
                  <strong>
                    ₹790 <span>/ item</span>
                  </strong>
                  <p>“₹790 each for the full quantity.”</p>
                  <span className="review-pill">
                    <span /> Ready for your review
                  </span>
                  <small>ILLUSTRATION</small>
                </div>
              </div>
            </GlowCard>
          </div>
        </section>
        <section className="how-flow section-shell">
          <div>
            <span className="section-label">
              <Zap size={13} /> YOUR PART IS THE EASY PART
            </span>
            <h2>
              Three steps.
              <br />
              <span>Zero awkward haggling.</span>
            </h2>
          </div>
          <div className="flow-steps">
            {[
              {
                n: "01",
                icon: ShoppingBag,
                title: "Set the brief.",
                body: "What you need. How many. Your budget, deadline and shop contacts.",
              },
              {
                n: "02",
                icon: Phone,
                title: "Let Sauda talk.",
                body: "Stock checks, opening offers, counteroffers and the follow-up questions.",
              },
              {
                n: "03",
                icon: CheckCheck,
                title: "Make the final call.",
                body: "Review the quote and its evidence. Nothing is ordered automatically.",
              },
            ].map((step, i) => (
              <BlurFade key={step.n} inView delay={i * 0.1}>
                <article>
                  <span className="flow-number">{step.n}</span>
                  <span className="flow-icon">
                    <step.icon size={22} />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              </BlurFade>
            ))}
          </div>
        </section>
        <section className="v2-faq section-shell" id="questions">
          <div>
            <span className="section-label">
              <CircleHelp size={13} /> GOOD QUESTIONS
            </span>
            <h2>
              Before we
              <br />
              <span>talk shop.</span>
            </h2>
            <p>A few things worth knowing.</p>
          </div>
          <div>
            {faq.map(([question, answer], i) => (
              <div className="faq-item" key={question}>
                <h3>
                  <button
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {question}
                    {openFaq === i ? <Minus size={17} /> : <Plus size={17} />}
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      role="region"
                      aria-label={question}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: paused ? 0 : 0.25 }}
                    >
                      <p>{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
        <section className="final-cta section-shell">
          <GlowCard>
            <div className="cta-grid" aria-hidden="true" />
            <span className="section-label">
              <span className="live-dot" /> YOUR NEXT DEAL STARTS HERE
            </span>
            <h2>
              You've got a list.
              <br />
              We've got <span>the conversation.</span>
            </h2>
            <MagneticLink href="#/workspace" className="lime-button">
              Let's talk price <ArrowUpRight size={18} />
            </MagneticLink>
            <p>Buildathon preview · Workspace access code required</p>
            <BorderBeam paused={paused} duration={12} />
          </GlowCard>
        </section>
      </main>
      <footer className="v2-footer section-shell">
        <a href="#" aria-label="Back to top">
          <Brand />
        </a>
        <span>A little conversation. A better deal.</span>
        <div>
          <span>BUILT WITH BOLNA</span>
          <a href="#/workspace">
            Workspace <ArrowUpRight size={13} />
          </a>
        </div>
        <small>© {new Date().getFullYear()} Sauda · Quote-only, always.</small>
      </footer>
    </div>
  );
}

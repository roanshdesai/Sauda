import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CircleHelp,
  Gift,
  Headphones,
  MapPin,
  Menu,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Watch,
  X,
} from "lucide-react";
import { BlurFade } from "./components/BlurFade";
import { NumberTicker } from "./components/NumberTicker";

const cases = [
  {
    name: "Wedding kurtas",
    icon: ShoppingBag,
    item: "Green men's kurtas",
    quantity: 5,
    detail: "Size 38 · pickup near Breach Candy",
    budget: 5000,
    opening: 4400,
    final: 4600,
    delivery: 0,
    ask: "I need five green kurtas, size 38. Can you do ₹4,400 each?",
    reply: "For five pieces, my best is ₹4,600 each.",
    follow: "And all five are available for pickup tomorrow?",
    confirmation: "Yes. All five, size 38, ready tomorrow.",
  },
  {
    name: "Birthday watches",
    icon: Watch,
    item: "Children's character watches",
    quantity: 32,
    detail: "Working watches · delivery to Marine Drive",
    budget: 844,
    opening: 740,
    final: 790,
    delivery: 0,
    ask: "For 32 children's watches, could you do ₹740 each and include delivery?",
    reply: "I can do ₹790 each for the full quantity.",
    follow: "Can you include delivery to Marine Drive by 3 November?",
    confirmation: "Yes, delivery is included in that quote.",
  },
  {
    name: "Party favours",
    icon: Gift,
    item: "Cotton gift bags",
    quantity: 24,
    detail: "Natural cotton · delivery to South Mumbai",
    budget: 200,
    opening: 170,
    final: 180,
    delivery: 50,
    ask: "I need 24 cotton gift bags. Could we start at ₹170 a bag?",
    reply: "₹180 each is the best I can offer.",
    follow: "Could you waive delivery? If not, what would it cost?",
    confirmation: "Delivery will be ₹50 for the whole order.",
  },
];
const languages = [
  {
    label: "English",
    lang: "en",
    headline: "A better price, please.",
    customer: "Could you do a better price for five?",
    agent: "Would ₹4,400 each work for five pieces?",
  },
  {
    label: "हिन्दी",
    lang: "hi",
    headline: "थोड़ा कम हो जाएगा?",
    customer: "पाँच लेने पर कुछ कम हो सकता है?",
    agent: "पाँच के लिए प्रति नग चार हज़ार चार सौ रुपये हो सकता है?",
  },
  {
    label: "Hinglish",
    lang: "hi-Latn",
    headline: "Bhaiya, best price?",
    customer: "Five pieces chahiye, thoda better price milega?",
    agent: "Five pieces ke liye ₹4,400 each kar sakte hain?",
  },
];
const faqs = [
  [
    "What exactly does Sauda do?",
    "You create a shopping brief with the item, quantity, budget, deadline and shop contacts. Sauda calls approved contacts, asks about availability, negotiates a quote, and brings the conversation back for you to review.",
  ],
  [
    "Will it buy something without asking me?",
    "No. Sauda collects quotes. It cannot place an order, make a payment or commit you to a purchase. You review the price, delivery charges and any missing details before contacting the shop yourself.",
  ],
  [
    "Does it find shops for me?",
    "This version works with shop contacts you provide. Automatic shop discovery is not available yet. The Buildathon workspace currently supports consented roleplay tests with verified recipients.",
  ],
  [
    "Can I use English, Hindi or Hinglish?",
    "The agent asks for a language preference at the start and is configured to stay with that choice. The latest language prompt has passed text tests; its phone-audio behaviour still needs a fresh check.",
  ],
  [
    "Are the prices on this page real quotes?",
    "The interactive examples are illustrations, not shop offers. Inside your workspace, quotes from completed calls include the transcript, delivery details and any information that still needs confirmation.",
  ],
];

function Wordmark() {
  return (
    <span className="editorial-wordmark">
      <span className="sun-mark" aria-hidden="true">
        ✳
      </span>{" "}
      sauda<span className="wordmark-period">.</span>
    </span>
  );
}
function Wave({ small = false }: { small?: boolean }) {
  return (
    <span
      className={"sound-wave" + (small ? " compact" : "")}
      aria-hidden="true"
    >
      {Array.from({ length: small ? 13 : 39 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--height": `${12 + ((i * 17 + 11) % 47)}px`,
              "--delay": `${(i % 7) * -0.17}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

function Example() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = cases[index];
  useEffect(() => {
    if (!playing) return;
    if (step >= 3) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 1900);
    return () => clearTimeout(timer);
  }, [playing, step]);
  const messages = [
    current.ask,
    current.reply,
    current.follow,
    current.confirmation,
  ];
  return (
    <section
      className="example-section section-wrap"
      id="in-action"
      aria-labelledby="example-title"
    >
      <BlurFade inView>
        <div className="section-topline">
          <span>01 / A LITTLE BACK-AND-FORTH</span>
          <span>
            AN INTERACTIVE EXAMPLE <span className="tiny-star">✳</span>
          </span>
        </div>
      </BlurFade>
      <div className="example-heading">
        <BlurFade inView>
          <h2 id="example-title">
            The first price
            <br />
            is just the <em>hello.</em>
          </h2>
        </BlurFade>
        <BlurFade inView delay={0.1}>
          <p>
            A good deal starts with the right questions.
            <br />
            Watch a shopping brief become a conversation.
            <br />
            <span className="example-disclaimer">
              Illustrative prices. No live call or order.
            </span>
          </p>
        </BlurFade>
      </div>
      <div className="case-tabs" role="group" aria-label="Choose an example">
        {cases.map((item, i) => (
          <button
            key={item.name}
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i);
              setStep(0);
              setPlaying(false);
            }}
          >
            <item.icon size={17} />
            {item.name}
            {i === index && (
              <motion.span
                layoutId="case-underline"
                className="case-underline"
              />
            )}
          </button>
        ))}
      </div>
      <div className="example-desk">
        <div className="brief-sheet">
          <span className="mono-label">YOUR SHOPPING BRIEF</span>
          <current.icon size={32} strokeWidth={1.25} className="brief-icon" />
          <h3>{current.item}</h3>
          <p>{current.detail}</p>
          <dl>
            <div>
              <dt>Quantity</dt>
              <dd>{current.quantity} pieces</dd>
            </div>
            <div>
              <dt>Your maximum</dt>
              <dd>
                ₹{current.budget.toLocaleString("en-IN")} <small>/ piece</small>
              </dd>
            </div>
            <div>
              <dt>Sauda's opening</dt>
              <dd className="red-ink">
                ₹{current.opening.toLocaleString("en-IN")}{" "}
                <small>/ piece</small>
              </dd>
            </div>
          </dl>
          <div className="brief-private">
            <ShieldCheck size={15} />
            <span>
              Your ceiling stays private.
              <br />
              We start below it.
            </span>
          </div>
        </div>
        <div className="conversation-window">
          <div className="conversation-top">
            <span>
              <span className="red-dot" /> THE CONVERSATION
            </span>
            <span>EXAMPLE ONLY</span>
          </div>
          <div className="demo-messages" aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="popLayout">
              {messages.slice(0, step + 1).map((message, i) => (
                <motion.div
                  key={`${index}-${i}`}
                  className={
                    "demo-message " + (i % 2 ? "shop-message" : "sauda-message")
                  }
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{i % 2 ? "SHOPKEEPER" : "SAUDA"}</span>
                  <p>{message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="demo-player">
            <button
              className="play-example"
              aria-label={
                playing
                  ? "Pause example"
                  : step === 3
                    ? "Replay example"
                    : "Play example"
              }
              onClick={() => {
                if (step === 3) setStep(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <span>
              {playing
                ? "Playing the example"
                : step === 3
                  ? "That's a quote. Your call next."
                  : "See how the conversation unfolds"}
            </span>
            <span className="player-steps" aria-label={`Step ${step + 1} of 4`}>
              {[0, 1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStep(s);
                    setPlaying(false);
                  }}
                  aria-label={`Show example step ${s + 1}`}
                  aria-current={s === step ? "step" : undefined}
                  className={s <= step ? "done" : ""}
                />
              ))}
            </span>
          </div>
        </div>
        <div className="quote-slip">
          <div className="slip-brand">
            <Wordmark />
            <span>QUOTE NOTE</span>
          </div>
          <div className="slip-rule" />
          <span className="mono-label">
            {step === 3 ? "ILLUSTRATIVE QUOTE" : "THE TARGET, NOT A PROMISE"}
          </span>
          <div
            className="slip-price"
            aria-label={`₹${step === 3 ? current.final : current.opening} per piece`}
          >
            ₹
            <NumberTicker
              key={`${index}-${step === 3}`}
              value={step === 3 ? current.final : current.opening}
              startValue={current.budget}
            />
            <small>/ piece</small>
          </div>
          <p>
            {step === 3
              ? "A quote ready for your review."
              : "Leave a little room to meet in the middle."}
          </p>
          <div className="slip-rule" />
          <div className="slip-line">
            <span>Quantity</span>
            <span>× {current.quantity}</span>
          </div>
          <div className="slip-line">
            <span>Delivery</span>
            <span>
              {step === 3
                ? current.delivery
                  ? `₹${current.delivery}`
                  : index === 0
                    ? "Pickup"
                    : "Included"
                : "Ask the shop"}
            </span>
          </div>
          <div className="slip-rule" />
          <div className={"quote-stamp " + (step === 3 ? "ready" : "")}>
            <Check size={15} />
            {step === 3 ? "YOU DECIDE" : "QUOTE ONLY"}
          </div>
          <span className="slip-bottom">NO ORDERS. NO COMMITMENTS.</span>
        </div>
      </div>
    </section>
  );
}

function LanguageSection() {
  const [selected, setSelected] = useState(0);
  const language = languages[selected];
  return (
    <section className="language-section section-wrap" id="languages">
      <div className="language-copy">
        <BlurFade inView>
          <span className="mono-label">03 / SAY IT YOUR WAY</span>
          <h2>
            Good conversations
            <br />
            speak <em>your language.</em>
          </h2>
          <p>
            English, Hindi, or a little of both.
            <br />
            Choose a language. Keep the conversation natural.
          </p>
        </BlurFade>
        <div
          className="language-tabs"
          role="group"
          aria-label="Preview a language"
        >
          {languages.map((item, i) => (
            <button
              key={item.label}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              {selected === i && <span className="red-dot" />}
              {item.label}
            </button>
          ))}
        </div>
        <span className="language-caption">
          TEXT PREVIEW · NO AUDIO PLAYBACK
        </span>
      </div>
      <div className="language-card">
        <span className="mono-label">SAME INTENT. YOUR WORDS.</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            lang={language.lang}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <h3>{language.headline}</h3>
            <div className="language-bubble">
              <span>YOU</span>
              <p>{language.customer}</p>
            </div>
            <div className="language-bubble agent">
              <span>SAUDA</span>
              <p>{language.agent}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <Wave small />
      </div>
    </section>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pauseMarquee, setPauseMarquee] = useState(false);
  const reduced = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 95]);
  const { scrollYProgress: progress } = useScroll();
  const progressScale = useSpring(progress, { stiffness: 100, damping: 30 });
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      duration: 1.05,
    });
    return () => lenis.destroy();
  }, [reduced]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="sauda-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <motion.div
        className="reading-progress"
        style={{ scaleX: progressScale }}
      />
      <header className="site-header">
        <a className="site-logo" href="#" aria-label="Sauda home">
          <Wordmark />
        </a>
        <nav
          className={menuOpen ? "site-nav open" : "site-nav"}
          aria-label="Main navigation"
        >
          <a href="#in-action" onClick={() => setMenuOpen(false)}>
            See it in action
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#questions" onClick={() => setMenuOpen(false)}>
            A few questions
          </a>
        </nav>
        <a className="nav-workspace" href="#/workspace">
          Open workspace <ArrowUpRight size={16} />
        </a>
        <button
          className="mobile-menu"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((p) => !p)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      <main id="main">
        <section
          className="site-hero section-wrap"
          ref={hero}
          aria-labelledby="hero-title"
        >
          <div className="hero-kicker">
            <span>
              <span className="red-dot" /> YOUR PERSONAL NEGOTIATOR
            </span>
            <span>
              MUMBAI, INDIA <MapPin size={12} />
            </span>
          </div>
          <div className="hero-composition">
            <div className="hero-copy">
              <BlurFade delay={0.05} offset={16}>
                <h1 id="hero-title">
                  A little talk.
                  <br />A <em>better deal.</em>
                </h1>
              </BlurFade>
              <BlurFade delay={0.18}>
                <p>
                  You know what you want.
                  <br />
                  Sauda calls the shops, asks the right questions,
                  <br className="desktop-break" /> and brings back a price worth
                  considering.
                </p>
              </BlurFade>
              <BlurFade delay={0.28}>
                <div className="hero-actions">
                  <a href="#/workspace" className="ink-button">
                    Let's make a deal <ArrowUpRight size={19} />
                  </a>
                  <a href="#in-action" className="quiet-link">
                    <span className="circle-play">
                      <Play size={10} fill="currentColor" />
                    </span>{" "}
                    See how it works
                  </a>
                </div>
                <span className="hero-footnote">
                  <ShieldCheck size={13} /> Just quotes. The final yes is always
                  yours.
                </span>
              </BlurFade>
            </div>
            <motion.div
              className="hero-art"
              style={{ y: reduced ? 0 : imageY }}
            >
              <img
                src="/images/sauda-still-life.png"
                alt="A red telephone handset leaning against a paper shopping bag, with a sage garment and two small watches."
                width="1254"
                height="1254"
                fetchPriority="high"
              />
              <div className="art-caption">
                <span>THE ART OF ASKING</span>
                <span>FIG. 01</span>
              </div>
            </motion.div>
            <BlurFade delay={0.5} className="hero-note">
              <span className="note-pin" />
              <span className="mono-label">
                ONE LESS THING
                <br />
                ON YOUR LIST.
              </span>
              <span className="note-scribble">
                We'll do
                <br />
                the talking.
              </span>
              <ArrowUpRight size={28} />
            </BlurFade>
          </div>
          <div className="hero-baseline">
            <span>A LITTLE CONVERSATION GOES A LONG WAY.</span>
            <a href="#in-action">
              TAKE A LOOK <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <div className={"shopping-marquee" + (pauseMarquee ? " paused" : "")}>
          <div className="marquee-track" aria-hidden="true">
            {[0, 1].map((repeat) => (
              <div key={repeat} className="marquee-group">
                {[
                  "The birthday gifts",
                  "The wedding outfits",
                  "The little extras",
                  "The big shopping list",
                ].map((text) => (
                  <span key={text}>
                    {text}
                    <span className="marquee-star">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <span className="sr-only">
            For birthday gifts, wedding outfits, little extras and big shopping
            lists.
          </span>
          <button
            aria-label={
              pauseMarquee ? "Resume scrolling text" : "Pause scrolling text"
            }
            onClick={() => setPauseMarquee((p) => !p)}
          >
            {pauseMarquee ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
        <Example />
        <section className="how-section" id="how-it-works">
          <div className="section-wrap">
            <div className="section-topline">
              <span>02 / A VERY SHORT TO-DO LIST</span>
              <span>LESS CHASING. MORE LIVING.</span>
            </div>
            <div className="how-heading">
              <BlurFade inView>
                <h2>
                  You have plans.
                  <br />
                  <em>We have questions.</em>
                </h2>
              </BlurFade>
              <div className="how-sun" aria-hidden="true">
                ✳
              </div>
            </div>
            <div className="how-grid">
              {[
                {
                  number: "01",
                  title: "Leave us the brief.",
                  body: "The what, the how many, the by-when. Add your budget and the shops you want us to speak to.",
                  icon: ShoppingBag,
                  note: "YOUR LIST, YOUR LIMITS",
                },
                {
                  number: "02",
                  title: "We'll talk it through.",
                  body: "Availability. A better price. The delivery charge. Sauda asks the follow-ups so fewer details slip through.",
                  icon: Headphones,
                  note: "A CONVERSATION, NOT A CART",
                },
                {
                  number: "03",
                  title: "You make the call.",
                  body: "Read the quote and the conversation behind it. Check what needs confirming. The final decision stays yours.",
                  icon: Check,
                  note: "NOTHING BOUGHT WITHOUT YOU",
                },
              ].map((item, i) => (
                <BlurFade key={item.number} inView delay={i * 0.1}>
                  <article className="how-step">
                    <span className="step-number">{item.number}</span>
                    <div className="step-icon">
                      <item.icon size={25} strokeWidth={1.3} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <span className="step-note">{item.note}</span>
                  </article>
                </BlurFade>
              ))}
            </div>
            <div className="how-bottom">
              <Wave />
              <span>
                Better questions.
                <br />
                Fewer loose ends.
              </span>
            </div>
          </div>
        </section>
        <LanguageSection />
        <section className="promise-strip section-wrap">
          <ShieldCheck size={25} strokeWidth={1.3} />
          <p>
            We ask for a better price.
            <br className="mobile-break" />
            <em> You decide if it's a good deal.</em>
          </p>
          <span>
            NO AUTO-ORDERS
            <br />
            NO PAYMENTS
          </span>
        </section>
        <section className="faq-section section-wrap" id="questions">
          <div>
            <span className="mono-label">04 / BEFORE WE TALK SHOP</span>
            <h2>
              A few
              <br />
              <em>good questions.</em>
            </h2>
            <CircleHelp size={25} strokeWidth={1.1} />
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-section section-wrap">
          <BlurFade inView>
            <span className="mono-label">
              YOUR NEXT GOOD DEAL STARTS WITH A HELLO.
            </span>
            <h2>
              Go on.
              <br />
              Leave the <em>haggling</em> to us.
            </h2>
            <a className="ink-button" href="#/workspace">
              Open your shopping desk <ArrowUpRight size={20} />
            </a>
            <p>Buildathon preview · Workspace access code required</p>
          </BlurFade>
          <span className="closing-star" aria-hidden="true">
            ✳
          </span>
        </section>
      </main>
      <footer className="site-footer section-wrap">
        <div className="footer-top">
          <a href="#" aria-label="Back to top">
            <Wordmark />
          </a>
          <p>
            Made for the way we shop.
            <br />A little conversation. A better price.
          </p>
          <a href="#/workspace">
            Your workspace <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SAUDA</span>
          <span>BUILT WITH BOLNA · BUILDATHON EDITION</span>
          <a href="#">
            BACK TO TOP <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  HelpCircle,
  Layers3,
  Loader2,
  LockKeyhole,
  LogOut,
  MapPin,
  Package,
  Phone,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Truck,
  Watch,
  X,
} from "lucide-react";
import { api, ApiError } from "./api";
import type { Config, RequestInput, ShoppingRecord } from "./types";

const money = (value: string | number | null | undefined) =>
  value == null
    ? "Not confirmed"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(Number(value));
const dateLabel = (value: string) =>
  new Date(
    value.length === 10 ? value + "T12:00:00" : value,
  ).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const ACTIVE = new Set([
  "dispatching",
  "queued",
  "scheduled",
  "rescheduled",
  "initiated",
  "ringing",
  "in-progress",
  "call-disconnected",
]);
const statusLabel: Record<string, string> = {
  queued: "Queued",
  initiated: "Dialing",
  ringing: "Ringing",
  "in-progress": "On the call",
  "call-disconnected": "Preparing quote",
  completed: "Call complete",
  rejected: "Could not start",
  dispatch_unknown: "Check call status",
  dispatching: "Connecting",
  "no-answer": "No answer",
  busy: "Line busy",
  "balance-low": "Insufficient call credit",
  failed: "Call failed",
  error: "Call error",
  canceled: "Canceled",
  stopped: "Stopped",
};

function Mark({ small = false }: { small?: boolean }) {
  return (
    <span className={"brand-mark" + (small ? " small" : "")} aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M24 8H12a5 5 0 0 0 0 10h8a4 4 0 0 1 0 8H8" />
      </svg>
    </span>
  );
}
function Badge({ record }: { record: ShoppingRecord }) {
  const active = record.calls.some((c) => ACTIVE.has(c.status));
  const uncertain = record.calls.some((c) => c.status === "dispatch_unknown");
  const label = uncertain
    ? "Check call status"
    : active
      ? "In progress"
      : record.quotes.length
        ? "Needs review"
        : record.calls.length
          ? "Call finished"
          : "Ready to call";
  return (
    <span
      className={
        "badge " +
        (uncertain
          ? "amber"
          : active
            ? "blue"
            : record.quotes.length
              ? "amber"
              : "neutral")
      }
    >
      <span className={"dot " + (active ? "pulse" : "")} />
      {label}
    </span>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/session", {
        method: "POST",
        body: JSON.stringify({ access_code: code }),
      });
      setCode("");
      onLogin();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <header className="login-brand">
        <Mark />
        <span>sauda</span>
      </header>
      <main className="login-layout">
        <section className="login-intro">
          <span className="eyebrow">
            A LITTLE CONVERSATION. A BETTER PRICE.
          </span>
          <h1>
            You have better
            <br />
            things to do <br />
            than haggle.
          </h1>
          <p>
            Give Sauda your shopping brief.
            <br />
            Come back to a conversation worth having.
          </p>
          <div className="signal-art" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="login-footnote">
            <Phone size={14} /> Calls shops. Collects quotes. Leaves the
            decision to you.
          </div>
        </section>
        <section className="login-card">
          <div className="icon-square">
            <LockKeyhole size={20} />
          </div>
          <h2>Your workspace awaits.</h2>
          <p>Enter your workspace access code to continue.</p>
          <form onSubmit={submit}>
            <label htmlFor="access-code">Workspace access code</label>
            <input
              id="access-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              minLength={32}
              autoComplete="current-password"
              placeholder="Enter your access code"
            />
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary full" disabled={busy}>
              {busy ? (
                <Loader2 className="spin" size={16} />
              ) : (
                <>
                  Open workspace <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <div className="login-note">
            <ShieldCheck size={16} /> Your requests and conversations stay
            private.
          </div>
        </section>
      </main>
      <footer className="login-bottom">
        Sauda <span>Built for better everyday deals.</span>
      </footer>
    </div>
  );
}

function RequestForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (r: ShoppingRecord) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const formKey = useRef(crypto.randomUUID());
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const [form, setForm] = useState<RequestInput>({
    item: "",
    variant: "",
    quantity: 1,
    currency: "INR",
    budget: {
      amount_inr: "",
      basis: "unit",
      delivery: "included",
      comparison: "at_most",
    },
    fulfilment: "pickup",
    area: "",
    required_by: tomorrow,
    sellers: [{ name: "", phone: "" }],
    mode: "consented_roleplay",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    return () => {
      old?.focus();
    };
  }, []);
  const update = <K extends keyof RequestInput>(
    key: K,
    value: RequestInput[K],
  ) => setForm((f) => ({ ...f, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const record = await api<ShoppingRecord>("/requests", {
        method: "POST",
        headers: { "Idempotency-Key": formKey.current },
        body: JSON.stringify(form),
      });
      onCreated(record);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog ref={dialog} className="request-dialog" onCancel={onClose}>
      <div className="dialog-heading">
        <div>
          <span className="eyebrow">LET'S MAKE A DEAL</span>
          <h2>What are you looking for?</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close new request"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={submit}>
        <div className="dialog-body">
          <section className="form-section">
            <div className="section-number">
              01 <span>The shopping brief</span>
            </div>
            <label htmlFor="item">What do you need?</label>
            <input
              id="item"
              value={form.item}
              onChange={(e) => update("item", e.target.value)}
              required
              maxLength={500}
              placeholder="e.g. Spider-Man watches"
              autoFocus
            />
            <label htmlFor="variant">Details that matter</label>
            <input
              id="variant"
              value={form.variant}
              onChange={(e) => update("variant", e.target.value)}
              required
              maxLength={500}
              placeholder="Size, colour, model, or acceptable alternatives"
            />
            <div className="form-grid">
              <div>
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={10000}
                  value={form.quantity}
                  onChange={(e) => update("quantity", Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label htmlFor="budget">Maximum budget (₹)</label>
                <input
                  id="budget"
                  type="number"
                  min="0.01"
                  max="100000000"
                  step="0.01"
                  required
                  value={form.budget.amount_inr}
                  onChange={(e) =>
                    update("budget", {
                      ...form.budget,
                      amount_inr: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="basis">Budget applies to</label>
                <select
                  id="basis"
                  value={form.budget.basis}
                  onChange={(e) =>
                    update("budget", {
                      ...form.budget,
                      basis: e.target.value as "unit" | "total",
                    })
                  }
                >
                  <option value="unit">Each item</option>
                  <option value="total">Entire order</option>
                </select>
              </div>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.budget.comparison === "under"}
                onChange={(e) =>
                  update("budget", {
                    ...form.budget,
                    comparison: e.target.checked ? "under" : "at_most",
                  })
                }
              />
              Keep the price strictly below my budget
            </label>
          </section>
          <section className="form-section">
            <div className="section-number">
              02 <span>When & where</span>
            </div>
            <div className="form-grid two">
              <div>
                <label htmlFor="fulfilment">How will you get it?</label>
                <select
                  id="fulfilment"
                  value={form.fulfilment}
                  onChange={(e) => {
                    const fulfilment = e.target.value as "pickup" | "delivery";
                    setForm((f) => ({
                      ...f,
                      fulfilment,
                      budget: { ...f.budget, delivery: "included" },
                    }));
                  }}
                >
                  <option value="pickup">I'll pick it up</option>
                  <option value="delivery">Deliver to my area</option>
                </select>
              </div>
              <div>
                <label htmlFor="date">Needed by</label>
                <input
                  id="date"
                  type="date"
                  min={new Date().toLocaleDateString("en-CA", {
                    timeZone: "Asia/Kolkata",
                  })}
                  value={form.required_by}
                  onChange={(e) => update("required_by", e.target.value)}
                  required
                />
              </div>
            </div>
            <label htmlFor="area">Area & city</label>
            <input
              id="area"
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              required
              placeholder="e.g. Marine Drive, Mumbai"
            />
            {form.fulfilment === "delivery" && (
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={form.budget.delivery === "additional"}
                  onChange={(e) =>
                    update("budget", {
                      ...form.budget,
                      delivery: e.target.checked ? "additional" : "included",
                    })
                  }
                />
                Delivery can be extra. Ask for free delivery first.
              </label>
            )}
          </section>
          <section className="form-section">
            <div className="section-number">
              03 <span>Who should we call?</span>
            </div>
            <p className="field-hint">
              For now, use verified recipients who have agreed to a test call.
            </p>
            {form.sellers.map((seller, i) => (
              <div className="seller-fields" key={i}>
                <div>
                  <label htmlFor={"shop-" + i}>Shop name</label>
                  <input
                    id={"shop-" + i}
                    value={seller.name}
                    onChange={(e) =>
                      update(
                        "sellers",
                        form.sellers.map((s, n) =>
                          n === i ? { ...s, name: e.target.value } : s,
                        ),
                      )
                    }
                    required
                    placeholder="Fictional test shop"
                  />
                </div>
                <div>
                  <label htmlFor={"phone-" + i}>Phone with country code</label>
                  <input
                    id={"phone-" + i}
                    type="tel"
                    pattern="\+[1-9][0-9]{7,14}"
                    value={seller.phone}
                    onChange={(e) =>
                      update(
                        "sellers",
                        form.sellers.map((s, n) =>
                          n === i ? { ...s, phone: e.target.value } : s,
                        ),
                      )
                    }
                    required
                    placeholder="+91…"
                  />
                </div>
                {form.sellers.length > 1 && (
                  <button
                    className="icon-button remove-seller"
                    type="button"
                    aria-label={"Remove shop " + (i + 1)}
                    onClick={() =>
                      update(
                        "sellers",
                        form.sellers.filter((_, n) => n !== i),
                      )
                    }
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {form.sellers.length < 5 && (
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  update("sellers", [...form.sellers, { name: "", phone: "" }])
                }
              >
                <Plus size={14} /> Add another shop
              </button>
            )}
          </section>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="dialog-footer">
          <span>
            <ShieldCheck size={14} /> Preparing a request won't place a call.
          </span>
          <button className="button primary" disabled={busy}>
            {busy ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <>
                Prepare request <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function QuotePanel({ record }: { record: ShoppingRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quote = record.quotes[quoteIndex] || record.quotes[0];
  const extraction = quote?.extraction;
  const call =
    record.calls.find((c) => c.id === quote?.call_id) || record.calls[0];
  const amount =
    quote?.quoted_amount_plus_delivery_inr ||
    quote?.quoted_amount_for_quantity_inr;
  if (!quote)
    return (
      <div className="quote-empty">
        <div className="orbit">
          <Phone size={22} />
          <span />
          <span />
        </div>
        <h3>
          {record.calls.some((c) => ACTIVE.has(c.status))
            ? "A conversation is in progress."
            : "The next good price starts with a call."}
        </h3>
        <p>
          {record.calls.length
            ? "Call progress updates here automatically. The quote appears when processing is complete."
            : "Your brief is ready. Start a call when your test recipient is available."}
        </p>
      </div>
    );
  return (
    <>
      {record.quotes.length > 1 && (
        <div className="quote-selector">
          <label htmlFor="quote-shop">Compare shop quotes</label>
          <select
            id="quote-shop"
            value={quoteIndex}
            onChange={(e) => {
              setQuoteIndex(Number(e.target.value));
              setExpanded(false);
            }}
          >
            {record.quotes.map((q, i) => (
              <option key={q.call_id || i} value={i}>
                {q.seller || `Shop ${i + 1}`} ·{" "}
                {money(
                  q.quoted_amount_plus_delivery_inr ||
                    q.quoted_amount_for_quantity_inr,
                )}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="quote-topline">
        <span className="eyebrow">LATEST QUOTE</span>
        <span className="badge amber">
          <span className="dot" />
          Needs review
        </span>
      </div>
      <div className="quote-amount">
        {money(amount)}
        <span>
          estimated{" "}
          {record.request.fulfilment === "delivery" &&
          quote.quoted_amount_plus_delivery_inr
            ? "with delivery"
            : "for the items"}
        </span>
      </div>
      <p className="quote-shop">
        <Store size={15} />
        {quote.seller || record.request.sellers[0].name}
      </p>
      <div className="quote-breakdown">
        <div>
          <span>
            {record.request.quantity} items{" "}
            {extraction?.final_quote_basis === "unit"
              ? `× ${money(extraction.final_quote_amount)}`
              : ""}
          </span>
          <strong>{money(quote.quoted_amount_for_quantity_inr)}</strong>
        </div>
        <div>
          <span>Delivery</span>
          <strong>
            {record.request.fulfilment === "pickup"
              ? "Pickup"
              : money(extraction?.delivery_amount)}
          </strong>
        </div>
        <div>
          <span>Taxes & mandatory charges</span>
          <span className="review-text">Confirm inclusions</span>
        </div>
      </div>
      <div className="review-notice">
        <HelpCircle size={17} />
        <p>
          This is a quote, not an order. Review the conversation to confirm the
          exact items, taxes and delivery before deciding.
        </p>
      </div>
      {extraction?.evidence_quotes?.length ? (
        <div className="seller-evidence">
          <span className="eyebrow">EXTRACTED EXCERPT · VERIFY BELOW</span>
          <blockquote>
            “{extraction.evidence_quotes[extraction.evidence_quotes.length - 1]}
            ”
          </blockquote>
        </div>
      ) : null}
      <button
        className="text-button transcript-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <FileText size={15} />
        {expanded ? "Hide conversation" : "Read conversation"}
        <ChevronDown size={14} className={expanded ? "rotate" : ""} />
      </button>
      {expanded && (
        <div className="transcript">
          {call?.result?.transcript ? (
            call.result.transcript
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <div
                  className={
                    line.trim().startsWith("assistant:")
                      ? "assistant-turn"
                      : "seller-turn"
                  }
                  key={i}
                >
                  <span>
                    {line.trim().startsWith("assistant:")
                      ? "SAUDA"
                      : "SHOPKEEPER"}
                  </span>
                  <p>{line.replace(/^\s*(assistant|user):\s*/, "")}</p>
                </div>
              ))
          ) : (
            <p>The saved conversation is not available yet.</p>
          )}
        </div>
      )}
    </>
  );
}

function Detail({
  record,
  config,
  onBack,
  reload,
}: {
  record: ShoppingRecord;
  config: Config;
  onBack: () => void;
  reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmCall, setConfirmCall] = useState(false);
  const [agent, setAgent] = useState("primary");
  const r = record.request;
  const active = record.calls.some((c) => ACTIVE.has(c.status));
  async function start() {
    setBusy(true);
    setError("");
    try {
      await api("/requests/" + record.id + "/calls", {
        method: "POST",
        body: JSON.stringify({ agent }),
      });
      setConfirmCall(false);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      await Promise.all(
        record.calls
          .filter(
            (c) =>
              !["dispatching", "dispatch_unknown", "rejected"].includes(
                c.status,
              ),
          )
          .map((c) => api("/calls/" + c.id + "/refresh", { method: "POST" })),
      );
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={15} />
        All requests
      </button>
      <div className="detail-header">
        <div className="detail-title">
          <span className="product-icon">
            {r.item.toLowerCase().includes("watch") ? (
              <Watch size={25} />
            ) : (
              <Package size={25} />
            )}
          </span>
          <div>
            <div className="title-meta">
              <span className="eyebrow">SHOPPING REQUEST</span>
              <span className="tiny-dot" />
              <span>Test call</span>
            </div>
            <h1>{r.item}</h1>
            <p>
              {r.quantity} items · {r.variant}
            </p>
          </div>
        </div>
        <Badge record={record} />
      </div>
      <div className="detail-facts">
        <div>
          <span>YOUR BUDGET</span>
          <strong>
            {money(r.budget.amount_inr)}{" "}
            <small>{r.budget.basis === "unit" ? "/ item" : "total"}</small>
          </strong>
        </div>
        <div>
          <span>FULFILMENT</span>
          <strong>
            {r.fulfilment === "delivery" ? (
              <Truck size={16} />
            ) : (
              <MapPin size={16} />
            )}
            {r.area}
          </strong>
        </div>
        <div>
          <span>NEEDED BY</span>
          <strong>{dateLabel(r.required_by)}</strong>
        </div>
        <div>
          <span>DELIVERY BUDGET</span>
          <strong>
            {r.fulfilment === "pickup"
              ? "Pickup"
              : r.budget.delivery === "additional"
                ? "Can be additional"
                : "Included in budget"}
          </strong>
        </div>
      </div>
      <div className="detail-grid">
        <section className="panel quote-panel">
          <QuotePanel record={record} />
        </section>
        <aside>
          <section className="panel">
            <div className="panel-title">
              <h2>Call activity</h2>
              {active && (
                <span className="live-label">
                  <span className="dot pulse" />
                  Live
                </span>
              )}
            </div>
            <div className="timeline">
              <div className="timeline-row">
                <span className="timeline-icon done">
                  <Check size={13} />
                </span>
                <div>
                  <strong>Request prepared</strong>
                  <p>
                    {dateLabel(record.created_at)} · {r.sellers.length}{" "}
                    {r.sellers.length === 1 ? "shop" : "shops"}
                  </p>
                </div>
              </div>
              {record.calls.map((call) => (
                <div className="timeline-row" key={call.id}>
                  <span
                    className={
                      "timeline-icon " +
                      (call.status === "completed"
                        ? "done"
                        : ACTIVE.has(call.status)
                          ? "active"
                          : "")
                    }
                  >
                    {call.status === "completed" ? (
                      <Check size={13} />
                    ) : (
                      <Phone size={13} />
                    )}
                  </span>
                  <div>
                    <strong>{statusLabel[call.status] || call.status}</strong>
                    <p>{r.sellers[call.seller_index].name}</p>
                    {call.result?.duration_seconds != null && (
                      <p>
                        {Math.floor(call.result.duration_seconds / 60)}m{" "}
                        {Math.floor(call.result.duration_seconds % 60)}s ·{" "}
                        {call.result.termination_reason === "agent_ended_call"
                          ? "Sauda ended the call"
                          : "Call ended"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="timeline-row">
                <span
                  className={
                    "timeline-icon " + (record.quotes.length ? "review" : "")
                  }
                >
                  <FileText size={13} />
                </span>
                <div>
                  <strong>
                    {record.quotes.length
                      ? "Ready for your review"
                      : "Quote & conversation"}
                  </strong>
                  <p>
                    {record.quotes.length
                      ? "Check the details before deciding."
                      : "Available after the call finishes."}
                  </p>
                </div>
              </div>
            </div>
            {record.calls.length > 0 && (
              <button
                className="button secondary full"
                onClick={refresh}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Radio size={14} />
                )}
                Refresh call status
              </button>
            )}
            {!record.calls.length && (
              <div className="call-action">
                <label htmlFor="agent-model">Calling agent</label>
                <select
                  id="agent-model"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                >
                  <option value="primary">Primary · Gemini Flash</option>
                  <option value="backup">Backup · GPT-4.1</option>
                </select>
                {!config.live_calls_enabled && (
                  <p className="field-hint">
                    Calling is paused. Your request is saved and ready.
                  </p>
                )}
                <button
                  className="button primary full"
                  disabled={!config.live_calls_enabled || busy}
                  onClick={() => setConfirmCall(true)}
                >
                  <Phone size={15} />
                  Start test call
                </button>
                {confirmCall && (
                  <div className="call-confirm">
                    <p>
                      Call {r.sellers.length} consenting test{" "}
                      {r.sellers.length === 1 ? "recipient" : "recipients"} now?
                      This uses your call credits.
                    </p>
                    <div>
                      <button
                        className="button secondary"
                        onClick={() => setConfirmCall(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={start}
                      >
                        {busy ? "Starting…" : "Call now"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>
          <section className="panel offers-panel">
            <div className="panel-title">
              <h2>The bargaining plan</h2>
              <SlidersHorizontal size={15} />
            </div>
            <p className="subtle">Up to three offers, room to negotiate.</p>
            <div className="offer-ladder">
              {record.plan.nonbinding_proposals.map((p, i) => (
                <div key={i}>
                  <span>
                    {i === 0
                      ? "OPEN"
                      : i === record.plan.nonbinding_proposals.length - 1
                        ? "FINAL"
                        : "COUNTER"}
                  </span>
                  <strong>
                    {money(
                      record.plan.offer_basis === "total"
                        ? p.total_inr
                        : p.unit_inr,
                    )}
                  </strong>
                </div>
              ))}
            </div>
            <p className="field-hint">
              {record.plan.offer_basis === "total"
                ? "For the entire order, including delivery."
                : "Per item. Your maximum stays private."}
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [records, setRecords] = useState<ShoppingRecord[]>([]);
  const [selected, setSelected] = useState<ShoppingRecord | null>(null);
  const [newRequest, setNewRequest] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Requests");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedId = useRef<string | null>(null);
  const load = useCallback(async () => {
    try {
      const [configuration, list] = await Promise.all([
        api<Config>("/config"),
        api<{ items: ShoppingRecord[] }>("/requests"),
      ]);
      setConfig(configuration);
      setRecords(list.items);
      setAuthenticated(true);
      setError("");
      const current = selectedId.current;
      if (current) {
        const detail = await api<ShoppingRecord>("/requests/" + current);
        if (selectedId.current === current) setSelected(detail);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setAuthenticated(false);
        setRecords([]);
        setSelected(null);
      } else setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!authenticated) return;
    const id = setInterval(() => {
      if (!document.hidden) void load();
    }, 5000);
    return () => clearInterval(id);
  }, [authenticated, load]);
  async function open(record: ShoppingRecord) {
    selectedId.current = record.id;
    setLoading(true);
    try {
      const detail = await api<ShoppingRecord>("/requests/" + record.id);
      if (selectedId.current === record.id) setSelected(detail);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  function back() {
    selectedId.current = null;
    setSelected(null);
  }
  async function logout() {
    try {
      await api("/session", { method: "DELETE" });
      setAuthenticated(false);
      setSelected(null);
      setRecords([]);
      selectedId.current = null;
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (authenticated === null)
    return (
      <div className="loading-screen">
        <Mark />
        <Loader2 size={20} className="spin" />
        {error && (
          <>
            <p className="error">{error}</p>
            <button className="button secondary" onClick={() => void load()}>
              Retry connection
            </button>
          </>
        )}
      </div>
    );
  if (!authenticated) return <Login onLogin={() => void load()} />;
  const activeCount = records.reduce(
    (n, r) => n + r.calls.filter((c) => ACTIVE.has(c.status)).length,
    0,
  );
  const quotesCount = records.reduce((n, r) => n + r.quotes.length, 0);
  const filtered = records.filter(
    (r) =>
      (r.request.item + " " + r.request.area)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter !== "review" || r.quotes.length > 0),
  );
  const activity = records
    .flatMap((r) => r.calls.map((c) => ({ record: r, call: c })))
    .sort((a, b) => b.call.updated_at.localeCompare(a.call.updated_at));
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="brand-lockup"
            onClick={() => {
              back();
              setTab("Requests");
            }}
            aria-label="Sauda home"
          >
            <Mark />
            <span>sauda</span>
          </button>
          <span className="workspace-slash"></span>
          <span className="workspace-name">
            Personal workspace <span className="plan-tag">Demo</span>
          </span>
        </div>
        <div className="topbar-right">
          <span className="connection">
            <span
              className={
                "dot " + (config?.provider_configured ? "green-dot" : "")
              }
            />
            {config?.provider_configured ? "Agent connected" : "Agent offline"}
          </span>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={logout}
          >
            <LogOut size={16} />
          </button>
          <div className="avatar" aria-label="Personal workspace">
            R
          </div>
        </div>
      </header>
      <nav className="tabs" aria-label="Workspace navigation">
        {["Requests", "Activity", "Workspace"].map((name) => (
          <button
            key={name}
            className={tab === name ? "active" : ""}
            onClick={() => {
              setTab(name);
              back();
            }}
          >
            {name}
          </button>
        ))}
        <span className="nav-tail">
          <ShieldCheck size={13} />
          Quote-only, always
        </span>
      </nav>
      <main className="workspace-main">
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => void load()}>Try again</button>
          </div>
        )}
        {loading && <div className="loading-line" />}
        {selected && config ? (
          <Detail
            key={selected.id}
            record={selected}
            config={config}
            onBack={back}
            reload={load}
          />
        ) : tab === "Requests" ? (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow workspace-eyebrow">
                  <span className="square-dot" />
                  YOUR NEGOTIATION WORKSPACE
                </div>
                <h1>A better deal starts here.</h1>
                <p>You set the brief. Sauda makes the calls.</p>
              </div>
              <button
                className="button primary"
                onClick={() => setNewRequest(true)}
              >
                <Plus size={16} />
                New request
              </button>
            </section>
            <section className="metrics" aria-label="Workspace summary">
              <div>
                <span>
                  <Layers3 size={15} />
                  Shopping requests
                </span>
                <strong>{String(records.length).padStart(2, "0")}</strong>
                <small>Your briefs, in one place</small>
              </div>
              <div>
                <span>
                  <Radio size={15} />
                  Calls in progress
                </span>
                <strong>
                  {String(activeCount).padStart(2, "0")}
                  <span
                    className={"metric-dot " + (activeCount ? "pulse" : "")}
                  />
                </strong>
                <small>
                  {activeCount
                    ? "Sauda is talking to shops"
                    : "Ready for the next conversation"}
                </small>
              </div>
              <div>
                <span>
                  <FileText size={15} />
                  Quotes to review
                </span>
                <strong>{String(quotesCount).padStart(2, "0")}</strong>
                <small>
                  {quotesCount
                    ? "A few details before you decide"
                    : "Good conversations come next"}
                </small>
              </div>
            </section>
            <div className="overview-grid">
              <section className="requests-section">
                <div className="section-heading">
                  <h2>
                    Your requests <span>{records.length}</span>
                  </h2>
                  <div className="request-controls">
                    <label className="search-field">
                      <Search size={15} />
                      <input
                        aria-label="Search requests"
                        placeholder="Search requests…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Filter requests"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All requests</option>
                      <option value="review">Needs review</option>
                    </select>
                  </div>
                </div>
                <div className="request-list">
                  {filtered.length ? (
                    filtered.map((record) => (
                      <button
                        className="request-card"
                        key={record.id}
                        onClick={() => void open(record)}
                      >
                        <div className="card-top">
                          <span className="product-icon">
                            {record.request.item
                              .toLowerCase()
                              .includes("watch") ? (
                              <Watch size={23} />
                            ) : (
                              <Package size={23} />
                            )}
                          </span>
                          <Badge record={record} />
                          <ChevronRight size={17} className="card-chevron" />
                        </div>
                        <h3>{record.request.item}</h3>
                        <p className="card-variant">
                          {record.request.quantity} items ·{" "}
                          {record.request.variant}
                        </p>
                        <div className="card-facts">
                          <span>
                            <MapPin size={13} />
                            {record.request.area}
                          </span>
                          <span>
                            <Clock3 size={13} />
                            By {dateLabel(record.request.required_by)}
                          </span>
                        </div>
                        <div className="card-bottom">
                          <div>
                            <span>MAX BUDGET</span>
                            <strong>
                              {money(record.request.budget.amount_inr)}
                              <small>
                                {record.request.budget.basis === "unit"
                                  ? " / item"
                                  : " total"}
                              </small>
                            </strong>
                          </div>
                          <span className="card-progress">
                            <span className="mini-wave">
                              <i />
                              <i />
                              <i />
                              <i />
                              <i />
                            </span>
                            {record.calls.length
                              ? `${record.progress.finished}/${record.progress.total_sellers} calls complete`
                              : "Ready when you are"}
                            <ArrowUpRight size={14} />
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="empty-state">
                      <Package size={28} />
                      <h3>
                        {query || filter !== "all"
                          ? "No matching requests."
                          : "Your first better deal is a brief away."}
                      </h3>
                      <p>
                        {query || filter !== "all"
                          ? "Try another search or show all requests."
                          : "Tell us what you need, your budget, and who to call."}
                      </p>
                      <button
                        className="button secondary"
                        onClick={() => {
                          if (query || filter !== "all") {
                            setQuery("");
                            setFilter("all");
                          } else setNewRequest(true);
                        }}
                      >
                        {query || filter !== "all"
                          ? "Clear filters"
                          : "Create a request"}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="list-footnote">
                  <LockKeyhole size={12} />
                  Your budget stays between you and Sauda.
                </div>
              </section>
              <aside className="overview-aside">
                <section className="how-card">
                  <span className="eyebrow">
                    A SMALL ASK. LESS BACK-AND-FORTH.
                  </span>
                  <h2>
                    Your brief.
                    <br />
                    Our conversation.
                  </h2>
                  <div className="conversation-art" aria-hidden="true">
                    <span className="art-line" />
                    <div className="art-bubble">
                      <Store size={18} />
                      <span>What's your best price?</span>
                    </div>
                    <div className="art-bubble answer">
                      <span>Let me see what I can do.</span>
                      <span className="art-spark">
                        <Sparkles size={14} />
                      </span>
                    </div>
                  </div>
                  <ol>
                    <li>
                      <span>01</span>
                      <div>
                        <strong>Tell us what matters</strong>
                        <p>The item, your budget, and the details.</p>
                      </div>
                    </li>
                    <li>
                      <span>02</span>
                      <div>
                        <strong>We ask. Then negotiate.</strong>
                        <p>Real calls, in the shopkeeper's language.</p>
                      </div>
                    </li>
                    <li>
                      <span>03</span>
                      <div>
                        <strong>You make the call</strong>
                        <p>Review the quote. No automatic orders.</p>
                      </div>
                    </li>
                  </ol>
                </section>
                <div className="gentle-note">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>A quote is just a quote.</strong>
                    <p>
                      No bookings, payments or commitments. The final decision
                      is yours.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        ) : tab === "Activity" ? (
          <>
            <section className="page-heading">
              <div>
                <span className="eyebrow">
                  EVERY CONVERSATION, ACCOUNTED FOR
                </span>
                <h1>Call activity.</h1>
                <p>What happened, and what came back.</p>
              </div>
            </section>
            <div className="activity-table">
              <div className="activity-row table-heading">
                <span>REQUEST / SHOP</span>
                <span>STATUS</span>
                <span>DURATION</span>
                <span>UPDATED</span>
              </div>
              {activity.map(({ record, call }) => (
                <button
                  className="activity-row"
                  key={call.id}
                  onClick={() => void open(record)}
                >
                  <div>
                    <strong>{record.request.item}</strong>
                    <small>
                      {record.request.sellers[call.seller_index].name}
                    </small>
                  </div>
                  <span className="status-text">
                    <span
                      className={
                        "dot " +
                        (call.status === "completed" ? "green-dot" : "")
                      }
                    />
                    {statusLabel[call.status] || call.status}
                  </span>
                  <span className="mono">
                    {call.result?.duration_seconds != null
                      ? `${Math.round(call.result.duration_seconds)}s`
                      : "—"}
                  </span>
                  <span>
                    {dateLabel(call.updated_at)} <ArrowUpRight size={13} />
                  </span>
                </button>
              ))}
              {!activity.length && (
                <div className="empty-state">
                  <Headphones size={25} />
                  <h3>No calls yet.</h3>
                  <p>Your first conversation will appear here.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <section className="page-heading">
              <div>
                <span className="eyebrow">YOUR SETUP</span>
                <h1>Workspace.</h1>
                <p>A little context before the next conversation.</p>
              </div>
            </section>
            <section className="panel settings-panel">
              <h2>Calling setup</h2>
              <div>
                <span>Agent connection</span>
                <strong>
                  {config?.provider_configured ? "Connected" : "Not configured"}
                </strong>
              </div>
              <div>
                <span>Live calling</span>
                <strong>
                  {config?.live_calls_enabled
                    ? "Enabled for verified test recipients"
                    : "Paused"}
                </strong>
              </div>
              <div>
                <span>Allowed test recipients</span>
                <strong>{config?.allowed_recipient_count}</strong>
              </div>
              <div>
                <span>Current mode</span>
                <strong>Consented roleplay tests</strong>
              </div>
              <p>
                Calling controls are managed by the workspace operator. Sauda
                never places orders or makes payments.
              </p>
            </section>
          </>
        )}
        <footer className="workspace-footer">
          <span>
            <Mark small />A little conversation goes a long way.
          </span>
          <span>
            SAUDA <span className="footer-divider">/</span> BUILDATHON EDITION
          </span>
        </footer>
      </main>
      {newRequest && (
        <RequestForm
          onClose={() => setNewRequest(false)}
          onCreated={(record) => {
            setNewRequest(false);
            void load();
            void open(record);
          }}
        />
      )}
    </div>
  );
}

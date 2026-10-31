import { useRef, useState } from "react";
import { api, ApiError } from "../../api";
import type { Config, Quote, ShoppingRecord } from "../../types";

type Props = {
  record: ShoppingRecord;
  config: Config;
  onChanged: () => Promise<void>;
  onUnauthorized: () => void;
};

type Extraction = NonNullable<Quote["extraction"]> & {
  first_quote_amount?: string | number | null;
  first_quote_basis?: string;
  other_mandatory_fees?: string | number | null;
  unknown_fees?: string[];
};

const money = (value: string | number | null | undefined) =>
  value == null ? "Not confirmed" : new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2,
  }).format(Number(value));

const basis = (value: string | undefined) =>
  value === "unit" ? "per item" : value === "total" ? "total" : "basis unknown";

function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const statuses: Record<string, string> = {
  dispatching: "Connecting", queued: "Queued", scheduled: "Scheduled",
  rescheduled: "Rescheduled", initiated: "Dialing", ringing: "Ringing",
  "in-progress": "In progress", "call-disconnected": "Call disconnected",
  completed: "Completed", rejected: "Could not start", dispatch_unknown: "Dispatch unknown",
  "no-answer": "No answer", busy: "Line busy", "balance-low": "Insufficient call credit",
  failed: "Call failed", error: "Call error", canceled: "Canceled", stopped: "Stopped",
};

export default function RequestDetail({ record, config, onChanged, onUnauthorized }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [agent, setAgent] = useState("primary");
  const [consented, setConsented] = useState(false);
  const [uncertainDispatch, setUncertainDispatch] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef(false);
  const request = record.request;
  const ready = config.live_calls_enabled && config.provider_configured && config.allowed_recipient_count > 0;
  const expired = request.required_by < todayInIndia();
  const canCall = ready && !expired && !busy && !record.calls.length && !uncertainDispatch;
  const quote = record.quotes[quoteIndex] || record.quotes[0];
  const extraction = quote?.extraction as Extraction | undefined;

  function handleError(e: unknown) {
    if (e instanceof ApiError && e.status === 401) onUnauthorized();
    else setError(e instanceof Error ? e.message : "Something went wrong.");
  }

  async function start() {
    if (pending.current || !canCall || !consented || request.required_by < todayInIndia()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    let dispatched = false;
    try {
      await api(`/requests/${record.id}/calls`, {
        method: "POST", body: JSON.stringify({ agent }),
      });
      dispatched = true;
      dialog.current?.close();
      await onChanged();
    } catch (e) {
      if (dispatched || !(e instanceof ApiError) || e.status >= 500 || e.status === 408) {
        setUncertainDispatch(true);
        try { await onChanged(); } catch (reloadError) { handleError(reloadError); }
      }
      handleError(e);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function refresh(callId: string) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await api(`/calls/${callId}/refresh`, { method: "POST" });
      await onChanged();
    } catch (e) {
      handleError(e);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <article className="ws-detail">
      <header className="ws-detail-header">
        <div>
          <h1>{request.item}</h1>
          <p>{request.variant} · {request.quantity} {request.quantity === 1 ? "item" : "items"}</p>
        </div>
        {!record.calls.length && <button type="button" className="ws-primary" disabled={!canCall} onClick={() => {
          if (request.required_by < todayInIndia()) { setError("Request deadline has passed."); return; }
          setConsented(false);
          dialog.current?.showModal();
        }}>Call</button>}
      </header>

      {!ready && <p className="ws-status">{!config.live_calls_enabled ? "Calling paused" : !config.provider_configured ? "Provider unavailable" : "No approved recipients"}</p>}
      {expired && <p className="ws-status">Request deadline has passed.</p>}
      {uncertainDispatch && <p className="ws-warning" role="alert">Do not retry. Reconcile provider history.</p>}
      {error && <p className="ws-error" role="alert">{error}</p>}

      <dl className="ws-facts">
        <div><dt>Budget</dt><dd>{money(request.budget.amount_inr)} · {basis(request.budget.basis)} · {request.budget.comparison === "under" ? "Strictly under" : "At most"}</dd></div>
        <div><dt>Fulfilment</dt><dd>{request.fulfilment === "delivery" ? "Delivery" : "Pickup"}{request.fulfilment === "delivery" && (request.budget.delivery === "included" ? " · Included in budget" : " · Additional to budget")}</dd></div>
        <div><dt>Area</dt><dd>{request.area}</dd></div>
        <div><dt>Needed by</dt><dd>{request.required_by}</dd></div>
        <div><dt>Recipients</dt><dd>{request.sellers.map((seller, i) => <div key={i}>{seller.name} · {seller.phone}</div>)}</dd></div>
      </dl>

      {!record.calls.length && <details className="ws-options">
        <summary>Call options</summary>
        <label htmlFor="ws-agent">Agent</label>{" "}
        <select id="ws-agent" value={agent} onChange={(e) => setAgent(e.target.value)} disabled={busy}>
          <option value="primary">Primary</option><option value="backup">Backup</option>
        </select>
      </details>}

      <dialog ref={dialog} className="ws-dialog" aria-labelledby="ws-confirm-title" onCancel={(event) => { if (busy) event.preventDefault(); }} onClose={() => setConsented(false)}>
        <h2 id="ws-confirm-title">Confirm call</h2>
        <ul>{request.sellers.map((seller, i) => <li key={i}>{seller.name} · {seller.phone}</li>)}</ul>
        <p>Consented test calls. Uses call credits. Quotes only; no orders.</p>
        <label><input type="checkbox" checked={consented} disabled={busy} onChange={(e) => setConsented(e.target.checked)} /> I confirm these recipients consent to test calls.</label>
        {error && <p className="ws-error" role="alert">{error}</p>}
        {uncertainDispatch && <p className="ws-warning">Do not retry. Reconcile provider history.</p>}
        <div className="ws-dialog-actions">
          <button type="button" className="ws-secondary" disabled={busy} onClick={() => dialog.current?.close()}>Cancel</button>
          <button type="button" className="ws-primary" disabled={!canCall || !consented} onClick={start}>{busy ? "Calling…" : "Call now"}</button>
        </div>
      </dialog>

      <section className="ws-quote" aria-labelledby="ws-quote-title">
        <h2 id="ws-quote-title">Quote</h2>
        {!quote ? <p>No quote yet</p> : <>
          {record.quotes.length > 1 && <label>Seller{" "}<select value={quoteIndex} onChange={(e) => setQuoteIndex(Number(e.target.value))}>
            {record.quotes.map((q, i) => <option key={q.call_id || i} value={i}>{q.seller || `Recipient ${i + 1}`}</option>)}
          </select></label>}
          {record.quotes.length === 1 && quote.seller && <p>{quote.seller}</p>}
          <p className="ws-quote-amount">{money(quote.quoted_amount_plus_delivery_inr ?? quote.quoted_amount_for_quantity_inr)}</p>
          <p>Estimate · Needs review</p>
          {(quote.quoted_amount_plus_delivery_inr != null || quote.quoted_amount_for_quantity_inr != null) && <p>{quote.quoted_amount_plus_delivery_inr != null ? "Quantity and delivery" : "Quantity cost"}</p>}
          <p className="ws-warning">Extraction, not seller agreement. Not an order.</p>
          <p>{quote.budget_status === "potentially_over_budget" ? "Potentially over budget · review required" : "Budget fit not verified · review required"}</p>
          {quote.issues.length > 0 && <ul className="ws-issues">{quote.issues.map((issue, i) => <li key={i}>{issue.replace(/_/g, " ")}</li>)}</ul>}
          <details className="ws-breakdown">
            <summary>Breakdown</summary>
            <dl>
              <div><dt>First amount</dt><dd>{money(extraction?.first_quote_amount)}{extraction?.first_quote_amount != null && ` · ${basis(extraction.first_quote_basis)}`}</dd></div>
              <div><dt>Final amount</dt><dd>{money(extraction?.final_quote_amount)}{extraction?.final_quote_amount != null && ` · ${basis(extraction.final_quote_basis)}`}</dd></div>
              <div><dt>Quantity cost</dt><dd>{money(quote.quoted_amount_for_quantity_inr)}</dd></div>
              <div><dt>Delivery</dt><dd>{money(extraction?.delivery_amount)}</dd></div>
              <div><dt>Tax</dt><dd>{money(extraction?.tax_amount)}</dd></div>
              <div><dt>Other mandatory fees</dt><dd>{money(extraction?.other_mandatory_fees)}</dd></div>
              <div><dt>Unknown fees</dt><dd>{extraction?.unknown_fees?.length ? extraction.unknown_fees.join(", ") : "Not confirmed"}</dd></div>
              <div><dt>Availability</dt><dd>{extraction?.availability || "Not confirmed"}</dd></div>
              <div><dt>Offered variant</dt><dd>{extraction?.offered_item_variant || "Not confirmed"}</dd></div>
              <div><dt>Verified all-in total</dt><dd>{money(quote.verified_all_in_total_inr)}</dd></div>
            </dl>
          </details>
          {!!extraction?.evidence_quotes?.length && <details className="ws-evidence"><summary>Evidence excerpts</summary>{extraction.evidence_quotes.map((excerpt, i) => <blockquote key={i}>{excerpt}</blockquote>)}</details>}
        </>}
      </section>

      {record.calls.length > 0 && <section className="ws-calls" aria-labelledby="ws-calls-title">
        <h2 id="ws-calls-title">Calls</h2>
        {record.calls.map((call) => <div className="ws-call" key={call.id}>
          <div><strong>{request.sellers[call.seller_index]?.name || "Recipient"}</strong> · {statuses[call.status] || call.status}</div>
          {call.result?.duration_seconds != null && <p>{Math.floor(call.result.duration_seconds / 60)}m {Math.floor(call.result.duration_seconds % 60)}s</p>}
          {call.status === "dispatch_unknown" && <p className="ws-warning">Do not retry. Reconcile provider history.</p>}
          {!['dispatching', 'dispatch_unknown', 'rejected'].includes(call.status) && <button type="button" className="ws-secondary" disabled={busy} onClick={() => refresh(call.id)}>Refresh status</button>}
          {call.status === "completed" && call.result?.transcript && <details className="ws-transcript"><summary>Transcript</summary><pre>{call.result.transcript}</pre></details>}
        </div>)}
      </section>}

      <details className="ws-proposals">
        <summary>Proposals · Nonbinding</summary>
        <dl>{record.plan.nonbinding_proposals.map((proposal, i) => <div key={i}><dt>{i === 0 ? "Opening" : i === record.plan.nonbinding_proposals.length - 1 ? "Final proposal" : "Counter"}</dt><dd>{money(record.plan.offer_basis === "total" ? proposal.total_inr : proposal.unit_inr)} · {basis(record.plan.offer_basis)}</dd></div>)}</dl>
      </details>
    </article>
  );
}

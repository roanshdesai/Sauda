import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../../api";
import type { RequestInput, ShoppingRecord } from "../../types";

type EditorForm = Omit<RequestInput, "quantity"> & { quantity: string };

const indiaDate = (time = Date.now()) =>
  new Date(time).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export default function RequestEditor({
  onCreated,
  onUnauthorized,
  onCancel,
}: {
  onCreated: (record: ShoppingRecord) => void;
  onUnauthorized: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EditorForm>(() => ({
    item: "",
    variant: "",
    quantity: "1",
    currency: "INR",
    budget: { amount_inr: "", basis: "unit", delivery: "included", comparison: "at_most" },
    fulfilment: "pickup",
    area: "",
    required_by: indiaDate(Date.now() + 86400000),
    sellers: [{ name: "", phone: "" }],
    mode: "consented_roleplay",
  }));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const submissions = useRef(new Map<string, string>());
  const errorRef = useRef<HTMLParagraphElement>(null);

  const update = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateSeller = (index: number, field: "name" | "phone", value: string) =>
    update("sellers", form.sellers.map((seller, i) => i === index ? { ...seller, [field]: value } : seller));
  const fieldError = (id: string) => errors[id] && (
    <span className="ws-field-error" id={`${id}-error`}>{errors[id]}</span>
  );
  const describedBy = (id: string) => errors[id] ? `${id}-error` : undefined;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setServerError("");
    const element = event.currentTarget;
    const inputs = Array.from(element.querySelectorAll<HTMLInputElement>("input"));
    const phones = form.sellers.map((seller) => seller.phone.trim());
    for (const input of inputs) {
      input.setCustomValidity("");
      if (input.dataset.requestText !== undefined) {
        const value = input.value.trim();
        if (!value || /^(null|none|unknown|tbd|n\/a|undefined)$/i.test(value) || /{{|}}|[\n\r\0]/.test(value)) {
          input.setCustomValidity("Enter complete details, not a placeholder.");
        }
      }
      if (input.type === "tel" && input.value && phones.filter((phone) => phone === input.value.trim()).length > 1) {
        input.setCustomValidity("Each recipient needs a different phone number.");
      }
      if (input.type === "date") input.min = indiaDate();
    }
    const nextErrors: Record<string, string> = {};
    for (const input of inputs) {
      if (!input.validity.valid) nextErrors[input.id] = input.validationMessage;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      element.reportValidity();
      return;
    }

    const request: RequestInput = {
      ...form,
      item: form.item.trim(),
      variant: form.variant.trim(),
      area: form.area.trim(),
      quantity: Number(form.quantity),
      sellers: form.sellers.map((seller) => ({ name: seller.name.trim(), phone: seller.phone.trim() })),
    };
    const payload = JSON.stringify(request);
    let key = submissions.current.get(payload);
    if (!key) {
      key = crypto.randomUUID();
      submissions.current.set(payload, key);
    }
    submitting.current = true;
    setBusy(true);
    try {
      const record = await api<ShoppingRecord>("/requests", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: payload,
      });
      onCreated(record);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
      } else {
        setServerError(error instanceof Error ? error.message : "Could not save request.");
        requestAnimationFrame(() => errorRef.current?.focus());
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="ws-editor" aria-labelledby="ws-editor-title">
      <h2 id="ws-editor-title">New request</h2>
      <form className="ws-editor-form" onSubmit={submit} noValidate onInput={(event) => {
        const input = event.target;
        if (!(input instanceof HTMLInputElement)) return;
        input.setCustomValidity("");
        setErrors((current) => {
          if (!current[input.id]) return current;
          const next = { ...current };
          delete next[input.id];
          return next;
        });
      }}>
        <fieldset className="ws-editor-fields" disabled={busy}>
          <div className="ws-field">
            <label htmlFor="ws-item">Item</label>
            <input id="ws-item" data-request-text autoFocus required maxLength={500} value={form.item} onChange={(event) => update("item", event.target.value)} aria-invalid={!!errors["ws-item"]} aria-describedby={describedBy("ws-item")} />
            {fieldError("ws-item")}
          </div>
          <div className="ws-field">
            <label htmlFor="ws-variant">Variant</label>
            <input id="ws-variant" data-request-text required maxLength={500} value={form.variant} onChange={(event) => update("variant", event.target.value)} aria-invalid={!!errors["ws-variant"]} aria-describedby={describedBy("ws-variant")} />
            {fieldError("ws-variant")}
          </div>
          <div className="ws-field-row ws-budget-row">
            <div className="ws-field">
              <label htmlFor="ws-quantity">Quantity</label>
              <input id="ws-quantity" type="number" required min="1" max="10000" step="1" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} aria-invalid={!!errors["ws-quantity"]} aria-describedby={describedBy("ws-quantity")} />
              {fieldError("ws-quantity")}
            </div>
            <div className="ws-field">
              <label htmlFor="ws-budget">Budget (₹)</label>
              <input id="ws-budget" type="number" required min="0.01" max="100000000" step="0.01" value={form.budget.amount_inr} onChange={(event) => update("budget", { ...form.budget, amount_inr: event.target.value })} aria-invalid={!!errors["ws-budget"]} aria-describedby={describedBy("ws-budget")} />
              {fieldError("ws-budget")}
            </div>
            <div className="ws-field">
              <label htmlFor="ws-basis">Budget basis</label>
              <select id="ws-basis" value={form.budget.basis} onChange={(event) => update("budget", { ...form.budget, basis: event.target.value as "unit" | "total" })}>
                <option value="unit">Per item</option>
                <option value="total">Total</option>
              </select>
            </div>
          </div>
          <div className="ws-field-row">
            <div className="ws-field">
              <label htmlFor="ws-fulfilment">Fulfilment</label>
              <select id="ws-fulfilment" value={form.fulfilment} onChange={(event) => {
                const fulfilment = event.target.value as "pickup" | "delivery";
                setForm((current) => ({ ...current, fulfilment, budget: { ...current.budget, delivery: fulfilment === "pickup" ? "included" : current.budget.delivery } }));
              }}>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div className="ws-field">
              <label htmlFor="ws-area">Area</label>
              <input id="ws-area" data-request-text required maxLength={500} value={form.area} onChange={(event) => update("area", event.target.value)} aria-invalid={!!errors["ws-area"]} aria-describedby={describedBy("ws-area")} />
              {fieldError("ws-area")}
            </div>
          </div>
          <div className="ws-field">
            <label htmlFor="ws-date">Needed by</label>
            <input id="ws-date" type="date" required min={indiaDate()} value={form.required_by} onChange={(event) => update("required_by", event.target.value)} aria-invalid={!!errors["ws-date"]} aria-describedby={describedBy("ws-date")} />
            {fieldError("ws-date")}
          </div>
          <div className="ws-recipients">
            {form.sellers.map((seller, index) => (
              <div className="ws-recipient" key={index}>
                {index > 0 && <div className="ws-recipient-heading"><span>Recipient {index + 1}</span><button type="button" className="ws-remove" onClick={() => {
                  update("sellers", form.sellers.filter((_, i) => i !== index));
                  setErrors((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !id.startsWith("ws-name-") && !id.startsWith("ws-phone-"))));
                }}>Remove</button></div>}
                <div className="ws-field-row">
                  <div className="ws-field">
                    <label htmlFor={`ws-name-${index}`}>Recipient name</label>
                    <input id={`ws-name-${index}`} data-request-text required maxLength={500} value={seller.name} onChange={(event) => updateSeller(index, "name", event.target.value)} aria-invalid={!!errors[`ws-name-${index}`]} aria-describedby={describedBy(`ws-name-${index}`)} />
                    {fieldError(`ws-name-${index}`)}
                  </div>
                  <div className="ws-field">
                    <label htmlFor={`ws-phone-${index}`}>Phone with country code</label>
                    <input id={`ws-phone-${index}`} type="tel" required pattern="\+[1-9][0-9]{7,14}" title="Use E.164 format, for example +12025550123" placeholder="+91…" value={seller.phone} onChange={(event) => updateSeller(index, "phone", event.target.value)} aria-invalid={!!errors[`ws-phone-${index}`]} aria-describedby={describedBy(`ws-phone-${index}`)} />
                    {fieldError(`ws-phone-${index}`)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <details className="ws-options">
            <summary>Options</summary>
            <div className="ws-options-content">
              <label className="ws-check"><input type="checkbox" checked={form.budget.comparison === "under"} onChange={(event) => update("budget", { ...form.budget, comparison: event.target.checked ? "under" : "at_most" })} /> Strictly under budget</label>
              {form.fulfilment === "delivery" && <label className="ws-check"><input type="checkbox" checked={form.budget.delivery === "additional"} onChange={(event) => update("budget", { ...form.budget, delivery: event.target.checked ? "additional" : "included" })} /> Delivery additional (no set cap)</label>}
              {form.sellers.length < 5 && <button type="button" className="ws-add" onClick={() => update("sellers", [...form.sellers, { name: "", phone: "" }])}>Add recipient</button>}
            </div>
          </details>
          <div className="ws-consent">
            <label className="ws-check" htmlFor="ws-consent"><input id="ws-consent" type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} aria-invalid={!!errors["ws-consent"]} aria-describedby={describedBy("ws-consent")} /> I have permission for test calls to these numbers. Quotes only; no orders.</label>
            {fieldError("ws-consent")}
          </div>
        </fieldset>
        {serverError && <p className="ws-error" role="alert" tabIndex={-1} ref={errorRef}>{serverError}</p>}
        <div className="ws-editor-actions">
          <button type="button" className="ws-button-secondary" disabled={busy} onClick={onCancel}>Cancel</button>
          <button type="submit" className="ws-button-primary" disabled={busy}>{busy ? "Saving…" : "Save request"}</button>
        </div>
      </form>
    </section>
  );
}

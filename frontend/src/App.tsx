import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, LogOut, Plus, Search } from "lucide-react";
import { api, ApiError } from "./api";
import type { Config, ShoppingRecord } from "./types";
import RequestEditor from "./components/workspace/RequestEditor";
import RequestDetail from "./components/workspace/RequestDetail";
import "./workspace.css";

const money = (value: string) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(Number(value));
const activeStatuses: Record<string, true> = {
  dispatching: true, queued: true, scheduled: true, rescheduled: true,
  initiated: true, ringing: true, "in-progress": true, "call-disconnected": true,
};
function status(record: ShoppingRecord) {
  if (record.calls.some((call) => call.status === "dispatch_unknown")) return "Needs attention";
  if (record.calls.some((call) => activeStatuses[call.status] === true)) return "In progress";
  if (record.quotes.length) return "Review quote";
  return record.calls.length ? "Finished" : "Saved";
}

function Login({ onLogin }: { onLogin: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const code = new FormData(event.currentTarget).get("access_code");
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await api("/session", { method: "POST", body: JSON.stringify({ access_code: code }) });
      await onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="ws ws-login">
      <a className="ws-brand" href="#">sauda</a>
      <form onSubmit={submit}>
        <h1 className="ws-sr-only">Sign in</h1>
        <label htmlFor="ws-access">Access code</label>
        <input id="ws-access" name="access_code" type="password" autoComplete="current-password" autoFocus required minLength={32} disabled={busy} aria-describedby={error ? "ws-login-error" : undefined} />
        {error && <p className="ws-error" role="alert" id="ws-login-error">{error}</p>}
        <button className="ws-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Continue"}</button>
      </form>
    </main>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [records, setRecords] = useState<ShoppingRecord[]>([]);
  const [selected, setSelected] = useState<ShoppingRecord | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [mobileList, setMobileList] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const selectedId = useRef<string | null>(null);
  const initialized = useRef(false);
  const loadVersion = useRef(0);

  const endSession = useCallback(() => {
    loadVersion.current += 1;
    initialized.current = false;
    selectedId.current = null;
    setAuthenticated(false);
    setConfig(null);
    setRecords([]);
    setSelected(null);
    setId(null);
    setCreating(false);
    setQuery("");
    setError("");
  }, []);

  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    try {
      const [configuration, list] = await Promise.all([
        api<Config>("/config"),
        api<{ items: ShoppingRecord[] }>("/requests?limit=100"),
      ]);
      if (version !== loadVersion.current) return;
      setConfig(configuration);
      setRecords(list.items);
      setAuthenticated(true);
      if (!initialized.current) {
        initialized.current = true;
        selectedId.current = list.items[0]?.id ?? null;
        setId(selectedId.current);
        setCreating(!list.items.length);
        setMobileList(false);
      }
      const current = selectedId.current;
      if (current) {
        const detail = await api<ShoppingRecord>("/requests/" + current);
        if (version !== loadVersion.current || selectedId.current !== current) return;
        setSelected(detail);
      }
      setError("");
    } catch (e) {
      if (version !== loadVersion.current) return;
      if (e instanceof ApiError && e.status === 401) endSession();
      else {
        setError(e instanceof Error ? e.message : "Could not load requests.");
        throw e;
      }
    }
  }, [endSession]);

  useEffect(() => {
    void load().catch(() => {});
    return () => { loadVersion.current += 1; };
  }, [load]);
  useEffect(() => {
    if (!authenticated) return;
    const refresh = () => { if (!document.hidden) void load().catch(() => {}); };
    const timer = window.setInterval(refresh, 5000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [authenticated, load]);

  function open(record: ShoppingRecord) {
    selectedId.current = record.id;
    setId(record.id);
    setSelected(null);
    setCreating(false);
    setMobileList(false);
    void load().catch(() => {});
  }
  function newRequest() {
    setCreating(true);
    setMobileList(false);
  }
  function created(record: ShoppingRecord) {
    loadVersion.current += 1;
    selectedId.current = record.id;
    setId(record.id);
    setSelected(record);
    setRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);
    setCreating(false);
    setMobileList(false);
    setQuery("");
    setError("");
  }
  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await api("/session", { method: "DELETE" });
      endSession();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  if (authenticated === null) return (
    <main className="ws ws-loading">
      <a className="ws-brand" href="#">sauda</a>
      {error ? <><p className="ws-error" role="alert">{error}</p><button className="ws-secondary" onClick={() => void load().catch(() => {})}>Retry</button></> : <p role="status">Loading…</p>}
    </main>
  );
  if (!authenticated) return <Login onLogin={load} />;
  const search = query.trim().toLowerCase();
  const filtered = records.filter((record) => [record.request.item, record.request.variant, record.request.area, ...record.request.sellers.map((seller) => seller.name)].join(" ").toLowerCase().includes(search));

  return (
    <div className="ws ws-app" data-mobile-view={mobileList ? "list" : "content"}>
      <header className="ws-header">
        <a className="ws-brand" href="#" aria-label="Sauda home">sauda</a>
        <div>
          <button className="ws-new ws-primary" disabled={creating} onClick={newRequest}><Plus size={16} /> New request</button>
          <button className="ws-signout ws-icon" aria-label="Sign out" title="Sign out" disabled={signingOut} onClick={() => void logout()}><LogOut size={17} /></button>
        </div>
      </header>
      <div className="ws-layout">
        <aside className="ws-sidebar" aria-label="Requests">
          <h2>Requests</h2>
          <div className="ws-search-wrap"><Search size={16} aria-hidden="true" /><input className="ws-search" aria-label="Search requests" placeholder="Search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <nav aria-label="Saved requests">
            {filtered.map((record) => (
              <button key={record.id} className="ws-request-row" aria-current={!creating && id === record.id ? "page" : undefined} disabled={creating} onClick={() => open(record)}>
                <span className="ws-row-title">{record.request.item}</span>
                <span className="ws-row-meta">{record.request.quantity} {record.request.quantity === 1 ? "item" : "items"} · {money(record.request.budget.amount_inr)} {record.request.budget.basis === "total" ? "total budget" : "/ item"}</span>
                <span className="ws-row-status">{status(record)}</span>
              </button>
            ))}
          </nav>
          {!filtered.length && <p className="ws-empty">{search ? "No matches" : "No requests"}</p>}
        </aside>
        <main className="ws-main" id="workspace-main">
          {!creating && <button className="ws-mobile-back ws-secondary" aria-label="Requests" onClick={() => setMobileList(true)}><ArrowLeft size={15} /> Requests</button>}
          {error && <div className="ws-connection-error"><p className="ws-error" role="alert">{error}</p><button className="ws-secondary" onClick={() => void load().catch(() => {})}>Retry</button></div>}
          {creating ? <RequestEditor onCreated={created} onUnauthorized={endSession} onCancel={() => { setCreating(false); if (!selectedId.current) setMobileList(true); }} />
            : selected && config ? <RequestDetail key={selected.id} record={selected} config={config} onChanged={load} onUnauthorized={endSession} />
            : id ? <p role="status">Loading…</p> : <p className="ws-empty">No requests</p>}
        </main>
      </div>
    </div>
  );
}

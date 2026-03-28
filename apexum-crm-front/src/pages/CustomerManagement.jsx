// /src/pages/CustomerManagement.jsx
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { toast } from "react-toastify";
import {
  FiUsers, FiSearch, FiPlus, FiChevronLeft, FiChevronRight,
  FiUserCheck, FiEye, FiMail, FiPhone, FiGlobe, FiMapPin,
  FiUserPlus, FiSave, FiX
} from "react-icons/fi";
import { Link } from "react-router-dom";

// axios helpers (api already adds Authorization)
const get   = (url, params={}) => api.get(url, { params });
const post  = (url, body)       => api.post(url, body);
const patch = (url, body)       => api.patch(url, body);

// fixed page size
const PER_PAGE = 12;

export default function CustomerManagement() {
  // filters & pagination
  const [q, setQ] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [page, setPage] = useState(1);

  // data
  const [reps, setReps] = useState([]);             // [{id,name}]
  const [repsReady, setRepsReady] = useState(true); // false if endpoint blocked
  const [items, setItems] = useState([]);           // customers
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", email: "", phone: "", website: "", industry: "", address: "", owner_id: ""
  });

  // details modal
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // per-card ownership change
  const [ownerPick, setOwnerPick] = useState({}); // { [customerId]: repId }
  const [ownerBusy, setOwnerBusy] = useState(0);

  // load sales reps list (everyone filtered by role)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await get("/users", { role: "sales_rep", per_page: 1000 });
        const rows = Array.isArray(data?.data) ? data.data : data;
        setReps(rows.map(u => ({ id: u.id, name: u.name })));
        setRepsReady(true);
      } catch {
        setRepsReady(false);
        setReps([]);
        toast.error("Cannot load Sales Reps.");
      }
    })();
  }, []);

  // load customers (uses fixed PER_PAGE)
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await get("/manager/customers", {
        search: q || undefined,
        owner_id: ownerId || undefined,
        per_page: PER_PAGE,
        page
      });
      setItems(data?.data ?? []);
      setMeta(data?.meta ?? { current_page: 1, last_page: 1 });
    } catch {
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  // initial + on page change
  useEffect(() => { load(); /* eslint-disable-line */ }, [page]);

  // debounce for filters, resets to page 1
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q, ownerId]);

  // create customer
  const submitCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await post("/manager/customers", createForm);
      toast.success("Customer created.");
      setShowCreate(false);
      setCreateForm({ name:"", email:"", phone:"", website:"", industry:"", address:"", owner_id:"" });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed.");
    } finally {
      setCreating(false);
    }
  };

  // details
  const openDetails = async (id) => {
    setShowDetails(true);
    setDetails(null);
    setDetailsLoading(true);
    try {
      const { data } = await get(`/manager/customers/${id}`);
      setDetails(data?.data ?? data);
    } catch {
      toast.error("Failed to load details.");
      setShowDetails(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ownership change
  const applyOwner = async (customerId) => {
    const repId = ownerPick[customerId];
    if (!repId) return;
    const rep = reps.find(r => String(r.id) === String(repId));
    if (!rep) return;

    setOwnerBusy(customerId);
    try {
      await patch(`/manager/customers/${customerId}/ownership`, { sales_rep_name: rep.name });
      toast.success("Owner updated.");
      setOwnerPick(s => ({ ...s, [customerId]: "" }));
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Owner update failed.");
    } finally {
      setOwnerBusy(0);
    }
  };

  // simple pagination helpers
  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;
  const goPrev  = () => canPrev && setPage(p => p - 1);
  const goNext  = () => canNext && setPage(p => p + 1);

  return (
    <main className="container" style={{ paddingTop: 10 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <IconBadge><FiUsers /></IconBadge>
          <h2 style={{ margin: 0 }}>Customer Management</h2>
          <nav className="breadcrumbs">
              <Link to="/manager/home">Home</Link> / <span>Customer Management</span>
          </nav>
        </div>
        <button className="btn" style={{ marginLeft: "auto" }} onClick={() => setShowCreate(true)}>
          <FiPlus /> New
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1.5fr) 1fr", gap: 10, marginBottom: 12 }}>
        <FieldLike icon={<FiSearch />}>
          <input className="input" placeholder="Search name or email…" value={q} onChange={e=>setQ(e.target.value)} />
        </FieldLike>

        <SelectLike icon={<FiUserCheck />}>
          <select className="select" value={ownerId} onChange={e=>setOwnerId(e.target.value)} disabled={!repsReady || reps.length===0}>
            <option value="">{repsReady ? "All Sales Reps" : "Reps unavailable"}</option>
            {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </SelectLike>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 16, opacity: .85 }}>Loading…</div>
      ) : (
        <>
          <div className="mgr-cta-grid">
            {items.map(c => (
              <article key={c.id} className="mgr-cta-card" style={{ gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={c.name} />
                  <div>
                    <h3 style={{ margin: 0 }}>{c.name}</h3>
                    <div style={{ fontSize: 13, color: "var(--apx-muted)" }}>
                      Owner: {c?.owner?.name ?? "—"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Mini icon={<FiMail />}  text={c.email   || "—"} />
                  <Mini icon={<FiPhone />} text={c.phone   || "—"} />
                  <Mini icon={<FiGlobe />} text={c.website || "—"} />
                  <Mini icon={<FiMapPin />} text={c.address || "—"} />
                </div>

                {/* Change owner */}
                <div style={{ display: "flex", gap: 8 }}>
                  <SelectLike icon={<FiUserCheck />} style={{ flex: 1 }}>
                    <select
                      className="select"
                      value={ownerPick[c.id] || ""}
                      onChange={(e)=>setOwnerPick(s=>({ ...s, [c.id]: e.target.value }))}
                      disabled={!repsReady || reps.length===0}
                    >
                      <option value="">Change owner…</option>
                      {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </SelectLike>

                  <button className="btn" disabled={!ownerPick[c.id] || ownerBusy === c.id} onClick={() => applyOwner(c.id)}>
                    {ownerBusy === c.id ? "Saving…" : <><FiSave /> Apply</>}
                  </button>
                </div>

                <button className="btn" onClick={() => openDetails(c.id)} style={{ justifySelf: "start" }}>
                  <FiEye /> Details
                </button>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn" disabled={!canPrev} onClick={goPrev}><FiChevronLeft /></button>
            <div style={{ opacity: .85 }}>
              Page <b>{meta.current_page}</b> / {meta.last_page} &nbsp;•&nbsp; {PER_PAGE} per page
            </div>
            <button className="btn" disabled={!canNext} onClick={goNext}><FiChevronRight /></button>
          </div>
        </>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title={<span style={{display:"inline-flex",alignItems:"center",gap:8}}><FiUserPlus /> Create Customer</span>}
               onClose={() => setShowCreate(false)}>
          <form className="form" onSubmit={submitCreate}>
            <FieldLike icon={<FiUsers />}><input className="input" placeholder="Name *"
              value={createForm.name} onChange={e=>setCreateForm(s=>({...s,name:e.target.value}))} required /></FieldLike>

            <FieldLike icon={<FiMail />}><input className="input" type="email" placeholder="Email *"
              value={createForm.email} onChange={e=>setCreateForm(s=>({...s,email:e.target.value}))} required /></FieldLike>

            <FieldLike icon={<FiPhone />}><input className="input" placeholder="Phone"
              value={createForm.phone} onChange={e=>setCreateForm(s=>({...s,phone:e.target.value}))} /></FieldLike>

            <FieldLike icon={<FiGlobe />}><input className="input" placeholder="Website"
              value={createForm.website} onChange={e=>setCreateForm(s=>({...s,website:e.target.value}))} /></FieldLike>

            <FieldLike icon={<FiUsers />}><input className="input" placeholder="Industry"
              value={createForm.industry} onChange={e=>setCreateForm(s=>({...s,industry:e.target.value}))} /></FieldLike>

            <FieldLike icon={<FiMapPin />}><input className="input" placeholder="Address"
              value={createForm.address} onChange={e=>setCreateForm(s=>({...s,address:e.target.value}))} /></FieldLike>

            <SelectLike icon={<FiUserCheck />}>
              <select className="select" required disabled={!repsReady || reps.length===0}
                value={createForm.owner_id} onChange={e=>setCreateForm(s=>({...s, owner_id: e.target.value}))}>
                <option value="">{repsReady ? "Select Sales Rep *" : "Reps unavailable"}</option>
                {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </SelectLike>

            <div style={{ display:"flex", gap:10 }}>
              <button className="btn" type="submit" disabled={creating || !createForm.name || !createForm.email || !createForm.owner_id}>
                {creating ? "Creating…" : <><FiSave /> Save</>}
              </button>
              <button type="button" className="btn" onClick={() => setShowCreate(false)}>
                <FiX /> Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Details modal */}
      {showDetails && (
        <Modal title="Customer Details" onClose={() => setShowDetails(false)}>
          {detailsLoading ? (
            <div style={{ padding: 10 }}>Loading…</div>
          ) : details ? (
            <Details c={details} />
          ) : (
            <div style={{ padding: 10 }}>No data.</div>
          )}
        </Modal>
      )}
    </main>
  );
}

/* ---------- tiny UI bits ---------- */

function IconBadge({ children }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      display:"grid", placeItems:"center",
      background:"#14181e", border:"1px solid var(--apx-border)"
    }}>{children}</div>
  );
}
function FieldLike({ icon, children }) {
  return (
    <div className="field">
      <div className="field-icon">{icon}</div>
      {children}
    </div>
  );
}
function SelectLike({ icon, children, style }) {
  return (
    <div className="select-wrap" style={style}>
      <div className="field-icon">{icon}</div>
      {children}
    </div>
  );
}
function Mini({ icon, text }) {
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", background:"#14181e", border:"1px solid var(--apx-border)", borderRadius:10, padding:"8px 10px" }}>
      <span>{icon}</span><span style={{ fontSize:13, color:"var(--apx-muted)" }}>{text}</span>
    </div>
  );
}
function Avatar({ name="" }) {
  const initials = name.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase() || "C";
  return (
    <div style={{
      width: 46, height: 46, borderRadius: 10, display:"grid", placeItems:"center",
      background:"#151a20", border:"1px solid var(--apx-border)", fontWeight:800
    }}>{initials}</div>
  );
}
function Details({ c }) {
  return (
    <div style={{ display:"grid", gap: 12 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <Avatar name={c.name} />
        <div>
          <h3 style={{ margin: 0 }}>{c.name}</h3>
          <div style={{ fontSize: 13, color: "var(--apx-muted)" }}>Owner: {c?.owner?.name ?? "—"}</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 8 }}>
        <Mini icon={<FiMail />}  text={c.email || "—"} />
        <Mini icon={<FiPhone />} text={c.phone || "—"} />
        <Mini icon={<FiGlobe />} text={c.website || "—"} />
        <Mini icon={<FiMapPin />} text={c.address || "—"} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        <Stat label="Opportunities" value={c?.opportunities?.length ?? 0} />
        <Stat label="Activities"    value={c?.activities?.length ?? 0} />
        <Stat label="Industry"      value={c?.industry || "—"} />
      </div>
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div style={{ padding:"10px 12px", border:"1px solid var(--apx-border)", background:"#151a20", borderRadius:12 }}>
      <div style={{ fontSize:12, color:"var(--apx-muted)" }}>{label}</div>
      <div style={{ fontWeight:800, fontSize:18 }}>{value}</div>
    </div>
  );
}
function Modal({ title, children, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"grid", placeItems:"center", zIndex:50, padding:16 }}>
      <div style={{ width:"min(720px,96vw)", background:"#1b1f25", border:"1px solid var(--apx-border)", borderRadius:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid var(--apx-border)" }}>
          <h3 style={{ margin:0 }}>{title}</h3>
          <button className="btn" onClick={onClose}><FiX /> Close</button>
        </div>
        <div style={{ padding:16 }}>{children}</div>
      </div>
    </div>
  );
}

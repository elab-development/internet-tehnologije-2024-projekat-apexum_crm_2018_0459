// /src/pages/MyCustomers.jsx
import { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import {
  FiUsers, FiPlus, FiEdit2, FiCheckSquare, FiX, FiDownload,
  FiDollarSign, FiClock, FiMail, FiPhone, FiGlobe, FiMapPin, FiEye, FiLock
} from "react-icons/fi";
import { Link } from "react-router-dom";

/* ------------------------ tiny request helpers ------------------------ */
const get   = (url, params = {}) => api.get(url, { params });
const post  = (url, body)       => api.post(url, body);
const put   = (url, body)       => api.put(url, body);
const patch = (url, body)       => api.patch(url, body);

/* ------------------------ constants/enums ------------------------ */
// opportunity stages expected by backend
const OPP_STAGES = ["prospecting", "qualification", "proposal", "won", "lost"];

// Activity enums from the backend model (keep values EXACT)
const ACT_TYPES    = ["call", "email", "meeting", "task"];
const ACT_STATUSES = ["open", "completed", "cancelled"];

// pretty labels
const labelize = (str = "") =>
  str.split("_").map(w => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");

/* ------------------------ helpers ------------------------ */
// read the logged-in user id from sessionStorage; supports several keys
const readUserIdFromSession = () => {
  const direct = sessionStorage.getItem("user_id") || sessionStorage.getItem("uid");
  if (direct) return Number(direct);
  for (const key of ["auth_user", "user", "me", "auth"]) {
    const raw = sessionStorage.getItem(key);
    if (!raw) continue;
    try {
      const obj = JSON.parse(raw);
      if (obj?.id != null) return Number(obj.id);
      if (obj?.user?.id != null) return Number(obj.user.id);
    } catch {}
  }
  return null;
};

// normalize any backend shape into an array
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.customers)) return payload.customers;
  return [];
};

// true if the given entity is owned by the current user
const isOwnedByMe = (entity, meId) => {
  if (meId == null || !entity) return false;
  const candidates = [
    entity.owner_id,
    entity.ownerId,
    entity?.owner?.id,
    entity?.owner?.ID,
  ];
  return candidates.some((v) => v != null && Number(v) === Number(meId));
};

/* ===================================================================== */

export default function MyCustomers() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  // current user id from sessionStorage
  const [meId, setMeId] = useState(() => readUserIdFromSession());

  // list modals
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [showOppList, setShowOppList] = useState(false);
  const [showActList, setShowActList] = useState(false);

  // create modals (nested)
  const [showOppCreate, setShowOppCreate] = useState(false);
  const [showActCreate, setShowActCreate] = useState(false);

  // forms
  const [oppForm, setOppForm] = useState({
    customer_id: "", title: "", amount: "", stage: "prospecting", close_date: "",
  });
  const [creatingOpp, setCreatingOpp] = useState(false);

  const [actForm, setActForm] = useState({
    customer_id: "", opportunity_id: "", type: "call", subject: "", notes: "", status: "open", due_date: "",
  });
  const [creatingAct, setCreatingAct] = useState(false);

  // inline updates
  const [updatingOppId, setUpdatingOppId] = useState(0);
  const [updatingActId, setUpdatingActId] = useState(0);
  const [newOppStage,  setNewOppStage]  = useState({});
  const [newActStatus, setNewActStatus] = useState({});

  // keep user id fresh if sessionStorage changes
  useEffect(() => {
    const onStorage = () => setMeId(readUserIdFromSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await get("/sales/my-customers");
      setCustomers(toArray(data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your customers.");
      setCustomers([]); // ensure it's always an array
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadCustomers(); }, []);

  /* ---------- open/close helpers ---------- */
  const openOppList = (customer) => { setActiveCustomer(customer); setShowOppList(true); };
  const openActList = (customer) => { setActiveCustomer(customer); setShowActList(true); };

  const openCreateOpp = () => {
    if (!activeCustomer) return;
    setOppForm({ customer_id: activeCustomer.id, title: "", amount: "", stage: "prospecting", close_date: "" });
    setShowOppCreate(true);
  };
  const openCreateAct = () => {
    if (!activeCustomer) return;
    setActForm({ customer_id: activeCustomer.id, opportunity_id: "", type: "call", subject: "", notes: "", status: "open", due_date: "" });
    setShowActCreate(true);
  };

  /* ---------- create handlers ---------- */
  const submitOpportunity = async (e) => {
    e.preventDefault();
    if (!oppForm.title || !oppForm.amount || !oppForm.customer_id || !oppForm.stage) {
      toast.error("Title, Amount, Stage and Customer are required.");
      return;
    }
    const payload = {
      customer_id: oppForm.customer_id,
      title: oppForm.title,
      amount: Number(oppForm.amount),
      stage: oppForm.stage,
      ...(oppForm.close_date ? { close_date: oppForm.close_date } : {}),
      ...(meId ? { owner_id: meId } : {}),
    };
    setCreatingOpp(true);
    try {
      await post("/sales/opportunities", payload);
      toast.success("Opportunity created.");
      setShowOppCreate(false);
      setShowOppList(false);
      setActiveCustomer(null);
      await loadCustomers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create opportunity.");
    } finally {
      setCreatingOpp(false);
    }
  };

  const submitActivity = async (e) => {
    e.preventDefault();
    if (!actForm.customer_id || !actForm.subject) {
      toast.error("Customer and Subject are required.");
      return;
    }
    const payload = {
      customer_id: actForm.customer_id,
      subject: actForm.subject,
      type: actForm.type || "call",
      notes: actForm.notes || "",
      status: actForm.status || "open",
      ...(actForm.opportunity_id ? { opportunity_id: actForm.opportunity_id } : {}),
      ...(actForm.due_date ? { due_date: actForm.due_date } : {}),
      ...(meId ? { owner_id: meId } : {}),
    };
    setCreatingAct(true);
    try {
      await post("/sales/activities", payload);
      toast.success("Activity added.");
      setShowActCreate(false);
      setShowActList(false);
      setActiveCustomer(null);
      await loadCustomers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add activity.");
    } finally {
      setCreatingAct(false);
    }
  };

  /* ---------- inline updates ---------- */
  // PUT for opportunity updates
  const applyOpportunityStage = async (oppId) => {
    const stage = newOppStage[oppId];
    if (!stage) return;
    setUpdatingOppId(oppId);
    try {
      await put(`/sales/opportunities/${oppId}`, { stage });
      toast.success("Opportunity updated.");
      setNewOppStage((s) => ({ ...s, [oppId]: "" }));
      await loadCustomers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update opportunity.");
    } finally {
      setUpdatingOppId(0);
    }
  };

  // PATCH for activity status
  const applyActivityStatus = async (actId) => {
    const status = newActStatus[actId];
    if (!status) return;
    setUpdatingActId(actId);
    try {
      await patch(`/sales/activities/${actId}/status`, { status });
      toast.success("Activity status updated.");
      setNewActStatus((s) => ({ ...s, [actId]: "" }));
      await loadCustomers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update activity.");
    } finally {
      setUpdatingActId(0);
    }
  };

  // export one customer to PDF (axios => carries auth)
  const exportPdf = async (customerId) => {
    try {
      const res = await api.get(`/export/customers/${customerId}/pdf`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `customer-${customerId}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to export PDF.");
    }
  };

  // ownership helper: opportunity is editable if I own it (via owner_id OR owner.id)
  const canEditOpportunity = (opp) => isOwnedByMe(opp, meId);

  // activity is editable if I own the activity OR I own the parent opportunity
  const canEditActivity = (act) =>
    isOwnedByMe(act, meId) || isOwnedByMe(act?.opportunity, meId);

  return (
    <main className="container myc-root">
      {/* Header */}
      <div className="myc-header">
        <div className="myc-titlewrap">
          <IconBadge><FiUsers /></IconBadge>
          <h2 className="myc-title">My Customers</h2>
                <nav className="breadcrumbs">
      <Link to="/sales/home">Home</Link> / <span>My Customers</span>
      </nav>
        </div>
      </div>

      {loading ? (
        <div className="myc-loading">Loading…</div>
      ) : customers.length === 0 ? (
        <div className="myc-empty">
          <h3 className="myc-empty-title">No customers yet</h3>
          <p className="myc-empty-sub">
            You don’t have any accounts assigned. When your manager assigns you as the owner,
            your customers will appear here.
          </p>
        </div>
      ) : (
        <div className="mgr-cta-grid">
          {customers.map((c) => (
            <article key={c.id} className="mgr-cta-card myc-card">
              {/* Card head */}
              <div className="myc-card-head">
                <Avatar name={c.name} />
                <div className="myc-card-head-main">
                  <h3 className="myc-card-name">{c.name}</h3>
                  {(c.owner?.name || c.owner_name) && (
                    <div className="myc-owner-line">Owner: {c.owner?.name || c.owner_name}</div>
                  )}
                </div>
              </div>

              {/* Details grid (pills) */}
              <div className="myc-info-grid">
                {c.email && (<div className="myc-pill"><span className="myc-pill-ico"><FiMail/></span><span className="myc-pill-text">{c.email}</span></div>)}
                {c.phone && (<div className="myc-pill"><span className="myc-pill-ico"><FiPhone/></span><span className="myc-pill-text">{c.phone}</span></div>)}
                {c.website && (<div className="myc-pill myc-col-span-2-sm"><span className="myc-pill-ico"><FiGlobe/></span><span className="myc-pill-text">{c.website}</span></div>)}
                {c.address && (<div className="myc-pill myc-col-span-2-sm"><span className="myc-pill-ico"><FiMapPin/></span><span className="myc-pill-text">{c.address}</span></div>)}
              </div>

              {/* Under-card actions */}
              <div className="myc-actions myc-actions-block">
                <button className="btn btn-primary" onClick={() => openOppList(c)}><FiEye/> View Opportunities</button>
                <button className="btn btn-primary" onClick={() => openActList(c)}><FiEye/> View Activities</button>
                <button className="btn btn-ghost" onClick={() => exportPdf(c.id)} title="Export to PDF"><FiDownload/> Export</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* -------- Opportunities List Modal -------- */}
      {showOppList && activeCustomer && (
        <Modal onClose={() => { setShowOppList(false); setActiveCustomer(null); }}>
          <div className="myc-modal-header">
            <h3 className="myc-modal-title">Opportunities · {activeCustomer.name}</h3>
            <button className="btn btn-primary" onClick={openCreateOpp}><FiPlus/> New Opportunity</button>
          </div>

          <div className="myc-scrollarea">
            {Array.isArray(activeCustomer.opportunities) && activeCustomer.opportunities.length ? (
              <table className="myc-table">
                <thead className="myc-thead">
                  <tr>
                    <th className="myc-th myc-th-left">Title</th>
                    <th className="myc-th">Amount</th>
                    <th className="myc-th">Stage</th>
                    <th className="myc-th">Close Date</th>
                    <th className="myc-th myc-th-right">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCustomer.opportunities.map((o) => {
                    const canEdit = canEditOpportunity(o);
                    return (
                      <tr key={o.id} className="myc-tr">
                        <td className="myc-td myc-td-left">
                          <span className="myc-row-pill"><FiDollarSign/> {o.title}</span>
                        </td>
                        <td className="myc-td">${Number(o.amount || 0).toLocaleString()}</td>
                        <td className="myc-td">{labelize(o.stage)}</td>
                        <td className="myc-td">{o.close_date || "—"}</td>
                        <td className="myc-td myc-td-right">
                          {canEdit ? (
                            <div className="myc-row-actions">
                              <select
                                className="select"
                                value={newOppStage[o.id] || ""}
                                onChange={(e) => setNewOppStage((s) => ({ ...s, [o.id]: e.target.value }))}
                              >
                                <option value="">Set stage…</option>
                                {OPP_STAGES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}
                              </select>
                              <button
                                className="btn btn-primary"
                                disabled={!newOppStage[o.id] || updatingOppId === o.id}
                                onClick={() => applyOpportunityStage(o.id)}
                              >
                                {updatingOppId === o.id ? "Saving…" : <><FiCheckSquare/> Apply</>}
                              </button>
                            </div>
                          ) : (
                            <div className="muted" title="Only the owner can update">
                              <FiLock style={{verticalAlign:"middle", opacity:.8}}/> View only
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="muted myc-empty-pad">No opportunities yet.</div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Opportunity (nested) */}
      {showOppCreate && (
        <Modal onClose={() => setShowOppCreate(false)}>
          <div className="myc-modal-header">
            <h3 className="myc-modal-title">New Opportunity</h3>
          </div>
          <form className="form myc-form-pad" onSubmit={submitOpportunity}>
            <Field icon={<FiDollarSign />}><input className="input" placeholder="Title *" value={oppForm.title} onChange={(e)=>setOppForm(s=>({...s,title:e.target.value}))} required /></Field>
            <Field icon={<FiDollarSign />}><input className="input" type="number" placeholder="Amount *" value={oppForm.amount} onChange={(e)=>setOppForm(s=>({...s,amount:e.target.value}))} required /></Field>
            <Field icon={<FiClock />}><input className="input" type="date" placeholder="Close date" value={oppForm.close_date} onChange={(e)=>setOppForm(s=>({...s,close_date:e.target.value}))} /></Field>
            <div className="select-wrap">
              <div className="field-icon"><FiEdit2 /></div>
              <select className="select" value={oppForm.stage} onChange={(e)=>setOppForm(s=>({...s,stage:e.target.value}))} required>
                {OPP_STAGES.map(s => <option key={s} value={s}>{labelize(s)}</option>)}
              </select>
            </div>
            <div className="myc-modal-actions">
              <button className="btn btn-primary" type="submit" disabled={creatingOpp}>{creatingOpp ? "Creating…" : "Create"}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowOppCreate(false)}><FiX /> Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* -------- Activities List Modal -------- */}
      {showActList && activeCustomer && (
        <Modal onClose={() => { setShowActList(false); setActiveCustomer(null); }}>
          <div className="myc-modal-header">
            <h3 className="myc-modal-title">Activities · {activeCustomer.name}</h3>
            <button className="btn btn-primary" onClick={openCreateAct}><FiPlus/> New Activity</button>
          </div>

          <div className="myc-scrollarea">
            {Array.isArray(activeCustomer.activities) && activeCustomer.activities.length ? (
              <table className="myc-table">
                <thead className="myc-thead">
                  <tr>
                    <th className="myc-th myc-th-left">Subject</th>
                    <th className="myc-th">Type</th>
                    <th className="myc-th">Status</th>
                    <th className="myc-th">Due</th>
                    <th className="myc-th">Opportunity</th>
                    <th className="myc-th myc-th-right">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCustomer.activities.map((a) => {
                    const canEdit = canEditActivity(a);
                    return (
                      <tr key={a.id} className="myc-tr">
                        <td className="myc-td myc-td-left">
                          <span className="myc-row-pill"><FiClock/> {a.subject}</span>
                        </td>
                        <td className="myc-td">{labelize(a.type)}</td>
                        <td className="myc-td">{labelize(a.status)}</td>
                        <td className="myc-td">{a.due_date || "—"}</td>
                        <td className="myc-td">{a?.opportunity?.title || "—"}</td>
                        <td className="myc-td myc-td-right">
                          {canEdit ? (
                            <div className="myc-row-actions">
                              <select
                                className="select"
                                value={newActStatus[a.id] || ""}
                                onChange={(e) => setNewActStatus((s) => ({ ...s, [a.id]: e.target.value }))}
                              >
                                <option value="">Set status…</option>
                                {ACT_STATUSES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}
                              </select>
                              <button
                                className="btn btn-primary"
                                disabled={!newActStatus[a.id] || updatingActId === a.id}
                                onClick={() => applyActivityStatus(a.id)}
                              >
                                {updatingActId === a.id ? "Saving…" : <><FiEdit2/> Update</>}
                              </button>
                            </div>
                          ) : (
                            <div className="muted" title="Only the owner can update">
                              <FiLock style={{verticalAlign:"middle", opacity:.8}}/> View only
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="muted myc-empty-pad">No activities yet.</div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Activity (nested) */}
      {showActCreate && (
        <Modal onClose={() => setShowActCreate(false)}>
          <div className="myc-modal-header">
            <h3 className="myc-modal-title">New Activity</h3>
          </div>
          <form className="form myc-form-pad" onSubmit={submitActivity}>
            <Field icon={<FiEdit2 />}><input className="input" placeholder="Subject *" value={actForm.subject} onChange={(e)=>setActForm(s=>({...s,subject:e.target.value}))} required /></Field>

            <div className="select-wrap">
              <div className="field-icon"><FiEdit2 /></div>
              <select className="select" value={actForm.type} onChange={(e)=>setActForm(s=>({...s, type: e.target.value}))}>
                {ACT_TYPES.map(t => <option key={t} value={t}>{labelize(t)}</option>)}
              </select>
            </div>

            <Field icon={<FiClock />}><input className="input" type="date" placeholder="Due date" value={actForm.due_date} onChange={(e)=>setActForm(s=>({...s,due_date:e.target.value}))} /></Field>
            <Field icon={<FiEdit2 />}><textarea className="input" rows={3} placeholder="Notes" value={actForm.notes} onChange={(e)=>setActForm(s=>({...s,notes:e.target.value}))} /></Field>

            <div className="select-wrap">
              <div className="field-icon"><FiUsers /></div>
              <select
                className="select"
                value={actForm.opportunity_id}
                onChange={(e)=>setActForm(s=>({...s,opportunity_id:e.target.value}))}
                disabled={!activeCustomer || !(activeCustomer.opportunities?.length)}
              >
                {activeCustomer?.opportunities?.length ? (
                  <>
                    <option value="">No opportunity (optional)</option>
                    {activeCustomer.opportunities.map(o => (
                      <option key={o.id} value={o.id}>{o.title} — ${Number(o.amount||0).toLocaleString()}</option>
                    ))}
                  </>
                ) : (
                  <option value="">No opportunities yet</option>
                )}
              </select>
            </div>

            <div className="select-wrap">
              <div className="field-icon"><FiEdit2 /></div>
              <select className="select" value={actForm.status} onChange={(e)=>setActForm(s=>({...s,status:e.target.value}))}>
                {ACT_STATUSES.map(s => <option key={s} value={s}>{labelize(s)}</option>)}
              </select>
            </div>

            <div className="myc-modal-actions">
              <button className="btn btn-primary" type="submit" disabled={creatingAct}>{creatingAct ? "Saving…" : "Save"}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowActCreate(false)}><FiX /> Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}

/* ---------- small UI primitives ---------- */
function IconBadge({ children }) { return <div className="myc-icon-badge">{children}</div>; }
function Avatar({ name = "" }) {
  const initials = name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase() || "C";
  return <div className="myc-avatar">{initials}</div>;
}
function Inline({ icon, text }) {
  return (
    <span className="myc-inline">
      <span className="myc-inline-ico">{icon}</span>
      <span>{text}</span>
    </span>
  );
}
function Field({ icon, children }) {
  return (
    <div className="field">
      <div className="field-icon">{icon}</div>
      {children}
    </div>
  );
}

/* ---------- modal shell ---------- */
function Modal({ children, onClose }) {
  return (
    <div className="myc-modal">
      <div className="myc-modal-card">
        <div className="myc-modal-close">
          <button className="btn btn-ghost" onClick={onClose}><FiX /> Close</button>
        </div>
        <div className="myc-modal-body">{children}</div>
      </div>
    </div>
  );
}

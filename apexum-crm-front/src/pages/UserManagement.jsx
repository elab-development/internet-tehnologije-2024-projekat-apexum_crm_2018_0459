import { useEffect, useRef, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { Link } from "react-router-dom";

/* --- constants --- */
const ROLES = ["admin", "manager", "sales_rep"];
const roleLabel = (r) =>
  (r || "")
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

/* --- small debounce hook --- */
const useDebounced = (value, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export default function UserManagement() {
  /* ---- query state ---- */
  const [role, setRole] = useState(""); // admin | manager | sales_rep | ""
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 450);

  // NEW: sort by name (asc | desc)
  const [order, setOrder] = useState("asc");

  // removed per-page UI; always 6
  const PER_PAGE = 6;

  // paging
  const [page, setPage] = useState(1);

  /* ---- data state ---- */
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    last_page: 1,
    current_page: 1,
  });

  /* ---- delete dialog ---- */
  const [toDelete, setToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", {
        params: {
          role: role || undefined,
          search: debouncedSearch || undefined,
          per_page: PER_PAGE,
          page,
          order, // ask backend to sort by name in this direction if supported
        },
      });

      // Resource collection or paginator
      const list = data?.data ?? data ?? [];

      // Fallback client-side sort (ensures correct order even if API ignores "order")
      list.sort((a, b) => {
        const an = (a?.name || "").toLowerCase();
        const bn = (b?.name || "").toLowerCase();
        if (an < bn) return order === "asc" ? -1 : 1;
        if (an > bn) return order === "asc" ? 1 : -1;
        return 0;
      });

      setRows(list);

      const metaGuess =
        data?.meta ??
        {
          total: data?.total ?? list.length,
          last_page: data?.last_page ?? 1,
          current_page: data?.current_page ?? page,
        };
      setMeta(metaGuess);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [role, debouncedSearch, order]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, debouncedSearch, page, order]);

  const onConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/admin/users/${toDelete.id}`);
      toast.success("User deleted.");
      setToDelete(null);
      const willBeEmpty = rows.length === 1 && page > 1;
      if (willBeEmpty) setPage((p) => Math.max(1, p - 1));
      else fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete user.");
    }
  };

  const RoleChip = ({ value }) => (
    <span
      className={`adm-um-chip ${
        value === "admin"
          ? "adm-um-chip--admin"
          : value === "manager"
          ? "adm-um-chip--manager"
          : "adm-um-chip--sales"
      }`}
      title={value}
    >
      {roleLabel(value)}
    </span>
  );

  const Initials = ({ name = "" }) => {
    const initials = name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return <div className="adm-um-avatar">{initials || "U"}</div>;
  };

  return (
    <main className="container adm-um-root">
      {/* Header */}
      <div className="adm-um-header">
        <div className="adm-um-titlewrap">
          <div className="adm-um-iconbadge">
            <FiUsers />
          </div>
          <div>
            <h1 className="adm-um-title">User Management</h1>
                  <nav className="breadcrumbs">
                      <Link to="/admin/home">Home</Link> / <span>User Management</span>
                </nav>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="adm-um-filters">
        <div className="adm-um-search">
          <FiSearch className="adm-um-search-ico" />
          <input
            className="adm-um-input"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="adm-um-clear"
              onClick={() => setSearch("")}
              title="Clear"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="adm-um-rolebar">
          <span className="adm-um-rolebar-label">
            <FiFilter /> Role:
          </span>
          <button
            className={`adm-um-rolebtn ${role === "" ? "is-active" : ""}`}
            onClick={() => setRole("")}
          >
            All
          </button>
          {ROLES.map((r) => (
            <button
              key={r}
              className={`adm-um-rolebtn ${role === r ? "is-active" : ""}`}
              onClick={() => setRole(r)}
            >
              {roleLabel(r)}
            </button>
          ))}
        </div>

        {/* NEW: Sort control */}
        <div className="adm-um-sortbar">
          <span className="adm-um-rolebar-label">Sort:</span>
          <button
            className={`adm-um-rolebtn ${order === "asc" ? "is-active" : ""}`}
            onClick={() => setOrder("asc")}
            title="Name A → Z"
          >
            <FiArrowUp /> Name (A–Z)
          </button>
          <button
            className={`adm-um-rolebtn ${order === "desc" ? "is-active" : ""}`}
            onClick={() => setOrder("desc")}
            title="Name Z → A"
          >
            <FiArrowDown /> Name (Z–A)
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="adm-um-card">
        <div className="adm-um-scroll">
          <table className="adm-um-table">
            <thead>
              <tr>
                <th className="tl">User</th>
                <th>Email</th>
                <th>Role</th>
                <th className="tr">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="adm-um-empty">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="adm-um-empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id}>
                    <td className="tl">
                      <div className="adm-um-usercell">
                        <Initials name={u.name} />
                        <div>
                          <div className="adm-um-name">{u.name}</div>
                          <div className="adm-um-id">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <RoleChip value={u.role} />
                    </td>
                    <td className="tr">
                      <button
                        className="adm-um-btn danger"
                        onClick={() => setToDelete(u)}
                        title="Delete user"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="adm-um-pager">
          <div className="adm-um-pager-left">
            Showing page <strong>{meta?.current_page ?? page}</strong> of{" "}
            <strong>{meta?.last_page ?? 1}</strong> — Total{" "}
            <strong>{meta?.total ?? rows.length}</strong>
          </div>
          <div className="adm-um-pager-right">
            <button
              className="adm-um-btn ghost"
              disabled={(meta?.current_page ?? page) <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <FiChevronLeft /> Prev
            </button>
            <button
              className="adm-um-btn ghost"
              disabled={
                (meta?.current_page ?? page) >= (meta?.last_page ?? 1) || loading
              }
              onClick={() =>
                setPage((p) => Math.min((meta?.last_page ?? 1) || 1, p + 1))
              }
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Confirm Delete */}
      {toDelete && (
        <ConfirmModal
          onCancel={() => setToDelete(null)}
          onConfirm={onConfirmDelete}
          title="Delete user?"
          desc={`This action cannot be undone. Delete "${toDelete.name}"?`}
        />
      )}
    </main>
  );
}

/* ---------- small confirm modal ---------- */
function ConfirmModal({ title, desc, onCancel, onConfirm }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="adm-um-modal">
      <div className="adm-um-modal-card" ref={ref}>
        <div className="adm-um-modal-head">
          <h3>{title}</h3>
        </div>
        <div className="adm-um-modal-body">
          <p>{desc}</p>
        </div>
        <div className="adm-um-modal-actions">
          <button className="adm-um-btn ghost" onClick={onCancel}>
            <FiX /> Cancel
          </button>
          <button className="adm-um-btn danger" onClick={onConfirm}>
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authApi } from "../api/api";
import { FiLogOut } from "react-icons/fi";

export default function Navigation() {
  const navigate = useNavigate();

  // Read the user from session storage
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const role = user?.role;

  // Pretty role label
  const roleLabel = useMemo(() => {
    switch ((role || "").toLowerCase()) {
      case "sales_rep":
      case "sale_rep": // typo-safe
        return "Sales Representative";
      case "admin":
        return "Administrator";
      case "manager":
        return "Manager";
      default:
        return role || "";
    }
  }, [role]);

  // Role-based routes
  const routes = useMemo(() => {
    if (role === "manager") {
      return [
        { to: "/manager/home", label: "Home" },
        { to: "/manager/customers", label: "Customer Management" },
        { to: "/manager/analytics", label: "Analytics" },
      ];
    }
    if (role === "sales_rep" || role === "sale_rep") {
      return [
        { to: "/sales/home", label: "Home" },
        { to: "/sales/my-customers", label: "My Customers" },
      ];
    }
    // admin (default)
    return [
      { to: "/admin/home", label: "Home" },
      { to: "/admin/users", label: "User Management" },
    ];
  }, [role]);

  const handleLogout = async () => {
    try {
      await authApi.logout(); // Sanctum: invalidates current token
    } catch {
      // ignore network errors; still clear local session
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigate("/auth", { replace: true });
    }
  };

  const initials = (user?.name || "A U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="nav">
      <div className="nav-left">
        <img src="/images/logo.png" alt="Apexum" className="nav-logo" />
        <span className="nav-brand">Apexum CRM</span>

        <nav className="nav-links">
          {routes.map((r) => (
            <NavLink
              key={r.to}
              to={r.to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {r.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="nav-right">
        <div className="nav-user">
          {user?.image_url ? (
            <img src={user.image_url} alt={user?.name} className="nav-avatar" />
          ) : (
            <div className="nav-avatar fallback">{initials}</div>
          )}
          <div className="nav-user-meta">
            <div className="nav-user-name">{user?.name}</div>
            <div className="nav-user-role">{roleLabel}</div>
          </div>
        </div>

        <button className="btn btn-logout" onClick={handleLogout} title="Logout">
          <FiLogOut /> <span className="hide-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}

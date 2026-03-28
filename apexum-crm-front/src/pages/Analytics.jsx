// /src/pages/Analytics.jsx
import { useEffect, useState, useMemo } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { FiTrendingUp, FiUsers, FiTarget, FiActivity, FiDollarSign } from "react-icons/fi";
import { Link } from "react-router-dom";

// Brand palette (from logo) + shades
const BRAND = {
  sky:    "#ce9557ff", // primary
  skyL:   "#a25c06ff",
  skyXL:  "#e7ea10ff",
  purple: "#ed6a3aff", // accent
  purpleL:"#dca460ff",
  purpleXL:"#ac5e5eff",
  teal:   "#f73939ff",
  tealL:  "#973612ff",
  amber:  "#F59E0B",
  grid:   "rgba(148,163,184,0.18)",
};

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    customers_total: 0,
    opportunities_total: 0,
    opportunities_sum: 0,
    activities_total: 0,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/manager/metrics");
        setMetrics(data?.metrics || {});
      } catch {
        toast.error("Failed to load metrics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Datasets
  const barData = useMemo(() => ([
    { name: "Customers",     value: metrics.customers_total },
    { name: "Opportunities", value: metrics.opportunities_total },
    { name: "Activities",    value: metrics.activities_total },
  ]), [metrics]);

  const pieData = useMemo(() => {
    const total = metrics.customers_total + metrics.opportunities_total + metrics.activities_total;
    if (!total) return [];
    return [
      { name: "Customers",     value: metrics.customers_total,     color: BRAND.sky },
      { name: "Opportunities", value: metrics.opportunities_total, color: BRAND.purple },
      { name: "Activities",    value: metrics.activities_total,    color: BRAND.teal },
    ];
  }, [metrics]);

  const formatMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <main className="container" style={{ paddingTop: 10 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap: 12, marginBottom: 12 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap: 10 }}>
          <Badge><FiTrendingUp /></Badge>
          <h2 style={{ margin: 0 }}>Analytics</h2>
          <nav className="breadcrumbs">
              <Link to="/manager/home">Home</Link> / <span>Analytics</span>
          </nav>
        </div>
      </div>

      {/* Stat cards */}
      <section className="mgr-cta-grid" style={{ marginBottom: 12 }}>
        <StatCard icon={<FiUsers />}      label="Customers"        value={metrics.customers_total}     color={BRAND.sky} />
        <StatCard icon={<FiTarget />}     label="Opportunities"    value={metrics.opportunities_total} color={BRAND.purple} />
        <StatCard icon={<FiActivity />}   label="Activities"       value={metrics.activities_total}    color={BRAND.teal} />
        <StatCard icon={<FiDollarSign />} label="Pipeline Value"   value={formatMoney(metrics.opportunities_sum)} color={BRAND.amber} />
      </section>

      {loading ? (
        <div style={{ padding: 16, opacity:.85 }}>Loading charts…</div>
      ) : (
        <section className="mgr-cta-grid">
          {/* Bar chart */}
          <div className="mgr-cta-card" style={{ minHeight: 320 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Volume Overview</h3>
            <div style={{ width:"100%", height:260 }}>
              <ResponsiveContainer>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  {/* gradient defs for the bars (sky shades) */}
                  <defs>
                    <linearGradient id="barPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor={BRAND.skyXL} />
                      <stop offset="100%" stopColor={BRAND.sky} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke={BRAND.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--apx-muted)" }} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--apx-muted)" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    contentStyle={{
                      background: "#fff",                     // WHITE tooltip bg
                      color: "#0f172a",                       // dark text
                      border: "1px solid var(--apx-border)",
                      borderRadius: 10,
                    }}
                    labelStyle={{ color: "#334155" }}
                    itemStyle={{ color: "#0f172a" }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#barPrimary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="mgr-cta-card" style={{ minHeight: 320 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Distribution</h3>
            <div style={{ width:"100%", height:260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",                     // WHITE tooltip bg
                      color: "#0f172a",
                      border: "1px solid var(--apx-border)",
                      borderRadius: 10,
                    }}
                    labelStyle={{ color: "#334155" }}
                    itemStyle={{ color: "#0f172a" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    wrapperStyle={{ color: "var(--apx-muted)" }}
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {/* shaded slices (base + light shade per family) */}
                    {pieData.map((entry, idx) => {
                      const shade =
                        entry.color === BRAND.sky    ? [BRAND.sky, BRAND.skyL]
                      : entry.color === BRAND.purple ? [BRAND.purple, BRAND.purpleL]
                      :                                   [BRAND.teal, BRAND.tealL];

                      return (
                        <Cell key={`slice-${idx}`} fill={shade[0]} stroke={shade[1]} strokeWidth={2} />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ---------- tiny UI bits ---------- */

function Badge({ children }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      display:"grid", placeItems:"center",
      background:"#14181e", border:"1px solid var(--apx-border)"
    }}>{children}</div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="mgr-cta-card" style={{ display:"grid", gap: 10 }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          display:"grid", placeItems:"center",
          background:"rgba(255,255,255,0.04)",
          border: "1px solid var(--apx-border)",
          color
        }}>
          {icon}
        </div>
        <div>
          <div style={{ color:"var(--apx-muted)", fontSize:12 }}>{label}</div>
          <div style={{ fontWeight:800, fontSize:20 }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

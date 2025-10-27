import { Link } from "react-router-dom";
import { FiUsers, FiArrowRight, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import useSalesQuote from "../hooks/useSalesQuote";

export default function SalesRepresentativeHome() {
  const { quote, loading, error, regenerate } = useSalesQuote();

  return (
    <main className="mgr-home">
      {/* Hero */}
      <section className="mgr-hero container">
        <div className="mgr-hero-copy">
          <h1 className="mgr-hero-title">
            Close smarter.
            <span className="mgr-hero-gradient"> Win more.</span>
          </h1>
        <p className="mgr-hero-sub">
            Your pipeline at a glance. Follow up faster, keep deals moving, and
            hit targets with Apexum CRM.
          </p>

          {/* Primary CTA */}
          <Link
            to="/sales/my-customers"
            className="btn"
            style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <FiUsers /> My Customers <FiArrowRight />
          </Link>
        </div>

        <div className="mgr-hero-media" aria-hidden="true">
          <img src="/images/sales-representative-home.png" alt="" />
        </div>
      </section>

      {/* Dual cards: My Customers + Quote */}
      <section className="container">
        <div className="mgr-cta-grid">
          {/* My Customers */}
          <Link to="/sales/my-customers" className="mgr-cta-card">
            <div className="mgr-cta-icon"><FiUsers /></div>
            <h3>My Customers</h3>
            <p>See assigned accounts, track opportunities and activities, and keep deals warm.</p>
            <span className="mgr-cta-action">Open My Customers →</span>
          </Link>

          {/* Inspiration / Quote card */}
          <div className="mgr-cta-card mgr-quote-card">
            <div className="mgr-quote-badge">Daily Spark</div>

            {error ? (
              <div className="mgr-quote-error">
                <FiAlertTriangle /> {error}
              </div>
            ) : (
              <>
                <p className={`mgr-quote-text ${loading ? "skeleton" : ""}`}>
                  {loading ? "Loading inspiring words…" : `“${quote?.text || ""}”`}
                </p>
                <div className={`mgr-quote-author ${loading ? "skeleton" : ""}`}>
                  — {quote?.author || "Unknown"}
                </div>
              </>
            )}

            <div className="mgr-quote-actions">
              <button
                className="btn btn-ghost"
                onClick={regenerate}
                disabled={loading}
                aria-busy={loading}
                title="Get another quote"
              >
                <FiRefreshCw className={loading ? "spin" : ""} />
                {loading ? " Regenerating…" : " Regenerate"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

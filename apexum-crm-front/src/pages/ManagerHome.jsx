import { Link } from "react-router-dom";
import { FiUsers, FiTrendingUp } from "react-icons/fi";

export default function ManagerHome() {
  return (
    <main className="mgr-home">
      {/* Hero */}
      <section className="mgr-hero container">
        <div className="mgr-hero-copy">
          <h1 className="mgr-hero-title">
            Lead with clarity.
            <span className="mgr-hero-gradient"> Move faster.</span>
          </h1>
          <p className="mgr-hero-sub">
            Real-time visibility into customers and pipeline.  
            Plan, track, and grow your team’s impact with Apexum CRM.
          </p>
        </div>

        <div className="mgr-hero-media" aria-hidden="true">
          <img src="/images/manager-home.png" alt="" />
        </div>
      </section>

      {/* Actions */}
      <section className="container">
        <div className="mgr-cta-grid">
          <Link to="/manager/customers" className="mgr-cta-card">
            <div className="mgr-cta-icon"><FiUsers /></div>
            <h3>Customers</h3>
            <p>All accounts in one place. Assign owners, track notes and deals.</p>
            <span className="mgr-cta-action">Open Customer Management →</span>
          </Link>

          <Link to="/manager/analytics" className="mgr-cta-card">
            <div className="mgr-cta-icon"><FiTrendingUp /></div>
            <h3>Analytics</h3>
            <p>Monitor performance and revenue with clean, actionable charts.</p>
            <span className="mgr-cta-action">Open Analytics →</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

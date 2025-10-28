import { Link } from "react-router-dom";
import { FiUsers, FiArrowRight } from "react-icons/fi";

export default function AdminHome() {
  return (
    <main className="adm-home">
      {/* Hero */}
      <section className="adm-hero container">
        <div className="adm-hero-copy">
          <h1 className="adm-hero-title">
            Close smarter.
            <br />
            <span className="adm-hero-gradient">Win more.</span>
          </h1>

          <p className="adm-hero-sub">
            Your pipeline at a glance. Follow up faster, keep deals moving, and hit
            targets with Apexum CRM.
          </p>

          <Link to="/admin/users" className="adm-cta-btn">
            <span className="adm-cta-ico"><FiUsers /></span>
            <span>My Customers</span>
            <span className="adm-cta-arrow"><FiArrowRight /></span>
          </Link>
        </div>

        <div className="adm-hero-media" aria-hidden="true">
          <img src="/images/administrator-home.png" alt="" />
        </div>
      </section>

      {/* Tiles */}
      <section className="container">
        <div className="adm-tiles">
          <article className="adm-tile">
            <div className="adm-tile-ico"><FiUsers /></div>
            <h2 className="adm-tile-title">My Customers</h2>
            <p className="adm-tile-sub">
              See assigned accounts, track opportunities and activities,
              and keep deals warm.
            </p>
            <Link to="/admin/users" className="adm-tile-link">
              Open My Customers →
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}

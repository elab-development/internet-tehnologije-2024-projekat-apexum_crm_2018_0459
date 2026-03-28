// /src/components/Footer.jsx
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="apx-footer">
      <div className="apx-footer-inner">
        <span className="apx-footer-copy">
          © {year} <strong>Apexum CRM</strong>. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

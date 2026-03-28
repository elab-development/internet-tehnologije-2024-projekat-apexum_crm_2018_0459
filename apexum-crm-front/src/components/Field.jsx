// /src/components/Field.jsx
export default function Field({ icon, onChange, ...props }) {
  return (
    <div className="field">
      <span className="field-icon">{icon}</span>
      <input className="input" {...props} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

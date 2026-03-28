// src/pages/Auth.jsx
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/api";
import Field from "../components/Field";
import { FiMail, FiLock, FiUser, FiUploadCloud, FiCheck, FiX, FiShield } from "react-icons/fi";
import useImageBBHostingService from "../hooks/useImageBBHostingService";
import { toast } from "react-toastify";

export default function Auth() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData]   = useState({
    name: "",
    email: "",
    password: "",
    role: "sales_rep",   // default role
    image_url: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedName, setUploadedName] = useState("");

  const nav = useNavigate();

  // imgBB
  const { upload, uploading, error: uploadError } = useImageBBHostingService();
  const fileRef = useRef(null);

  // show upload errors as toast
  useEffect(() => { if (uploadError) toast.error(uploadError); }, [uploadError]);

  const hasImage = Boolean(previewUrl);
  const triggerPick = () => !hasImage && fileRef.current?.click();

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await upload(file);
      setRegData((s) => ({ ...s, image_url: url || "" }));
      setPreviewUrl(url || "");
      setUploadedName(file.name || url?.split("/").pop() || "image");
      toast.success("Image uploaded successfully.");
    } finally {
      e.target.value = ""; // allow re-pick
    }
  };

  const clearImage = () => {
    setRegData((s) => ({ ...s, image_url: "" }));
    setPreviewUrl("");
    setUploadedName("");
  };

  // Auth
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await authApi.login(loginData);

    // persist auth
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    // choose home by role (force lower-case just in case)
    const role = String(data?.user?.role || "").toLowerCase();
    const homeByRole = (r) => {
      if (r === "manager")   return "/manager/home";
      if (r === "sales_rep") return "/sales/home";
      return "/admin/home"; // default admin
    };
    const target = homeByRole(role);

    toast.success("Logged in!");

    // HARD redirect (full reload, replaces history entry)
    window.location.replace(target);

    // If you prefer to keep the login page in history (so Back returns to it), use:
    // window.location.assign(target);
  } catch (err) {
    toast.error(err?.response?.data?.message || "Login failed. Check your email/password.");
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // send role along with other fields
      await authApi.register(regData);
      setTab("login");
      clearImage();
      toast.success("Registration successful! Please log in.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed. Please review your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <div className="brand-row">
          <img src="/images/logo.png" alt="Apexum CRM" className="brand-logo" />
          <div className="brand-title">Apexum CRM</div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Login</button>
          <button className={`tab-btn ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register</button>
        </div>

        {tab === "login" ? (
          <form className="form" onSubmit={handleLogin}>
            <Field icon={<FiMail />} type="email" placeholder="Email"
              value={loginData.email} onChange={(v)=>setLoginData(s=>({...s,email:v}))}
              autoComplete="email" required />
            <Field icon={<FiLock />} type="password" placeholder="Password"
              value={loginData.password} onChange={(v)=>setLoginData(s=>({...s,password:v}))}
              autoComplete="current-password" required />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleRegister}>
            <Field icon={<FiUser />} type="text" placeholder="Full name"
              value={regData.name} onChange={(v)=>setRegData(s=>({...s,name:v}))}
              autoComplete="name" required />
            <Field icon={<FiMail />} type="email" placeholder="Email"
              value={regData.email} onChange={(v)=>setRegData(s=>({...s,email:v}))}
              autoComplete="email" required />
            <Field icon={<FiLock />} type="password" placeholder="Password (min 6 chars)"
              value={regData.password} onChange={(v)=>setRegData(s=>({...s,password:v}))}
              autoComplete="new-password" required />

            {/* Role select */}
            <div className="select-wrap">
              <div className="field-icon"><FiShield /></div>
              <select
                className="select"
                value={regData.role}
                onChange={(e) => setRegData((s) => ({ ...s, role: e.target.value }))}
                required
              >
                <option value="manager">Manager</option>
                <option value="sales_rep">Sales Representative</option>
              </select>
            </div>

            {/* Upload area */}
            <div className="upload-row">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePicked}
              />
              <button
                type="button"
                className="btn btn-upload"
                onClick={triggerPick}
                disabled={hasImage || uploading}
                title={hasImage ? "Remove image first" : "Upload profile image to imgBB"}
              >
                {uploading ? "Uploading..." :
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <FiUploadCloud /> Upload image
                  </span>}
              </button>

              {hasImage && (
                <div className="thumb-chip">
                  <button type="button" className="thumb-close" onClick={clearImage} aria-label="Remove image">
                    <FiX />
                  </button>
                  <img src={previewUrl} alt="preview" className="thumb-img" />
                  <span className="thumb-name">{uploadedName || "image"}</span>
                  <span className="thumb-ok"><FiCheck /> attached</span>
                </div>
              )}
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// src/App.js
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ManagerHome from "./pages/ManagerHome";
import CustomerManagement from "./pages/CustomerManagement";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Analytics from "./pages/Analytics";
import SalesRepresentativeHome from "./pages/SalesRepresentativeHome";
import MyCustomers from "./pages/MyCustomers";
import AdminHome from "./pages/AdminHome";
import UserManagement from "./pages/UserManagement";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [hasToken, setHasToken] = useState(Boolean(sessionStorage.getItem("token")));

  // Poll sessionStorage every second for token changes
  useEffect(() => {
    const id = setInterval(() => {
      const present = Boolean(sessionStorage.getItem("token"));
      setHasToken((prev) => (prev !== present ? present : prev));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <BrowserRouter>
      {/* Toasts (5s, dismissible) */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastClassName="apx-toast"
        progressClassName="apx-toast-progress"
      />

      {/* Show nav whenever a token exists */}
      {hasToken && <Navigation />}

      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/manager/home"
          element={hasToken ? <ManagerHome /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/manager/customers"
          element={hasToken ? <CustomerManagement /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/manager/analytics"
          element={hasToken ? <Analytics /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/sales/home"
          element={hasToken ? <SalesRepresentativeHome /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/sales/my-customers"
          element={hasToken ? <MyCustomers /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/admin/home"
          element={hasToken ? <AdminHome /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/admin/users"
          element={hasToken ? <UserManagement /> : <Navigate to="/auth" replace />}
        />
      </Routes>
      {hasToken && <Footer />}
    </BrowserRouter>
  );
}

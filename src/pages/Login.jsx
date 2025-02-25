import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 🔥 Verificar si ya existe un token al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (token && userRole) {
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "profesor") {
        navigate("/professor-dashboard");
      } else if (userRole === "alumno") {
        navigate("/dashboard");
      } else {
        setError("Rol desconocido. Contacte al administrador.");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password }),
      });

      const data = await response.json();

      if (data.requiresVerification) {
        setRequiresVerification(true);
        setStatus("📩 Se ha enviado un código de verificación a tu WhatsApp.");
        return;
      }

      // Guardar token y rol en localStorage para mantener la sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "profesor") {
        navigate("/professor-dashboard");
      } else if (data.user.role === "alumno") {
        navigate("/dashboard");
      } else {
        setError("Rol desconocido. Contacte al administrador.");
      }
    } catch (error) {
      setError("Credenciales inválidas. Intente nuevamente.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      setError("");
      setStatus("Verificando código...");

      const response = await fetch(`${API_URL}/login/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, verificationCode }),
      });

      const data = await response.json();
      setVerificationCode("");

      if (!response.ok) {
        setStatus(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "profesor") {
        navigate("/professor-dashboard");
      } else if (data.user.role === "alumno") {
        navigate("/dashboard");
      } else {
        setError("Rol desconocido. Contacte al administrador.");
      }
    } catch (error) {
      setError("Error al verificar código.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center mb-3">🔑 Iniciar Sesión</h2>

        {!requiresVerification ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">DNI:</label>
              <input
                type="text"
                className="form-control"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                pattern="\d*"
              />
            </div>
            <div className="mb-3 position-relative">
              <label className="form-label">Contraseña:</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {error && (
              <div className="alert alert-danger text-center">{error}</div>
            )}
            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Iniciar Sesión
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => navigate("/recuperar")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-muted text-center">
              📩 Se ha enviado un código de verificación a tu WhatsApp.
            </p>
            <div className="mb-3">
              <label className="form-label">Código de Verificación:</label>
              <input
                type="text"
                className="form-control"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                pattern="\d*"
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className="btn btn-success w-100"
            >
              Verificar Código
            </button>
          </div>
        )}

        {status && (
          <div className="alert alert-info text-center mt-3">{status}</div>
        )}
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper para prevenir bloqueos por navegación privada o Safari móvil
const safeStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("No se pudo escribir en localStorage:", e);
    }
  },
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("No se pudo leer de localStorage:", e);
      return null;
    }
  },
};

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Redirigir según rol
  const redirectByRole = (role) => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "profesor") {
      navigate("/professor-dashboard");
    } else if (role === "alumno") {
      navigate("/dashboard");
    } else {
      setError("Rol desconocido. Contacte al administrador.");
    }
  };

  // Verificar si ya existe un token al montar el componente
  useEffect(() => {
    const token = safeStorage.getItem("token");
    const userRole = safeStorage.getItem("role");

    if (token && userRole) {
      redirectByRole(userRole);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dni.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Credenciales inválidas. Intente nuevamente.");
        return;
      }

      if (data.requiresVerification) {
        setRequiresVerification(true);
        setStatus("📩 Se ha enviado un código de verificación a tu WhatsApp.");
        return;
      }

      if (data.token && data.user) {
        safeStorage.setItem("token", data.token);
        safeStorage.setItem("role", data.user.role);
        redirectByRole(data.user.role);
      } else {
        setError("Respuesta inesperada del servidor. Intente más tarde.");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error al conectar con el servidor. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setStatus("Verificando código...");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: dni.trim(),
          verificationCode: verificationCode.trim(),
        }),
      });

      const data = await response.json();
      setVerificationCode("");

      if (!response.ok) {
        setStatus("");
        setError(data.message || "Código inválido o expirado.");
        return;
      }

      if (data.token && data.user) {
        safeStorage.setItem("token", data.token);
        safeStorage.setItem("role", data.user.role);
        redirectByRole(data.user.role);
      } else {
        setError("Error al iniciar sesión con el código.");
      }
    } catch (err) {
      console.error("Error al verificar código:", err);
      setStatus("");
      setError("Error de comunicación al verificar el código.");
    } finally {
      setLoading(false);
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
                inputMode="numeric"
                className="form-control"
                value={dni}
                onChange={(e) => setDni(e.target.value.trim())}
                required
                disabled={loading}
                placeholder="Ingresa tu DNI"
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
                disabled={loading}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer", marginTop: "12px" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {error && (
              <div className="alert alert-danger text-center p-2 mb-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => navigate("/recuperar")}
                disabled={loading}
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
                inputMode="numeric"
                className="form-control"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.trim())}
                required
                disabled={loading}
                placeholder="Código recibido"
              />
            </div>

            {error && (
              <div className="alert alert-danger text-center p-2 mb-3">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              className="btn btn-success w-100 d-flex justify-content-center align-items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Verificando...
                </>
              ) : (
                "Verificar Código"
              )}
            </button>
          </div>
        )}

        {status && (
          <div className="alert alert-info text-center mt-3 p-2">{status}</div>
        )}
      </div>
    </div>
  );
};

export default Login;
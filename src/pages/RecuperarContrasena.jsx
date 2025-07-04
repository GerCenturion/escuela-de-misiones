import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RecuperarContrasena = () => {
  const [dni, setDni] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role && step === 1) {
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "profesor") navigate("/professor-dashboard");
      else if (role === "alumno") navigate("/dashboard");
    }
  }, [navigate, step]);

  const handleRequestCode = async () => {
    try {
      setError("");
      setStatus("Enviando código de recuperación...");

      const res = await fetch(`${API_URL}/usuarios/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al enviar código");

      setStatus("📩 Código enviado por WhatsApp. Ingresalo junto a tu nueva contraseña.");
      setStep(2);
    } catch (err) {
      setError(err.message);
      setStatus("");
    }
  };

  const handleResetPassword = async () => {
    try {
      setError("");
      setStatus("Restableciendo contraseña...");

      const cleanCode = verificationCode.trim();
      const res = await fetch(`${API_URL}/usuarios/restablecer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, verificationCode: cleanCode, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al restablecer contraseña");

      setStatus("✅ Contraseña restablecida con éxito. Redirigiendo...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
      setStatus("");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">🔐 Recuperar Contraseña</h2>

        {step === 1 ? (
          <>
            <label className="form-label">Ingrese su DNI:</label>
            <input
              type="text"
              className="form-control mb-3"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
            <button onClick={handleRequestCode} className="btn btn-primary w-100">
              Enviar Código de Recuperación
            </button>
          </>
        ) : (
          <>
            <label className="form-label">Código de Verificación:</label>
            <input
              type="text"
              className="form-control mb-3"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />

            <label className="form-label">Nueva Contraseña:</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control mb-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

            <button onClick={handleResetPassword} className="btn btn-success w-100">
              Restablecer Contraseña
            </button>
          </>
        )}

        {status && <div className="alert alert-info text-center mt-3">{status}</div>}
        {error && <div className="alert alert-danger text-center mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default RecuperarContrasena;

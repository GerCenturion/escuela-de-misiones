import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecuperarContrasena = () => {
  const [dni, setDni] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = Solicitar código, 2 = Ingresar código y nueva contraseña
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleRequestCode = async () => {
    try {
      setError("");
      setStatus("Enviando código de recuperación...");

      const response = await fetch(`${API_URL}/usuarios/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setStatus(
        "📩 Código enviado por WhatsApp. Ingresa el código y tu nueva contraseña."
      );
      setStep(2);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      setError("");
      setStatus("Restableciendo contraseña...");

      const response = await fetch(`${API_URL}/usuarios/restablecer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, verificationCode, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setStatus(
        "✅ Contraseña restablecida con éxito. Redirigiendo al inicio de sesión..."
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center mb-3">🔐 Recuperar Contraseña</h2>

        {step === 1 ? (
          <div>
            <label className="form-label">Ingrese su DNI:</label>
            <input
              type="text"
              className="form-control mb-3"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              pattern="\d*"
            />
            <button
              onClick={handleRequestCode}
              className="btn btn-primary w-100"
            >
              Enviar Código de Recuperación
            </button>
          </div>
        ) : (
          <div>
            <label className="form-label">Código de Verificación:</label>
            <input
              type="text"
              className="form-control mb-3"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              pattern="\d*"
            />
            <label className="form-label">Nueva Contraseña:</label>
            <input
              type={showPassword ? "text" : "password"} // 🔥 Cambia entre texto y contraseña
              className="form-control mb-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {/* 🔥 Botón para ver/ocultar contraseña */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="position-absolute top-50 end-0 translate-middle-y me-3"
              style={{ cursor: "pointer" }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
            <button
              onClick={handleResetPassword}
              className="btn btn-success w-100"
            >
              Restablecer Contraseña
            </button>
          </div>
        )}

        {status && (
          <div className="alert alert-info text-center mt-3">{status}</div>
        )}
        {error && (
          <div className="alert alert-danger text-center mt-3">{error}</div>
        )}
      </div>
    </div>
  );
};

export default RecuperarContrasena;

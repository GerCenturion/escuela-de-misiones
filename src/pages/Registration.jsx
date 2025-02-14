import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneCode: "54",
    phoneArea: "",
    phoneNumber: "",
    phoneType: "",
    birthdate: "",
    dni: "",
    address: "",
    civilStatus: "",
    profession: "",
    church: "",
    ministerialRole: "",
    reason: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationField, setShowVerificationField] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL; // Variable de entorno

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // 🔥 Limpiar errores automáticamente al escribir
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      setError(
        "La contraseña debe tener al menos 6 caracteres, una letra mayúscula y un número."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      alert(data.message);
      console.log("Datos enviados correctamente:", data);

      // 🔥 Mostrar mensaje de confirmación y campo de verificación
      setStatus("📩 Código de verificación enviado por WhatsApp.");
      setShowVerificationField(true);
      setAttempts(0);
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setError("Hubo un problema al enviar la inscripción.");
    }
  };

  // 📌 Verificar código de WhatsApp
  const handleVerifyCode = async () => {
    try {
      // 🔥 Limpiar estados previos antes de procesar la verificación
      setError("");
      setStatus("Verificando código...");

      const response = await fetch(`${apiUrl}/usuarios/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, verificationCode }),
      });

      if (!response.ok) {
        throw new Error("Código incorrecto o expirado.");
      }

      setStatus("✅ Verificación exitosa. Registro completado.");
      setShowVerificationField(false);

      // 🔥 Redirigir a la página de inicio de sesión después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Código incorrecto. Generando nuevo código...");

      setError(
        "❌ Código incorrecto. Se ha enviado un nuevo código a tu WhatsApp."
      );
      setStatus(""); // 🔥 Limpia el mensaje de estado

      // Aumentar intentos
      setAttempts(attempts + 1);

      try {
        const resendResponse = await fetch(
          `${apiUrl}/usuarios/reenviar-codigo`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email }),
          }
        );

        if (!resendResponse.ok) {
          throw new Error("Error al reenviar el código.");
        }

        setStatus("📩 Se ha enviado un nuevo código a tu WhatsApp.");
        setVerificationCode(""); // 🔥 Limpiar campo de verificación solo después de reenviar el código
      } catch (resendError) {
        console.error("Error al reenviar código:", resendError);
        setError(
          "⚠️ Hubo un problema al enviar el nuevo código. Inténtalo nuevamente."
        );
      }
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Registrarse</h1>
      <form onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className="mb-3">
          <label className="form-label">Nombre/s y Apellido:</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Correo Electrónico:</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        {/* Fecha de nacimiento */}
        <div className="mb-3">
          <label className="form-label">Fecha de nacimiento:</label>
          <input
            type="date"
            className="form-control"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        </div>
        {/* DNI */}
        <div className="mb-3">
          <label className="form-label">DNI Nº:</label>
          <input
            type="text"
            className="form-control"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
          />
        </div>
        {/* Dirección */}
        <div className="mb-3">
          <label className="form-label">
            Domicilio (Ciudad/Provincia/Barrio/Calle y Número):
          </label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        {/* Estado Civil */}
        <div className="mb-3">
          <label className="form-label">Estado Civil:</label>
          <select
            className="form-control"
            name="civilStatus"
            value={formData.civilStatus}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una opción</option>
            <option value="Casado/a">Casado/a</option>
            <option value="Soltero/a">Soltero/a</option>
            <option value="Separado/a">Separado/a</option>
            <option value="Viudo/a">Viudo/a</option>
          </select>
        </div>
        {/* Profesión */}
        <div className="mb-3">
          <label className="form-label">Profesión:</label>
          <input
            type="text"
            className="form-control"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            required
          />
        </div>
        {/* Teléfono */}
        <div className="mb-3">
          <label className="form-label">Teléfono:</label>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              name="phoneCode"
              placeholder="Código de país (+54)"
              value={formData.phoneCode}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              className="form-control"
              name="phoneArea"
              placeholder="Área (341)"
              value={formData.phoneArea}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              className="form-control"
              name="phoneNumber"
              placeholder="Número de teléfono"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Iglesia */}
        <div className="mb-3">
          <label className="form-label">
            Nombre de la Iglesia a la que pertenece:
          </label>
          <input
            type="text"
            className="form-control"
            name="church"
            value={formData.church}
            onChange={handleChange}
            required
          />
        </div>
        {/* Cargo Ministerial */}
        <div className="mb-3">
          <label className="form-label">
            ¿Ocupa algún cargo ministerial actualmente? Especifique su
            función/tarea:
          </label>
          <textarea
            className="form-control"
            name="ministerialRole"
            value={formData.ministerialRole}
            onChange={handleChange}
            required
          />
        </div>
        {/* Razón */}
        <div className="mb-3">
          <label className="form-label">
            ¿Por qué decidió inscribirse al Seminario?
          </label>
          <textarea
            className="form-control"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>
        {/* Contraseñas */}
        <div className="mb-3 position-relative">
          <label className="form-label">Contraseña:</label>
          <input
            type={showPasswords ? "text" : "password"}
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <small className="text-muted">
            La contraseña debe tener al menos 6 caracteres, una letra mayúscula
            y un número.
          </small>
          <span
            onClick={() => setShowPasswords(!showPasswords)}
            className="position-absolute top-50 end-0 translate-middle-y me-3"
            style={{ cursor: "pointer" }}
          >
            {showPasswords ? "🙈" : "👁️"}
          </span>
        </div>
        <div className="mb-3 position-relative">
          <label className="form-label">Confirmar Contraseña:</label>
          <input
            type={showPasswords ? "text" : "password"}
            className="form-control"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          style={{ backgroundColor: "#005f73" }}
        >
          Enviar Inscripción
        </button>
      </form>
      {/* 🔥 Sección de verificación de código */}
      {showVerificationField && (
        <div className="mt-4">
          <h3>🔑 Verificación de WhatsApp</h3>
          <p>
            Ingresa el código que recibiste en tu WhatsApp para completar el
            registro.
          </p>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Código de verificación"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value);
              setError(""); // 🔥 Limpiar errores cuando el usuario escribe un nuevo código
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // 🔥 Evita que el formulario se envíe por defecto
                handleVerifyCode(); // 🔥 Llama a la función de verificación
              }
            }}
            required
          />

          <button
            onClick={handleVerifyCode}
            className="btn btn-success w-100"
            disabled={!verificationCode.trim()} // 🔥 Deshabilita si el campo está vacío
          >
            Verificar Código
          </button>
        </div>
      )}

      {/* 🔥 Mostrar estado del registro */}
      {status && <p className="text-success mt-3">{status}</p>}
      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
};

export default Registration;

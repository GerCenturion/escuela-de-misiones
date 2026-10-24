import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPen, FaLock, FaUserEdit, FaInfoCircle } from "react-icons/fa";
import "../App.css";

// Helper para detectar campos vacíos, nulos, guiones o placeholders
const isCampoIncompleto = (valor) => {
  if (valor === undefined || valor === null) return true;
  const limpio = String(valor).trim().toLowerCase();

  const valoresInvalidos = [
    "",
    "-",
    "--",
    "no especificada",
    "no especificado",
    "no asignado",
    "sin asignar",
    "null",
    "undefined",
  ];

  return valoresInvalidos.includes(limpio);
};

// 📌 Validador de correo electrónico
const isEmailInvalido = (email) => {
  if (!email) return true;
  const limpio = String(email).trim().toLowerCase();

  if (
    limpio === "" ||
    limpio.includes("@sinemail.com") ||
    limpio.includes("@noemail.com") ||
    !limpio.includes("@") ||
    !limpio.includes(".")
  ) {
    return true;
  }
  return false;
};

const Perfil = ({ API_URL: propApiUrl, onProfileComplete }) => {
  const navigate = useNavigate();

  const API_URL = propApiUrl || import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados de edición y forzado obligatorio
  const [isForced, setIsForced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({});

  // Estados de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Comprobar si faltan datos esenciales (solo para alumnos)
  const checkIncompleteProfile = (data) => {
    if (!data) return false;
    if (data.role === "admin" || data.role === "profesor") return false;

    if (isEmailInvalido(data.email)) {
      return true;
    }

    const campos = [
      data.name,
      data.birthdate,
      data.address,
      data.phoneArea,
      data.phoneNumber,
      data.civilStatus,
      data.profession,
      data.church,
      data.reason,
    ];

    return campos.some(isCampoIncompleto);
  };

  const populateFormData = (data) => {
    setFormData({
      name: isCampoIncompleto(data?.name) ? "" : data.name,
      email: isEmailInvalido(data?.email) ? "" : data.email, // Si tiene @sinemail.com o @noemail.com, lo deja en blanco
      birthdate: data?.birthdate ? data.birthdate.split("T")[0] : "",
      address: isCampoIncompleto(data?.address) ? "" : data.address,
      phoneCode: isCampoIncompleto(data?.phoneCode) ? "54" : data.phoneCode,
      phoneArea: isCampoIncompleto(data?.phoneArea) ? "" : data.phoneArea,
      phoneNumber: isCampoIncompleto(data?.phoneNumber) ? "" : data.phoneNumber,
      civilStatus: isCampoIncompleto(data?.civilStatus) ? "Soltero/a" : data.civilStatus,
      profession: isCampoIncompleto(data?.profession) ? "" : data.profession,
      church: isCampoIncompleto(data?.church) ? "" : data.church,
      ministerialRole: isCampoIncompleto(data?.ministerialRole) ? "" : data.ministerialRole,
      reason: isCampoIncompleto(data?.reason) ? "" : data.reason,
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      setError("");

      if (!token) {
        setError("No hay sesión activa. Por favor inicia sesión nuevamente.");
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/usuarios/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener la información personal.");
        }

        const data = await response.json();
        setUserData(data);
        populateFormData(data);

        // Si es alumno y tiene campos vacíos, "-" o email temporal
        if (checkIncompleteProfile(data)) {
          setIsForced(true);
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError("Error al cargar los datos del perfil. Verifica tu conexión.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [API_URL, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isForced || userData?.role === "alumno") {
      // 1. Validar correo electrónico real
      if (isEmailInvalido(formData.email)) {
        setError("Debes ingresar una dirección de correo electrónico real y válida (no se admiten correos @sinemail.com ni @noemail.com).");
        return;
      }

      // 2. Validar campos obligatorios de texto
      const camposRequeridos = [
        { campo: "Nombre Completo", valor: formData.name },
        { campo: "Fecha de Nacimiento", valor: formData.birthdate },
        { campo: "Dirección / Localidad", valor: formData.address },
        { campo: "Código de Área", valor: formData.phoneArea },
        { campo: "Número de Teléfono", valor: formData.phoneNumber },
        { campo: "Profesión / Ocupación", valor: formData.profession },
        { campo: "Iglesia y Pastor", valor: formData.church },
        { campo: "Motivo de Inscripción", valor: formData.reason },
      ];

      for (const item of camposRequeridos) {
        if (isCampoIncompleto(item.valor)) {
          setError(`Por favor completa el campo "${item.campo}" con datos válidos.`);
          return;
        }
      }
    }

    setSavingProfile(true);

    try {
      const response = await fetch(`${API_URL}/usuarios/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Error al actualizar la información.");
      }

      const usuarioActualizado = resData.usuario || { ...userData, ...formData };
      setUserData(usuarioActualizado);
      populateFormData(usuarioActualizado);
      setIsForced(false);
      setIsEditing(false);

      setSuccess("✅ ¡Tus datos fueron guardados con éxito!");

      // Notificar al Dashboard que el perfil quedó completo y desbloquear
      if (onProfileComplete) {
        setTimeout(() => {
          onProfileComplete(usuarioActualizado);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos de contraseña son requeridos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios/cambiar-contrasena`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar la contraseña.");
      }

      setPasswordSuccess("Contraseña cambiada con éxito.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Error al cambiar la contraseña.");
    }
  };

  if (loadingUser) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Cargando información del perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-container container py-4" style={{ maxWidth: "800px" }}>
      <h2 className="mb-3 text-center fw-bold">Perfil de Usuario</h2>

      {/* Cartel explicativo si faltan datos */}
      {isForced && (
        <div className="alert alert-info d-flex align-items-center mb-4 p-3 shadow-sm border-info rounded-3">
          <FaInfoCircle className="fs-3 text-info me-3 flex-shrink-0" />
          <div>
            <h6 className="alert-heading mb-1 fw-bold text-dark">
              Completa tus datos personales
            </h6>
            <p className="mb-0 small text-secondary">
              Para ingresar al campus, completa todos los campos requeridos con tus datos reales (incluyendo tu correo electrónico personal) y presiona <strong>Guardar Datos</strong>.
            </p>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger text-center p-2 mb-3">{error}</div>}
      {success && <div className="alert alert-success text-center p-2 mb-3">{success}</div>}

      {/* Formulario editable */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="card p-4 shadow-sm border-0 bg-white rounded-3">
          <div className="d-flex align-items-center mb-3 text-primary border-bottom pb-2">
            <FaUserEdit className="me-2 fs-5" />
            <h5 className="mb-0 fw-bold">
              {isForced ? "Formulario de Actualización de Datos" : "Editar Datos del Perfil"}
            </h5>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Nombre y Apellido *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Ingresa tu nombre completo"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Correo Electrónico Real *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="ejemplo@correo.com"
                value={formData.email || ""}
                onChange={handleInputChange}
                required
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="birthdate"
                className="form-control"
                value={formData.birthdate || ""}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">DNI (Identificador)</label>
              <input
                type="text"
                className="form-control bg-light"
                value={userData?.dni || ""}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Dirección / Localidad *</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Calle, Número, Ciudad"
                value={formData.address || ""}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold small text-muted">Cód. País</label>
              <input
                type="text"
                name="phoneCode"
                className="form-control"
                value={formData.phoneCode || "54"}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Cód. Área (sin 0) *</label>
              <input
                type="text"
                name="phoneArea"
                className="form-control"
                placeholder="Ej: 11 o 376"
                value={formData.phoneArea || ""}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-5">
              <label className="form-label fw-bold small text-muted">Número (sin 15) *</label>
              <input
                type="text"
                name="phoneNumber"
                className="form-control"
                placeholder="Ej: 4567890"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Estado Civil *</label>
              <select
                name="civilStatus"
                className="form-select"
                value={formData.civilStatus || "Soltero/a"}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              >
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Profesión / Ocupación *</label>
              <input
                type="text"
                name="profession"
                className="form-control"
                placeholder="Ej: Docente, Comerciante, Estudiante..."
                value={formData.profession || ""}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Iglesia y Pastor *</label>
              <input
                type="text"
                name="church"
                className="form-control"
                placeholder="Nombre de la congregación y pastor"
                value={formData.church || ""}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small text-muted">Rol Ministerial (opcional)</label>
              <input
                type="text"
                name="ministerialRole"
                className="form-control"
                placeholder="Ej: Líder de jóvenes, Alabanza..."
                value={formData.ministerialRole || ""}
                onChange={handleInputChange}
                disabled={savingProfile}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-bold small text-muted">Motivo de Inscripción *</label>
              <textarea
                name="reason"
                className="form-control"
                rows="3"
                placeholder="¿Por qué deseas capacitarte en la Escuela de Misiones?"
                value={formData.reason || ""}
                onChange={handleInputChange}
                required={isForced}
                disabled={savingProfile}
              ></textarea>
            </div>
          </div>

          <div className="mt-4 d-flex justify-content-end">
            {!isForced && (
              <button
                type="button"
                className="btn btn-outline-secondary me-2 px-3"
                onClick={() => setIsEditing(false)}
                disabled={savingProfile}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center"
              disabled={savingProfile}
            >
              {savingProfile ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                "Guardar Datos"
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Vista de lectura cuando el perfil ya está completo */
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-outline-primary" onClick={() => setIsEditing(true)}>
              <FaPen className="me-1" /> Editar Datos
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="card h-100 shadow-sm p-3 border-0">
                <h6 className="text-primary border-bottom pb-2 fw-bold">Datos Personales</h6>
                <p className="mb-1"><strong>Nombre:</strong> {userData?.name}</p>
                <p className="mb-1">
                  <strong>Fecha de Nacimiento:</strong>{" "}
                  {userData?.birthdate ? new Date(userData.birthdate).toLocaleDateString() : "No especificada"}
                </p>
                <p className="mb-1"><strong>DNI:</strong> {userData?.dni}</p>
                <p className="mb-0"><strong>Dirección:</strong> {userData?.address || "No especificada"}</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 shadow-sm p-3 border-0">
                <h6 className="text-primary border-bottom pb-2 fw-bold">Contacto</h6>
                <p className="mb-1">
                  <strong>Teléfono:</strong> (+{userData?.phoneCode}) {userData?.phoneArea}-{userData?.phoneNumber}
                </p>
                <p className="mb-0"><strong>Email:</strong> {userData?.email}</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 shadow-sm p-3 border-0">
                <h6 className="text-primary border-bottom pb-2 fw-bold">Datos Religiosos</h6>
                <p className="mb-1"><strong>Iglesia y Pastor:</strong> {userData?.church || "No especificada"}</p>
                <p className="mb-1"><strong>Rol Ministerial:</strong> {userData?.ministerialRole || "No asignado"}</p>
                <p className="mb-0"><strong>Motivo de Inscripción:</strong> {userData?.reason || "No especificado"}</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 shadow-sm p-3 border-0">
                <h6 className="text-primary border-bottom pb-2 fw-bold">Otros</h6>
                <p className="mb-1"><strong>Estado Civil:</strong> {userData?.civilStatus || "No especificado"}</p>
                <p className="mb-1"><strong>Profesión:</strong> {userData?.profession || "No especificada"}</p>
                <p className="mb-0"><strong>Rol en la Plataforma:</strong> {userData?.role}</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              <FaLock className="me-2" /> Cambiar Contraseña
            </button>
          </div>

          {showPasswordForm && (
            <div className="card p-4 shadow-sm mt-3 mx-auto border-0" style={{ maxWidth: "450px" }}>
              <h6 className="mb-3 text-center fw-bold">Cambiar Contraseña</h6>
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="form-control mb-3"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordError && <p className="text-danger small">{passwordError}</p>}
              {passwordSuccess && <p className="text-success small">{passwordSuccess}</p>}
              <button className="btn btn-success w-100" onClick={handleChangePassword}>
                Confirmar Cambio
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Perfil;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resettingPass, setResettingPass] = useState(false);
  const navigate = useNavigate();

  const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const baseUrl = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
  const rawToken = localStorage.getItem("token");
  const token = rawToken?.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;

  useEffect(() => {
    if (!rawToken) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${baseUrl}/admin/usuarios/${id}`, {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Error al cargar el usuario.");
        }

        const data = await response.json();
        setUser({
          ...data,
          name: data.name || "",
          dni: data.dni || "",
          email: data.email || "",
          legajo: data.legajo || "",
          phoneCode: data.phoneCode || "",
          phoneArea: data.phoneArea || "",
          phoneNumber: data.phoneNumber || "",
          birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
          address: data.address || "",
          civilStatus: data.civilStatus || "",
          profession: data.profession || "",
          church: data.church || "",
          ministerialRole: data.ministerialRole || "",
          reason: data.reason || "",
          role: data.role || "alumno",
          isVerified: data.isVerified ?? false,
        });
      } catch (err) {
        setError("Error al cargar los datos del usuario.");
        console.error(err);
      }
    };

    fetchUser();
  }, [id, rawToken, navigate, baseUrl, token]);

  const handleInputChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user.name.trim() || !user.dni.trim()) {
      setError("El nombre y el DNI son campos obligatorios.");
      return;
    }

    const confirmed = window.confirm(
      "¿Estás seguro de guardar las modificaciones de este usuario?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${baseUrl}/admin/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar los cambios.");
      }

      setSuccess("✅ Cambios guardados con éxito.");
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message || "Error al guardar los cambios.");
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    const confirmacion = window.confirm(
      `⚠️ ¿ATENCIÓN: Deseas resetear la contraseña de ${user.name}?\n\nSu nueva contraseña pasará a ser su DNI: "${user.dni}".`
    );

    if (!confirmacion) return;

    try {
      setResettingPass(true);
      const response = await fetch(`${baseUrl}/admin/usuarios/${id}/reset-password`, {
        method: "POST",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al resetear contraseña.");
      }

      alert(data.message);
      setSuccess("🔑 Contraseña reseteada correctamente al DNI del usuario.");
    } catch (err) {
      console.error("❌ Error al resetear contraseña:", err);
      setError(err.message || "Error al resetear la contraseña.");
    } finally {
      setResettingPass(false);
    }
  };

  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 border-bottom pb-3">
        <div>
          <h1 className="h2 mb-0">Editar Usuario</h1>
          <small className="text-muted">ID: {id}</small>
        </div>

        {/* 🔑 BOTÓN DE RESETEAR CONTRASEÑA */}
        <button
          type="button"
          className="btn btn-warning d-flex align-items-center gap-2 fw-semibold shadow-sm"
          onClick={handleResetPassword}
          disabled={resettingPass}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
          </svg>
          {resettingPass ? "Reseteando..." : "Resetear Contraseña a DNI"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSave} className="card p-4 shadow-sm">
        <h5 className="text-primary mb-3">Datos Principales y Acceso</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Nombre Completo:</label>
            <input
              type="text"
              className="form-control"
              value={user.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">DNI (Usuario de acceso):</label>
            <input
              type="text"
              className="form-control"
              value={user.dni}
              onChange={(e) => handleInputChange("dni", e.target.value)}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Legajo:</label>
            <input
              type="text"
              className="form-control"
              value={user.legajo}
              onChange={(e) => handleInputChange("legajo", e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Correo Electrónico:</label>
            <input
              type="email"
              className="form-control"
              value={user.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Rol del Sistema:</label>
            <select
              className="form-select"
              value={user.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
            >
              <option value="alumno">Alumno</option>
              <option value="profesor">Profesor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Estado de Cuenta:</label>
            <select
              className="form-select"
              value={user.isVerified ? "true" : "false"}
              onChange={(e) => handleInputChange("isVerified", e.target.value === "true")}
            >
              <option value="true">Verificado (Acceso Permitido)</option>
              <option value="false">Pendiente de Verificación</option>
            </select>
          </div>
        </div>

        <h5 className="text-primary mt-4 mb-3">Contacto y Teléfono</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Cód. País (ej: 54 / 591):</label>
            <input
              type="text"
              className="form-control"
              placeholder="54"
              value={user.phoneCode}
              onChange={(e) => handleInputChange("phoneCode", e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Cód. Área (ej: 341 o -):</label>
            <input
              type="text"
              className="form-control"
              placeholder="Área (sin 0 ni -)"
              value={user.phoneArea}
              onChange={(e) => handleInputChange("phoneArea", e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Número de Teléfono (sin 15):</label>
            <input
              type="text"
              className="form-control"
              placeholder="Número de WhatsApp"
              value={user.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
          </div>
        </div>

        <h5 className="text-primary mt-4 mb-3">Datos Personales y Perfil</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Fecha de Nacimiento:</label>
            <input
              type="date"
              className="form-control"
              value={user.birthdate}
              onChange={(e) => handleInputChange("birthdate", e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Estado Civil:</label>
            <input
              type="text"
              className="form-control"
              value={user.civilStatus}
              onChange={(e) => handleInputChange("civilStatus", e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Profesión u Ocupación:</label>
            <input
              type="text"
              className="form-control"
              value={user.profession}
              onChange={(e) => handleInputChange("profession", e.target.value)}
            />
          </div>

          <div className="col-md-12">
            <label className="form-label fw-semibold">Dirección / Localidad:</label>
            <input
              type="text"
              className="form-control"
              value={user.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Iglesia a la que asiste:</label>
            <input
              type="text"
              className="form-control"
              value={user.church}
              onChange={(e) => handleInputChange("church", e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Rol Ministerial:</label>
            <input
              type="text"
              className="form-control"
              value={user.ministerialRole}
              onChange={(e) => handleInputChange("ministerialRole", e.target.value)}
            />
          </div>

          <div className="col-md-12">
            <label className="form-label fw-semibold">Motivo de ingreso:</label>
            <textarea
              rows="2"
              className="form-control"
              value={user.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex gap-3 mt-4 pt-3 border-top">
          <button
            type="submit"
            className="btn btn-primary px-4 fw-semibold"
            disabled={Boolean(success)}
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={() => navigate("/admin-dashboard")}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
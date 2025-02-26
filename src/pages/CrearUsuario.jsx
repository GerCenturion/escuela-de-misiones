import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CrearUsuario = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    role: "alumno",
    legajo: "",
    phoneCode: "54",
    phoneArea: "",
    phoneNumber: "",
    dni: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validar campos obligatorios
    if (!formData.name || !formData.dni || !formData.password) {
      setError("⚠️ Todos los campos obligatorios deben completarse.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el usuario.");
      }

      alert("✅ Usuario creado con éxito.");
      navigate("/admin-dashboard"); // Redirigir al panel de administración
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Usuario</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre Completo:</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* <div className="mb-3">
          <label className="form-label">Correo Electrónico:</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div> */}

        <div className="mb-3">
          <label className="form-label">DNI:</label>
          <input
            type="text"
            className="form-control"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Rol:</label>
          <select
            className="form-control"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="admin">Administrador</option>
            <option value="profesor">Profesor</option>
            <option value="alumno">Alumno</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Legajo (Opcional):</label>
          <input
            type="text"
            className="form-control"
            name="legajo"
            value={formData.legajo}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Teléfono:</label>
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              name="phoneArea"
              placeholder="Área"
              value={formData.phoneArea}
              onChange={handleChange}
              style={{ width: "100px" }}
            />
            <input
              type="text"
              className="form-control"
              name="phoneNumber"
              placeholder="Número"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña:</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-flex gap-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Creando usuario..." : "Crear Usuario"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin-dashboard")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearUsuario;

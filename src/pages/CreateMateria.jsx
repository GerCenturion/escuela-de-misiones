import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateMateria = () => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Elemental");
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/materias/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ name, level, isEnrollmentOpen }),
      });

      if (!response.ok) {
        throw new Error("Error al crear la materia");
      }

      navigate("/admin-dashboard"); // Redirige al dashboard del administrador
    } catch (error) {
      setError("Error al crear la materia");
      console.error(error);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Crear Nueva Materia</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre de la Materia:</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Nivel:</label>
          <select
            className="form-control"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="Elemental">Elemental</option>
            <option value="Avanzado 1">Avanzado 1</option>
            <option value="Avanzado 2">Avanzado 2</option>
            <option value="Avanzado 3">Avanzado 3</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Habilitar Inscripción:</label>
          <select
            className="form-control"
            value={isEnrollmentOpen ? "true" : "false"}
            onChange={(e) => setIsEnrollmentOpen(e.target.value === "true")}
          >
            <option value="true">Habilitado</option>
            <option value="false">Deshabilitado</option>
          </select>
        </div>

        <div className="d-flex gap-3">
          <button
            type="submit"
            className="btn btn-primary"
          >
            Crear Materia
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin-dashboard")}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMateria;

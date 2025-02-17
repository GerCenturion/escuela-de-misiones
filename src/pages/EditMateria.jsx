import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const EditMateria = () => {
  const { id } = useParams();
  const [materia, setMateria] = useState(null);
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMateria = async () => {
      try {
        const response = await fetch(`${API_URL}/materias/${id}`, {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Error al cargar la materia");
        }

        const data = await response.json();
        setMateria(data);
      } catch (error) {
        setError("Error al cargar la materia");
        console.error(error);
      }
    };

    const fetchProfesores = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Error al cargar la lista de usuarios");
        }

        const data = await response.json();
        // Filtrar usuarios que sean "profesor" o "admin"
        const profesoresFiltrados = data.filter(
          (usuario) => usuario.role === "profesor" || usuario.role === "admin"
        );
        setProfesores(profesoresFiltrados);
      } catch (error) {
        setError("Error al cargar la lista de usuarios");
        console.error(error);
      }
    };

    fetchMateria();
    fetchProfesores();
  }, [id, token, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm(
      "¿Estás seguro de guardar los cambios en esta materia?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/materias/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(materia),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios");
      }

      navigate("/admin-dashboard");
    } catch (error) {
      setError("Error al guardar los cambios");
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  if (!materia) {
    return <Spinner />;
  }

  return (
    <div className="container mt-5">
      <h1>Editar Materia</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="mb-3">
          <label className="form-label">Nombre de la materia:</label>
          <input
            type="text"
            className="form-control"
            value={materia.name}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Nivel:</label>
          <input
            type="text"
            className="form-control"
            value={materia.level}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Habilitar Inscripción:</label>
          <select
            className="form-control"
            value={materia.isEnrollmentOpen ? "true" : "false"}
            onChange={(e) =>
              setMateria({
                ...materia,
                isEnrollmentOpen: e.target.value === "true",
              })
            }
          >
            <option value="true">Habilitado</option>
            <option value="false">Deshabilitado</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Asignar Profesor:</label>
          <select
            className="form-control"
            value={materia.professor || ""}
            onChange={(e) =>
              setMateria({ ...materia, professor: e.target.value })
            }
          >
            <option value="">Sin asignar</option>
            {profesores.map((profesor) => (
              <option
                key={profesor._id}
                value={profesor._id}
              >
                {profesor.name} ({profesor.role})
              </option>
            ))}
          </select>
        </div>
        <div className="d-flex gap-3">
          <button
            type="submit"
            className="btn btn-primary"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMateria;

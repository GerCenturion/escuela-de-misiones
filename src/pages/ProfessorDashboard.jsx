import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfessorDashboard = () => {
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Verificar si el usuario es admin
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("Por favor, inicia sesión para acceder al dashboard.");
      window.location.href = "/login";
      return;
    }

    const fetchMaterias = async () => {
      try {
        const response = await fetch(`${API_URL}/materias`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar las materias asignadas");
        }

        const data = await response.json();

        // Filtrar materias asignadas al profesor
        const materiasProfesor = data.filter(
          (materia) => materia.professor?._id === obtenerIdProfesor()
        );
        setMaterias(materiasProfesor);
      } catch (error) {
        setError("Error al cargar las materias asignadas");
        console.error(error);
      }
    };

    const verificarAdmin = () => {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        if (decodedToken.role === "admin") {
          setIsAdmin(true); // Es admin
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    };

    fetchMaterias();
    verificarAdmin();
  }, [token]);

  const obtenerIdProfesor = () => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      return decodedToken.id; // ID del profesor
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  const MateriaItem = ({ materia }) => {
    const alumnosAceptados = materia.students.filter(
      (student) => student.status === "Aceptado"
    ).length;

    const alumnosPendientes = materia.students.filter(
      (student) => student.status === "Pendiente"
    ).length;

    return (
      <li className="list-group-item">
        <h5>{materia.name}</h5>
        <p>Nivel: {materia.level}</p>
        <p>
          <strong>Alumnos:</strong> {alumnosAceptados} aceptados,{" "}
          {alumnosPendientes} pendientes
        </p>
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/professor/materias/${materia._id}`)}
          >
            Ver Materia
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="container mt-5">
      <h1>Dashboard del Profesor</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {isAdmin && (
        <button
          className="btn btn-warning mb-3"
          onClick={() => navigate("/admin-dashboard")}
        >
          Ir al Dashboard de Administración
        </button>
      )}

      <ul className="list-group">
        {materias.length > 0 ? (
          materias.map((materia) => (
            <MateriaItem
              key={materia._id}
              materia={materia}
            />
          ))
        ) : (
          <p>No tienes materias asignadas.</p>
        )}
      </ul>
    </div>
  );
};

export default ProfessorDashboard;

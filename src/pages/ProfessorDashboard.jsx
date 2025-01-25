import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfessorDashboard = () => {
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si el usuario es admin
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMaterias = async () => {
      try {
        const response = await fetch(`${API_URL}/materias`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar las materias");
        }

        const data = await response.json();

        // Filtrar las materias asignadas al profesor
        const materiasProfesor = data.filter(
          (materia) => materia.professor?._id === getProfessorIdFromToken()
        );

        setMaterias(materiasProfesor);
      } catch (error) {
        setError("Error al cargar las materias");
        console.error(error);
      }
    };

    const checkAdminRole = () => {
      const decoded = getDecodedToken();
      if (decoded && decoded.role === "admin") {
        setIsAdmin(true); // Verifica si el usuario tiene rol de admin
      }
    };

    fetchMaterias();
    checkAdminRole();
  }, [token, navigate]);

  const getDecodedToken = () => {
    try {
      return JSON.parse(atob(token.split(".")[1])); // Decodifica el token
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  const getProfessorIdFromToken = () => {
    const decoded = getDecodedToken();
    return decoded ? decoded.id : null;
  };

  const handleMateriaClick = (materiaId) => {
    navigate(`/professor/materias/${materiaId}`); // Redirige a la página de la materia
  };

  if (!materias.length && !error) {
    return <div>Cargando materias...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Materias Asignadas</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {isAdmin && (
        <button
          className="btn btn-warning mb-3"
          onClick={() => navigate("/admin-dashboard")}
        >
          ADMIN
        </button>
      )}

      <div className="list-group mt-4">
        {materias.map((materia) => (
          <button
            key={materia._id}
            className="list-group-item list-group-item-action"
            onClick={() => handleMateriaClick(materia._id)}
          >
            <h5>{materia.name}</h5>
            <p>{materia.level}</p>
            <small>Alumnos inscritos: {materia.students.length}</small>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfessorDashboard;

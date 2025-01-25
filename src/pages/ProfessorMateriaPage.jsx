import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProfessorMateriaPage = () => {
  const { id } = useParams();
  const [materia, setMateria] = useState(null);
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
          headers: { Authorization: `Bearer ${token}` },
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

    fetchMateria();
  }, [id, token, navigate]);

  if (!materia) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>{materia.name}</h1>
      <p>{materia.level}</p>
      {error && <div className="alert alert-danger">{error}</div>}

      <h3>Alumnos</h3>
      <ul className="list-group mt-3">
        {materia.students.map((student) => (
          <li
            key={student.student._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {student.student.name} ({student.student.email})
            </span>
            <span>{student.status}</span>
          </li>
        ))}
      </ul>

      <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate("/professor-dashboard")}
      >
        Volver
      </button>
    </div>
  );
};

export default ProfessorMateriaPage;

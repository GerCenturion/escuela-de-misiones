import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";

const ProfessorMateriaPage = () => {
  const { id } = useParams(); // ID de la materia desde la URL
  const [materia, setMateria] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMateria = async () => {
      try {
        const response = await fetch(`${API_URL}/materias/${id}`, {
          method: "GET",
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
  }, [id, token]);

  const gestionarInscripcion = async (alumnoId, status) => {
    // Validar si el estado seleccionado ya coincide con el estado actual
    const currentStatus = materia.students.find(
      (student) => student.student._id === alumnoId
    )?.status;

    if (currentStatus === status) {
      alert("El estado seleccionado ya es el actual.");
      return;
    }

    const confirmChange = window.confirm(
      `¿Estás seguro de que deseas cambiar el estado a "${status}"?`
    );

    if (!confirmChange) {
      return; // Salir si el usuario cancela
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/materias/gestionar-inscripcion/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ alumnoId, status }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al gestionar la solicitud de inscripción");
      }

      const data = await response.json();
      alert(data.message);

      // Actualizamos la lista de estudiantes
      setMateria((prevMateria) => ({
        ...prevMateria,
        students: prevMateria.students.map((student) =>
          student.student._id === alumnoId ? { ...student, status } : student
        ),
      }));
    } catch (error) {
      setError("Error al gestionar la solicitud");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!materia) {
    return <div>Cargando materia...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>{materia.name}</h1>
      <p>Nivel: {materia.level}</p>

      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate("/professor-dashboard")}
      >
        Volver al Dashboard
      </button>

      <h2>Solicitudes de Inscripción</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="list-group">
        {materia.students.map((student) => (
          <li
            key={student.student._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <p>
                <strong>{student.student.name}</strong> -{" "}
                {student.student.email}
              </p>
              <p>
                Estado actual:{" "}
                <span
                  className={`badge ${
                    student.status === "Pendiente"
                      ? "bg-warning"
                      : student.status === "Aceptado"
                      ? "bg-success"
                      : student.status === "Rechazado"
                      ? "bg-danger"
                      : "bg-secondary"
                  }`}
                >
                  {student.status || "Sin estado"}
                </span>
              </p>
            </div>
            <div>
              {loading ? (
                <button
                  className="btn btn-primary btn-sm"
                  disabled
                >
                  Cargando...
                </button>
              ) : (
                <select
                  className="form-select form-select-sm"
                  value={student.status || ""}
                  onChange={(e) =>
                    gestionarInscripcion(student.student._id, e.target.value)
                  }
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              )}
            </div>
          </li>
        ))}
      </ul>
      <FileUploader></FileUploader>
    </div>
  );
};

export default ProfessorMateriaPage;

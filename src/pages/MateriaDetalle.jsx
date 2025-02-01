import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MateriaDetalle = () => {
  const { id } = useParams(); // ID de la materia desde la URL
  const [materia, setMateria] = useState(null);
  const [error, setError] = useState("");
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

  if (!materia) {
    return <div>Cargando información de la materia...</div>;
  }

  return (
    <div className="container mt-5">
      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate("/dashboard")}
      >
        Volver al Dashboard
      </button>

      <h1>{materia.name}</h1>
      <p>Nivel: {materia.level}</p>
      <h3>Profesor: {materia.professor?.name || "No asignado"}</h3>

      {/* Archivos Subidos */}
      <h2 className="mt-4">Archivos</h2>
      {materia.files.length > 0 ? (
        <ul className="list-group">
          {materia.files.map((file, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{file.fileName}</span>
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Descargar
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay archivos disponibles.</p>
      )}

      {/* Videos Asociados */}
      <h2 className="mt-4">Videos</h2>
      {materia.videos.length > 0 ? (
        <ul className="list-group">
          {materia.videos.map((video, index) => (
            <li
              key={index}
              className="list-group-item"
            >
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {video.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay videos disponibles.</p>
      )}

      {/* Exámenes Disponibles */}
      <h2 className="mt-4">Exámenes</h2>
      {materia.examenes.length > 0 ? (
        <ul className="list-group">
          {materia.examenes.map((examen, index) => (
            <li
              key={index}
              className="list-group-item"
            >
              <span>{examen.titulo || `Examen ${index + 1}`}</span>
              <button className="btn btn-info btn-sm">Realizar Examen</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay exámenes disponibles.</p>
      )}
    </div>
  );
};

export default MateriaDetalle;

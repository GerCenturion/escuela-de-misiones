import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import Spinner from "../components/Spinner";

const Oyente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materia, setMateria] = useState(null);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMateria = async () => {
      try {
        const response = await fetch(`${API_URL}/materias/completo/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener la materia: ${response.status}`);
        }

        const data = await response.json();
        setMateria(data);
      } catch (error) {
        console.error("❌ Error en fetchMateria:", error);
        setError(error.message);
      }
    };

    fetchMateria();
  }, [id, token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!materia) {
    return <Spinner />;
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
        <div className="row">
          {materia.videos.map((video, index) => (
            <div
              key={index}
              className="col-md-6"
            >
              <VideoPlayer video={video} />
            </div>
          ))}
        </div>
      ) : (
        <p>No hay videos disponibles.</p>
      )}

      <div className="alert alert-warning mt-4">
        Para acceder a los exámenes, debes estar inscrito en la materia.
      </div>
    </div>
  );
};

export default Oyente;

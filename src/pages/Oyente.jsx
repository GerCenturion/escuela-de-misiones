import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import Spinner from "../components/Spinner";

const Oyente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materia, setMateria] = useState(null);
  const [error, setError] = useState("");

  // Normalizar API_URL
  const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_URL = rawApiUrl.replace(/\/+$/, "");

  useEffect(() => {
    const fetchMateria = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        console.log(`📡 Cargando materia para oyente desde ${API_URL}/materias/${id}`);
        const response = await fetch(`${API_URL}/materias/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`Error al obtener la materia: ${response.status}`);
        }

        const data = await response.json();
        setMateria(data);
      } catch (error) {
        console.error("❌ Error en fetchMateria (Oyente):", error);
        setError(error.message);
      }
    };

    if (id) {
      fetchMateria();
    }
  }, [id, navigate, API_URL]);

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/dashboard")}
        >
          Volver al Dashboard
        </button>
      </div>
    );
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
      {materia.files && materia.files.length > 0 ? (
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
      {materia.videos && materia.videos.length > 0 ? (
        <div className="row">
          {materia.videos.map((video, index) => (
            <div key={index} className="col-md-6 mb-3">
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
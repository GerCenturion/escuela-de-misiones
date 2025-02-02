import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";

const MateriaDetalle = () => {
  const { id } = useParams(); // ID de la materia desde la URL
  const [materia, setMateria] = useState(null);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMateria = async () => {
      if (!id) {
        setError("ID de la materia no válido.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/materias/completo/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar la materia");
        }

        const data = await response.json();
        setMateria(data);
      } catch (error) {
        setError("Error al cargar la materia.");
        console.error(error);
      }
    };

    fetchMateria();
  }, [id, token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!materia) {
    return (
      <div className="text-center">Cargando información de la materia...</div>
    );
  }
  console.log("Materia obtenida:", materia);
  console.log("Exámenes disponibles:", materia?.examenes);

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

      {/* Exámenes Disponibles */}
      <h2 className="mt-4">Exámenes</h2>

      {!materia ? (
        <p>Cargando exámenes...</p>
      ) : materia.examenes && materia.examenes.length > 0 ? (
        <ul className="list-group">
          {materia.examenes
            .filter((examen) => typeof examen === "object" && examen !== null) // 💡 Solo incluye objetos
            .map((examen, index) => (
              <li
                key={examen._id} // Usa `_id` como clave
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{examen.titulo || `Examen ${index + 1}`}</span>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => {
                    if (!examen._id) {
                      console.error(
                        "Error: ID del examen no encontrado",
                        examen
                      );
                      alert("ID del examen no válido");
                      return;
                    }

                    console.log("Navegando al examen con ID:", examen._id);
                    navigate(`/examen/${examen._id}`);
                  }}
                >
                  Realizar Examen
                </button>
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

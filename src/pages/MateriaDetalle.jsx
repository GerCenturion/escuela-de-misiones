import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";

const MateriaDetalle = () => {
  const { id } = useParams();
  const [materia, setMateria] = useState(null);
  const [examenes, setExamenes] = useState([]);
  const [estadoExamenes, setEstadoExamenes] = useState({});
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
        console.log(
          `📡 Solicitando materia desde: ${API_URL}/materias/completo/${id}`
        );
        const response = await fetch(`${API_URL}/materias/completo/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(
            `Error al cargar la materia: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("🟢 Materia obtenida:", data);
        setMateria(data);

        if (data.examenes) {
          setExamenes(data.examenes);
          data.examenes.forEach((examen) => {
            if (examen._id) {
              fetchEstadoExamen(examen._id);
            } else {
              console.error("❌ Examen sin ID válido:", examen);
            }
          });
        }
      } catch (error) {
        setError(error.message);
        console.error(error);
      }
    };

    const fetchEstadoExamen = async (examenId) => {
      try {
        console.log(
          `📡 Solicitando estado del examen desde: ${API_URL}/examenes/examenes/${examenId}`
        );
        const response = await fetch(
          `${API_URL}/examenes/examenes/${examenId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error al cargar el estado del examen: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("🟢 Estado del examen obtenido:", data);

        setEstadoExamenes((prev) => ({
          ...prev,
          [examenId]: {
            completado: data.respuestas?.length > 0,
            corregido: data.respuestas?.[0]?.corregido || false,
            totalPuntuacion:
              data.respuestas?.[0]?.totalPuntuacion ?? "Pendiente",
          },
        }));
      } catch (error) {
        console.error("❌ Error al obtener estado del examen:", error);
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
      {examenes.length > 0 ? (
        <ul className="list-group">
          {examenes.map((examen) => {
            const estado = estadoExamenes[examen._id];
            const nota = estado?.totalPuntuacion ?? "Pendiente";

            // Definir colores y mensajes según el estado del examen
            let estadoTexto = "";
            let estadoClase = "badge bg-secondary";
            let mostrarBoton = true;

            if (estado?.completado) {
              mostrarBoton = false; // Ocultar botón si el examen ya fue realizado

              if (estado.corregido) {
                estadoTexto = `Nota: ${nota} / 10`;
                estadoClase = nota > 5 ? "badge bg-success" : "badge bg-danger";
              } else {
                estadoTexto = "🕒 Esperando corrección...";
                estadoClase = "badge bg-warning text-dark";
              }
            }

            return (
              <li
                key={examen._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{examen.titulo}</span>

                {/* Estado del examen */}
                <span className={estadoClase}>{estadoTexto}</span>

                {/* Mostrar botón solo si el examen no ha sido realizado */}
                {mostrarBoton && (
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/examen/${examen._id}`)}
                  >
                    Realizar Examen
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No hay exámenes disponibles.</p>
      )}
    </div>
  );
};

export default MateriaDetalle;

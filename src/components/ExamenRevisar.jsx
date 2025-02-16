// src/components/ExamenRevisar.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ExamenRevisar = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamen = async () => {
      try {
        console.log(`📡 Solicitando revisión del examen: ${examenId}`);
        const response = await fetch(
          `${API_URL}/examenes/examenes/${examenId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Error al obtener el examen: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("🟢 Examen obtenido:", data);
        setExamen(data);
      } catch (error) {
        setError(error.message);
        console.error(error);
      }
    };

    fetchExamen();
  }, [examenId, token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!examen) {
    return <div className="text-center">Cargando revisión del examen...</div>;
  }

  return (
    <div className="container mt-5">
      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        Volver
      </button>
      <h1>Revisión del Examen: {examen.titulo}</h1>

      <h2 className="mt-4">Preguntas</h2>
      <ul className="list-group">
        {examen.preguntas.map((pregunta, index) => {
          const respuestaAlumno = examen.respuestas
            .flatMap((resp) => resp.respuestas) // Buscar en todas las respuestas
            .find((r) => r.preguntaId === pregunta._id);

          return (
            <li
              key={index}
              className="list-group-item"
            >
              <strong>{pregunta.texto}</strong>
              <p>
                <strong>Respuesta del alumno:</strong>{" "}
                {respuestaAlumno?.respuestaTexto ?? "No respondida"}
              </p>

              {/* Mostrar todas las opciones si la pregunta es multiple-choice */}
              {pregunta.tipo === "multiple-choice" && (
                <div>
                  <p>
                    <strong>Opciones:</strong>
                  </p>
                  <ul>
                    {pregunta.opciones.map((opcion) => (
                      <li
                        key={opcion._id}
                        style={{
                          fontWeight:
                            opcion._id === respuestaAlumno?.opcionSeleccionada
                              ? "bold"
                              : "normal",
                          color:
                            opcion._id === respuestaAlumno?.opcionSeleccionada
                              ? "green"
                              : "black",
                        }}
                      >
                        {opcion.texto}{" "}
                        {opcion._id === respuestaAlumno?.opcionSeleccionada
                          ? "✔️ (Seleccionada)"
                          : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mostrar audio si la pregunta es de tipo audio */}
              {pregunta.tipo === "audio" &&
                respuestaAlumno?.respuestaAudioUrl && (
                  <p>
                    <strong>Respuesta en audio:</strong>{" "}
                    <audio controls>
                      <source
                        src={respuestaAlumno.respuestaAudioUrl}
                        type="audio/mpeg"
                      />
                      Tu navegador no soporta la reproducción de audio.
                    </audio>
                  </p>
                )}

              {/* Mostrar estado de la pregunta (Aprobado/Rehacer) */}
              {respuestaAlumno?.estado && (
                <p>
                  <strong>Estado:</strong>{" "}
                  {respuestaAlumno.estado === "aprobado"
                    ? "✔️ Aprobado"
                    : "❌ Rehacer"}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ExamenRevisar;

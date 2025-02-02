import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CorregirExamen = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchExamenCompleto = async () => {
      try {
        console.log("📌 Solicitando examen con ID:", examenId);
        const response = await fetch(
          `${API_URL}/examenes/${examenId}/detalles-completos`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener los detalles del examen.");
        }

        const data = await response.json();
        console.log("✅ Examen obtenido:", data);
        setExamen(data);
      } catch (error) {
        console.error("❌ Error al obtener examen:", error);
      }
    };

    if (examenId) {
      fetchExamenCompleto();
    }
  }, [examenId, token]);

  if (!examen) {
    return <p>Cargando examen...</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Corregir Examen: {examen.titulo}</h2>
      <p>
        <strong>Materia:</strong> {examen.materia?.name}
      </p>
      <p>
        <strong>Profesor:</strong> {examen.profesor?.name} (
        {examen.profesor?.email})
      </p>

      {examen.respuestas.length === 0 ? (
        <p>No hay respuestas para este examen.</p>
      ) : (
        examen.respuestas.map((respuesta, index) => (
          <div
            key={index}
            className="card mb-3"
          >
            <div className="card-body">
              <h5 className="card-title">Alumno: {respuesta.alumno?.name}</h5>
              <p className="card-text">
                <strong>Email:</strong> {respuesta.alumno?.email}
              </p>

              <h6>Respuestas:</h6>
              {respuesta.respuestas.map((r, i) => {
                // Buscar la pregunta original en la lista de preguntas del examen
                const preguntaOriginal = examen.preguntas.find(
                  (p) => p._id === r.preguntaId
                );

                return (
                  <div
                    key={i}
                    className="mb-3 border p-3 rounded bg-light"
                  >
                    <p>
                      <strong>Pregunta:</strong>{" "}
                      {preguntaOriginal?.texto || "⚠️ Pregunta no encontrada"}
                    </p>

                    {/* Mostrar opciones en preguntas de opción múltiple */}
                    {preguntaOriginal?.tipo === "multiple-choice" ? (
                      <>
                        <p>
                          <strong>Opciones:</strong>
                        </p>
                        <ul>
                          {preguntaOriginal.opciones.map((opcion, idx) => (
                            <li
                              key={idx}
                              style={{
                                fontWeight:
                                  r.respuestaTexto === opcion.texto
                                    ? "bold"
                                    : "normal",
                                color:
                                  r.respuestaTexto === opcion.texto
                                    ? "green"
                                    : "black",
                              }}
                            >
                              {opcion.texto}{" "}
                              {r.respuestaTexto === opcion.texto &&
                                "✅ (Seleccionado por el alumno)"}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p>
                        <strong>Respuesta:</strong> {r.respuestaTexto || "N/A"}
                      </p>
                    )}

                    <p>
                      <strong>Puntaje máximo:</strong>{" "}
                      {preguntaOriginal?.puntuacion || "No especificado"}
                    </p>

                    <label>Puntaje asignado:</label>
                    <input
                      type="number"
                      min="0"
                      max={preguntaOriginal?.puntuacion || 10}
                      className="form-control"
                      placeholder="Puntaje"
                      value={r.puntuacionObtenida || 0}
                      onChange={(e) =>
                        setExamen((prev) => ({
                          ...prev,
                          respuestas: prev.respuestas.map((resp, idx) =>
                            idx === index
                              ? {
                                  ...resp,
                                  respuestas: resp.respuestas.map((ans, j) =>
                                    j === i
                                      ? {
                                          ...ans,
                                          puntuacionObtenida: Number(
                                            e.target.value
                                          ),
                                        }
                                      : ans
                                  ),
                                }
                              : resp
                          ),
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CorregirExamen;

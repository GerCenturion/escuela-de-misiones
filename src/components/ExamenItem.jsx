import React, { useState } from "react";

const ExamenItem = ({ respuesta, examen, index, enviarCorrecciones }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="card mb-3">
      <div className="card-body">
        {/* 🔹 Encabezado con nombre del alumno y estado */}
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title">Alumno: {respuesta.alumno?.name}</h5>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? "🔼 Ocultar Respustas" : "🔽 Mostrar Respuestas"}
          </button>
        </div>
        <p className="card-text">
          <strong>Email:</strong> {respuesta.alumno?.email}
        </p>

        {/* 🔹 Estado del examen */}
        {respuesta.corregido && !expandido ? (
          <div className="alert alert-success d-flex justify-content-between align-items-center">
            <div>
              <h5>✅ Examen corregido</h5>
              <p>
                <strong>Nota obtenida:</strong> {respuesta.totalPuntuacion} / 10
              </p>
            </div>
            <button
              className="btn btn-warning btn-sm"
              onClick={() => setExpandido(true)}
            >
              Revisar
            </button>
          </div>
        ) : null}

        {/* 🔹 Respuestas (se muestran al expandir) */}
        {expandido && (
          <>
            <h6>Respuestas:</h6>
            {respuesta.respuestas.map((r, i) => {
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

                  {/* 🔊 Pregunta de audio */}
                  {preguntaOriginal?.tipo === "audio" ? (
                    r.respuestaAudioUrl ? (
                      <div>
                        <strong>Respuesta en audio:</strong>
                        <audio
                          controls
                          src={r.respuestaAudioUrl}
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <p>
                        <strong>Respuesta:</strong> ❌ No se envió un archivo de
                        audio.
                      </p>
                    )
                  ) : preguntaOriginal?.tipo === "multiple-choice" ? (
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
                                r.opcionSeleccionada === opcion._id ||
                                r.respuestaTexto === opcion.texto
                                  ? "bold"
                                  : "normal",
                              color:
                                r.opcionSeleccionada === opcion._id ||
                                r.respuestaTexto === opcion.texto
                                  ? "green"
                                  : "black",
                            }}
                          >
                            {opcion.texto}{" "}
                            {(r.opcionSeleccionada === opcion._id ||
                              r.respuestaTexto === opcion.texto) &&
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
                      enviarCorrecciones(
                        respuesta.alumno._id,
                        respuesta.respuestas,
                        i,
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              );
            })}

            <button
              className="btn btn-success mt-3"
              onClick={() =>
                enviarCorrecciones(respuesta.alumno._id, respuesta.respuestas)
              }
            >
              Enviar Correcciones
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamenItem;

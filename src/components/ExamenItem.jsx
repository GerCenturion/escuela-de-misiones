import React, { useState } from "react";

const ExamenItem = ({ respuesta, examen, index, enviarCorrecciones }) => {
  const [expandido, setExpandido] = useState(false);

  // Estado de correcciones basado en las respuestas actuales
  const [correcciones, setCorrecciones] = useState(
    respuesta.respuestas.map((r) => ({
      preguntaId: r.preguntaId.toString(),
      estado: r.estado || "pendiente", // Estado inicial
    }))
  );

  // Función para actualizar el estado de la corrección
  const actualizarCorreccion = (preguntaId, nuevoEstado) => {
    setCorrecciones((prevCorrecciones) =>
      prevCorrecciones.map((c) =>
        c.preguntaId === preguntaId ? { ...c, estado: nuevoEstado } : c
      )
    );
  };

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
            {expandido ? "🔼 Contraer" : "🔽 Expandir"}
          </button>
        </div>
        <p className="card-text">
          <strong>Email:</strong> {respuesta.alumno?.email}
        </p>

        {/* 🔹 Estado general del examen */}
        <p>
          <strong>Estado del Examen:</strong>{" "}
          {respuesta.estado === "aprobado"
            ? "✔️ Aprobado"
            : respuesta.estado === "rehacer"
            ? "❌ Rehacer"
            : "⏳ Pendiente"}
        </p>

        {/* 🔹 Secciones de Respuestas (Expandibles) */}
        {expandido && (
          <>
            <h6>Respuestas:</h6>
            {respuesta.respuestas.map((r, i) => {
              const preguntaOriginal = examen.preguntas.find(
                (p) => p._id.toString() === r.preguntaId.toString()
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

                  {/* 🔹 Estado de la respuesta */}
                  <p>
                    <strong>Estado:</strong>{" "}
                    {correcciones.find((c) => c.preguntaId === r.preguntaId)
                      ?.estado === "aprobado"
                      ? "✔️ Aprobado"
                      : correcciones.find((c) => c.preguntaId === r.preguntaId)
                          ?.estado === "rehacer"
                      ? "❌ Rehacer"
                      : "⏳ Pendiente"}
                  </p>

                  {/* 🔹 Botones de Corrección */}
                  <button
                    className={`btn ${
                      correcciones.find((c) => c.preguntaId === r.preguntaId)
                        ?.estado === "aprobado"
                        ? "btn-success"
                        : "btn-outline-success"
                    } me-2`}
                    onClick={() =>
                      actualizarCorreccion(r.preguntaId, "aprobado")
                    }
                  >
                    ✔️ Bien
                  </button>
                  <button
                    className={`btn ${
                      correcciones.find((c) => c.preguntaId === r.preguntaId)
                        ?.estado === "rehacer"
                        ? "btn-danger"
                        : "btn-outline-danger"
                    }`}
                    onClick={() =>
                      actualizarCorreccion(r.preguntaId, "rehacer")
                    }
                  >
                    ❌ Rehacer
                  </button>
                </div>
              );
            })}

            {/* 🔹 Botón para enviar correcciones */}
            <button
              className="btn btn-success mt-3"
              onClick={() =>
                enviarCorrecciones(respuesta.alumno._id, correcciones)
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

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ExamenCompletar = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [yaRespondido, setYaRespondido] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const verificarSiYaRespondio = async () => {
      try {
        console.log("🔍 Verificando si el alumno ya completó el examen...");
        const response = await fetch(
          `${API_URL}/examenes/${examenId}/completado`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("No se pudo verificar el estado del examen");
        }

        const data = await response.json();
        console.log("🟢 Estado del examen:", data);
        setYaRespondido(data.yaRespondido);
      } catch (error) {
        console.error("❌ Error al verificar el examen:", error);
      }
    };

    const fetchExamen = async () => {
      try {
        console.log("🟢 Solicitando examen con ID:", examenId);
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
        console.error("❌ Error al obtener el examen:", error);
      } finally {
        setLoading(false);
      }
    };

    if (examenId) {
      verificarSiYaRespondio();
      fetchExamen();
    }
  }, [examenId, token]);

  const manejarCambio = (preguntaId, valor, tipo) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]:
        tipo === "multiple-choice"
          ? { respuestaTexto: valor } // 📌 Guardamos el texto de la opción seleccionada
          : { respuestaTexto: valor },
    }));
  };

  const enviarRespuestas = async () => {
    if (!examen || yaRespondido) {
      alert("No puedes responder este examen nuevamente.");
      return;
    }

    // 📌 Validar que todas las respuestas están completas
    const todasRespondidas = examen.preguntas.every(
      (pregunta) =>
        respuestas[pregunta._id] && respuestas[pregunta._id].respuestaTexto
    );

    if (!todasRespondidas) {
      alert("Debes responder todas las preguntas antes de enviar.");
      return;
    }

    try {
      const formattedRespuestas = Object.entries(respuestas).map(
        ([preguntaId, respuesta]) => ({
          preguntaId,
          ...respuesta, // Contiene `respuestaTexto`
        })
      );

      console.log("🟢 Enviando respuestas:", formattedRespuestas);

      const response = await fetch(
        `${API_URL}/examenes/${examenId}/responder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ respuestas: formattedRespuestas }),
        }
      );

      if (!response.ok) throw new Error("Error al enviar respuestas");

      alert("Respuestas enviadas con éxito");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error al enviar respuestas:", error);
      alert("Hubo un problema al enviar las respuestas.");
    }
  };

  if (loading) {
    return <p>Cargando examen...</p>;
  }

  if (!examen) {
    return <p>Error al cargar el examen. Verifica la consola.</p>;
  }

  // Extraer información de la corrección si existe
  const respuestaAlumno = examen.respuestas?.[0] || {};
  const estaCorregido = respuestaAlumno.corregido || false;
  const totalPuntuacion = respuestaAlumno.totalPuntuacion ?? "Pendiente";

  // Determinar el estado del examen
  let mensajeNota = "🕒 Esperando corrección...";
  let colorTexto = "text-primary"; // Azul para corrección pendiente

  if (estaCorregido) {
    if (totalPuntuacion > 5) {
      mensajeNota = `✅ Tu nota es: ${totalPuntuacion}`;
      colorTexto = "text-success"; // Verde si aprobó
    } else {
      mensajeNota = `❌ Tu nota es: ${totalPuntuacion}`;
      colorTexto = "text-danger"; // Rojo si desaprobó
    }
  }

  return (
    <div className="container mt-4">
      <h2>{examen.titulo}</h2>
      <p>Materia: {examen.materia?.name || "No especificada"}</p>

      {yaRespondido ? (
        <div className="alert alert-info">
          <p>Ya has completado este examen. No puedes volver a responderlo.</p>
          <h4 className={colorTexto}>{mensajeNota}</h4>
        </div>
      ) : (
        <form>
          {examen.preguntas.map((pregunta) => (
            <div
              key={pregunta._id}
              className="mb-3"
            >
              <label className="form-label">
                {pregunta.texto}{" "}
                <strong>(Puntos: {pregunta.puntuacion})</strong>
              </label>
              {pregunta.tipo === "multiple-choice" ? (
                <div>
                  {pregunta.opciones.map((opcion) => (
                    <div
                      key={opcion._id}
                      className="form-check"
                    >
                      <input
                        type="radio"
                        id={`opcion-${opcion._id}`}
                        name={`pregunta-${pregunta._id}`}
                        value={opcion.texto}
                        className="form-check-input"
                        onChange={(e) =>
                          manejarCambio(
                            pregunta._id,
                            e.target.value,
                            "multiple-choice"
                          )
                        }
                      />
                      <label
                        htmlFor={`opcion-${opcion._id}`}
                        className="form-check-label"
                      >
                        {opcion.texto}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  value={respuestas[pregunta._id]?.respuestaTexto || ""}
                  onChange={(e) =>
                    manejarCambio(pregunta._id, e.target.value, "desarrollo")
                  }
                />
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn-primary"
            onClick={enviarRespuestas}
          >
            Enviar Respuestas
          </button>
        </form>
      )}
    </div>
  );
};

export default ExamenCompletar;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMicrophone, FaStop, FaTrash } from "react-icons/fa";

const ExamenCompletar = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [grabaciones, setGrabaciones] = useState({});
  const [mediaRecorder, setMediaRecorder] = useState(null);
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
          ? { opcionSeleccionada: valor }
          : { respuestaTexto: valor },
    }));
  };

  const iniciarGrabacion = async (preguntaId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (event) => chunks.push(event.data);

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        setGrabaciones((prev) => ({
          ...prev,
          [preguntaId]: audioUrl,
        }));

        setRespuestas((prev) => ({
          ...prev,
          [preguntaId]: { respuestaAudio: audioBlob },
        }));
      };

      recorder.start();
      setMediaRecorder({ recorder, preguntaId });
    } catch (error) {
      console.error("❌ Error al acceder al micrófono:", error);
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorder?.recorder) {
      mediaRecorder.recorder.stop();
      setMediaRecorder(null);
    }
  };

  const eliminarGrabacion = (preguntaId) => {
    setGrabaciones((prev) => {
      const nuevoEstado = { ...prev };
      delete nuevoEstado[preguntaId];
      return nuevoEstado;
    });

    setRespuestas((prev) => {
      const nuevoEstado = { ...prev };
      delete nuevoEstado[preguntaId];
      return nuevoEstado;
    });
  };

  const enviarRespuestas = async () => {
    if (!examen || yaRespondido) {
      alert("No puedes responder este examen nuevamente.");
      return;
    }

    // 📌 Validar fecha límite
    if (new Date(examen.fechaLimite) < new Date()) {
      alert("La fecha límite ha pasado. No puedes completar este examen.");
      return;
    }

    // 📌 Validar que todas las respuestas están completas
    const todasRespondidas = examen.preguntas.every((pregunta) => {
      if (pregunta.tipo === "audio") {
        return (
          respuestas[pregunta._id] &&
          respuestas[pregunta._id].respuestaAudio !== undefined
        );
      }

      if (pregunta.tipo === "multiple-choice") {
        return (
          respuestas[pregunta._id] &&
          respuestas[pregunta._id].opcionSeleccionada !== undefined
        );
      }

      return (
        respuestas[pregunta._id] &&
        respuestas[pregunta._id].respuestaTexto !== undefined &&
        respuestas[pregunta._id].respuestaTexto.trim() !== ""
      );
    });

    if (!todasRespondidas) {
      alert("Debes responder todas las preguntas antes de enviar.");
      return;
    }

    const formData = new FormData();
    const formattedRespuestas = [];

    examen.preguntas.forEach((pregunta) => {
      const respuesta = respuestas[pregunta._id];

      const respuestaFormateada = {
        preguntaId: pregunta._id, // ✅ Asegurar que preguntaId esté presente
        respuestaTexto: respuesta?.respuestaTexto || "",
        opcionSeleccionada: respuesta?.opcionSeleccionada || null,
      };

      if (pregunta.tipo === "audio" && respuesta?.respuestaAudio) {
        formData.append("archivoAudio", respuesta.respuestaAudio);
        respuestaFormateada.respuestaAudio = "archivoAudio";
      }

      formattedRespuestas.push(respuestaFormateada);
    });

    formData.append("respuestas", JSON.stringify(formattedRespuestas));

    try {
      console.log("🟢 Enviando respuestas:", formattedRespuestas);

      const response = await fetch(
        `${API_URL}/examenes/${examenId}/responder`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // FormData maneja el Content-Type automáticamente
          body: formData,
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

  return (
    <div className="container mt-4">
      <h2>{examen.titulo}</h2>
      <p>Materia: {examen.materia?.name || "No especificada"}</p>

      <form>
        {examen.preguntas.map((pregunta) => (
          <div
            key={pregunta._id}
            className="mb-3"
          >
            <label className="form-label">
              {pregunta.texto} <strong>(Puntos: {pregunta.puntuacion})</strong>
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
                      name={`pregunta-${pregunta._id}`}
                      value={opcion._id}
                      className="form-check-input"
                      onChange={(e) =>
                        manejarCambio(
                          pregunta._id,
                          e.target.value,
                          "multiple-choice"
                        )
                      }
                    />
                    <label className="form-check-label">{opcion.texto}</label>
                  </div>
                ))}
              </div>
            ) : pregunta.tipo === "audio" ? (
              <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => iniciarGrabacion(pregunta._id)}
                >
                  <FaMicrophone />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={detenerGrabacion}
                >
                  <FaStop />
                </button>
                {grabaciones[pregunta._id] && (
                  <>
                    <audio
                      controls
                      src={grabaciones[pregunta._id]}
                      className="mx-2"
                    />
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() => eliminarGrabacion(pregunta._id)}
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <input
                type="text"
                className="form-control"
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
    </div>
  );
};

export default ExamenCompletar;

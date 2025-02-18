import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMicrophone, FaStop, FaTrash } from "react-icons/fa";
import Spinner from "../components/Spinner";

const ExamenCompletar = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const [yaRespondido, setYaRespondido] = useState(false);
  const [respuestas, setRespuestas] = useState({});
  const [grabaciones, setGrabaciones] = useState({});
  const [grabandoPregunta, setGrabandoPregunta] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const [puntos, setPuntos] = useState("");
  const cronometroRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamen = async () => {
      try {
        console.log("📡 Solicitando examen con ID:", examenId);
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
      }
    };

    fetchExamen();
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
    if (grabandoPregunta) return; // ✅ Evita múltiples grabaciones simultáneas

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream; // ✅ Guardar referencia al stream

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      let chunks = [];

      recorder.ondataavailable = (event) => chunks.push(event.data);

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        setGrabaciones((prev) => ({ ...prev, [preguntaId]: audioUrl }));
        setRespuestas((prev) => ({
          ...prev,
          [preguntaId]: { respuestaAudio: audioBlob },
        }));

        setGrabandoPregunta(null);
        setTiempoGrabacion(0);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabandoPregunta(preguntaId);
      setTiempoGrabacion(0);
      cronometroRef.current = setInterval(() => {
        setTiempoGrabacion((prev) => prev + 1);
        setPuntos((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 1000);
    } catch (error) {
      console.error("❌ Error al acceder al micrófono:", error);
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      clearInterval(cronometroRef.current);
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

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${segundosRestantes
      .toString()
      .padStart(2, "0")}`;
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

    setIsSubmitting(true);

    const formData = new FormData();
    const formattedRespuestas = [];
    let archivosAudio = [];

    examen.preguntas.forEach((pregunta) => {
      const respuesta = respuestas[pregunta._id];

      const respuestaFormateada = {
        preguntaId: pregunta._id,
        respuestaTexto: respuesta?.respuestaTexto || "",
        opcionSeleccionada: respuesta?.opcionSeleccionada || null,
      };

      // 📌 Si la pregunta es de tipo "audio", agregar archivo con nombre correcto
      if (pregunta.tipo === "audio" && respuesta?.respuestaAudio) {
        archivosAudio.push({
          archivo: respuesta.respuestaAudio,
          nombre: `audio_${pregunta._id}.webm`,
        });
      }

      formattedRespuestas.push(respuestaFormateada);
    });

    // 📌 Agregar respuestas JSON al formData
    formData.append("respuestas", JSON.stringify(formattedRespuestas));

    // 📌 Agregar archivos de audio con la clave correcta y nombre correcto
    archivosAudio.forEach(({ archivo, nombre }) => {
      formData.append("archivoAudio", archivo, nombre);
    });

    try {
      console.log("🟢 Enviando respuestas:", formattedRespuestas);
      console.log("🟢 Enviando archivos de audio:", archivosAudio);

      const response = await fetch(
        `${API_URL}/examenes/${examenId}/responder`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // 📌 NO agregar `Content-Type`
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al enviar respuestas");

      alert("Respuestas enviadas con éxito");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error al enviar respuestas:", error);
      alert("Hubo un problema al enviar las respuestas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!examen) {
    return <Spinner />;
  }

  return (
    <div className="container mt-4">
      {isSubmitting && (
        <div className="spinner-overlay">
          <Spinner />
        </div>
      )}
      <h2>{examen.titulo}</h2>
      <p>Materia: {examen.materia?.name || "No especificada"}</p>

      <form>
        {examen.preguntas.map((pregunta) => (
          <div
            key={pregunta._id}
            className="mb-3"
          >
            <label className="form-label">{pregunta.texto}</label>

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
                        setRespuestas((prev) => ({
                          ...prev,
                          [pregunta._id]: {
                            opcionSeleccionada: e.target.value,
                          },
                        }))
                      }
                    />
                    <label className="form-check-label">{opcion.texto}</label>
                  </div>
                ))}
              </div>
            ) : pregunta.tipo === "audio" ? (
              <div>
                {grabandoPregunta === pregunta._id ? (
                  <div className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={detenerGrabacion}
                    >
                      <FaStop /> Detener
                    </button>
                    <span className="ms-2">
                      {formatearTiempo(tiempoGrabacion)}
                    </span>
                    <FaMicrophone
                      className="text-danger me-2"
                      size={20}
                    />
                    <span className="fw-bold text-danger">
                      Grabando{puntos}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => iniciarGrabacion(pregunta._id)}
                  >
                    <FaMicrophone /> Grabar
                  </button>
                )}
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
                  setRespuestas((prev) => ({
                    ...prev,
                    [pregunta._id]: { respuestaTexto: e.target.value },
                  }))
                }
              />
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-primary"
          disabled={isSubmitting}
          onClick={() => {
            if (grabandoPregunta) detenerGrabacion();
            enviarRespuestas();
          }}
        >
          {isSubmitting ? <Spinner /> : "Enviar Respuestas"}
        </button>
      </form>
    </div>
  );
};

export default ExamenCompletar;

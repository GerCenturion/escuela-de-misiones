import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMicrophone, FaStop, FaTrash } from "react-icons/fa";

const RehacerExamen = ({ API_URL, token }) => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [respuestas, setRespuestas] = useState({});
  const [grabaciones, setGrabaciones] = useState({});
  const [grabandoPregunta, setGrabandoPregunta] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamen = async () => {
      try {
        console.log(`📡 Solicitando examen a rehacer: ${examenId}`);
        const response = await fetch(
          `${API_URL}/examenes/${examenId}/rehacer`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Error al obtener el examen: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("🟢 Examen a rehacer obtenido:", data);
        setExamen(data);
      } catch (error) {
        console.error("❌ Error al obtener el examen:", error);
      }
    };

    fetchExamen();
  }, [examenId, API_URL, token]);

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
    if (grabandoPregunta) return;

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

        setGrabandoPregunta(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder; // 🔹 Guardar la referencia del MediaRecorder
      setGrabandoPregunta(preguntaId);
    } catch (error) {
      console.error("❌ Error al acceder al micrófono:", error);
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // ✅ Ahora sí detiene correctamente
      mediaRecorderRef.current = null;
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
    if (!examen) {
      alert("No se puede enviar el examen.");
      return;
    }

    const formData = new FormData();
    const respuestasAEnviar = [];

    examen.preguntas.forEach((pregunta) => {
      const respuesta = respuestas[pregunta._id];

      if (respuesta) {
        const respuestaFormateada = {
          preguntaId: pregunta._id,
          respuestaTexto: respuesta.respuestaTexto || "",
          opcionSeleccionada: respuesta.opcionSeleccionada || null,
        };

        if (pregunta.tipo === "audio" && respuesta.respuestaAudio) {
          formData.append("archivoAudio", respuesta.respuestaAudio);
          respuestaFormateada.respuestaAudio = "archivoAudio";
        }

        respuestasAEnviar.push(respuestaFormateada);
      }
    });

    formData.append("respuestas", JSON.stringify(respuestasAEnviar));

    try {
      console.log("🟢 Enviando respuestas corregidas:", respuestasAEnviar);

      const response = await fetch(
        `${API_URL}/examenes/${examenId}/enviar-revision`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Error al enviar respuestas");

      alert("Respuestas corregidas enviadas con éxito");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error al enviar respuestas:", error);
      alert("Hubo un problema al enviar las respuestas.");
    }
  };

  if (!examen) {
    return <p>Cargando examen para rehacer...</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Rehacer Examen: {examen.titulo}</h2>
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
                {grabandoPregunta !== pregunta._id ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => iniciarGrabacion(pregunta._id)}
                  >
                    <FaMicrophone /> Grabar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={detenerGrabacion}
                  >
                    <FaStop /> Detener
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
          Enviar Correcciones
        </button>
      </form>
    </div>
  );
};

export default RehacerExamen;

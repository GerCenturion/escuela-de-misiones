import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExamenItem from "../components/ExamenItem";
import Spinner from "../components/Spinner";

const CorregirExamen = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const navigate = useNavigate();
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
  }, [examenId, token, API_URL]);

  const enviarCorrecciones = async (alumnoId, respuestas) => {
    try {
      const correcciones = respuestas.map((r) => ({
        preguntaId: r.preguntaId,
        estado: r.estado, // "aprobado" o "rehacer"
      }));

      console.log("📤 Enviando correcciones:", correcciones);

      const response = await fetch(
        `${API_URL}/examenes/${examenId}/corregir/${alumnoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ correcciones }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la respuesta del servidor: ${errorText}`);
      }

      alert("✅ Correcciones enviadas con éxito.");
      window.location.reload();
    } catch (error) {
      console.error("❌ Error al enviar correcciones:", error);
      alert("Hubo un problema al enviar las correcciones.");
    }
  };

  // 📱 Función que abre la App móvil en celulares o WhatsApp Web en PC
  const abrirWhatsAppAlumno = (alumno) => {
    if (!alumno) {
      alert("No se encontró información del alumno.");
      return;
    }

    const cleanCode = (alumno.phoneCode || "").toString().replace(/\D/g, "");
    const cleanArea = (alumno.phoneArea || "").toString().replace(/\D/g, "").replace(/^0+/, "");
    const cleanNumber = (alumno.phoneNumber || "").toString().replace(/\D/g, "").replace(/^15/, "");

    let numeroCompleto = "";

    if (cleanCode && cleanNumber) {
      if (cleanCode === "54") {
        // En Argentina WhatsApp requiere 549 + código de área sin 0 + número sin 15
        numeroCompleto = `549${cleanArea}${cleanNumber}`;
      } else {
        numeroCompleto = `${cleanCode}${cleanArea}${cleanNumber}`;
      }
    } else {
      const ingresado = prompt(
        `El alumno ${alumno.name || ""} no tiene un teléfono completo registrado.\nIngresa el número con código de país para abrir WhatsApp:`
      );
      if (!ingresado) return;
      numeroCompleto = ingresado.replace(/\D/g, "");
    }

    const mensaje = encodeURIComponent(
      `Hola ${alumno.name || ""}, te contacto de la materia "${examen?.materia?.name || ""}" por tu entrega en la tarea/examen: "${examen?.titulo || ""}". Quería hacerte unas correcciones y observaciones al respecto.`
    );

    // Detectar si el profesor/admin está navegando desde un celular
    const esDispositivoMovil = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (esDispositivoMovil) {
      // Abre directamente la aplicación nativa instalada en el celular
      window.location.href = `https://api.whatsapp.com/send?phone=${numeroCompleto}&text=${mensaje}`;
    } else {
      // En PC abre WhatsApp Web o la app de escritorio
      window.open(
        `https://web.whatsapp.com/send?phone=${numeroCompleto}&text=${mensaje}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  if (!examen) {
    return <Spinner />;
  }

  return (
    <div className="container mt-4">
      <h2>Corregir Examen: {examen.titulo}</h2>
      <p>
        <strong>Materia:</strong> {examen.materia?.name}
      </p>
      <p>
        <strong>Profesor:</strong> {examen.profesor?.name} ({examen.profesor?.email})
      </p>

      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate(`/professor/materias/${examen?.materia?._id}`)}
      >
        Volver
      </button>

      {examen.respuestas.length === 0 ? (
        <p>No hay respuestas para este examen.</p>
      ) : (
        examen.respuestas.map((respuesta, index) => (
          <div key={index} className="card mb-4 border shadow-sm">
            {/* Barra superior con botón que se adapta a Celular (App) o PC (Web) */}
            <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2 py-3">
              <div>
                <h5 className="mb-1 text-primary">
                  Tarea de: {respuesta.alumno?.name || "Alumno sin nombre"}
                </h5>
                <span className="text-muted small">
                  {respuesta.alumno?.email || "Sin email"}
                  {respuesta.alumno?.phoneNumber &&
                    ` | Tel: +${respuesta.alumno?.phoneCode || ""} ${respuesta.alumno?.phoneArea || ""} ${respuesta.alumno?.phoneNumber}`}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-success d-flex align-items-center gap-2 fw-semibold px-3 py-2 shadow-sm"
                onClick={() => abrirWhatsAppAlumno(respuesta.alumno)}
                title="Contactar al alumno por WhatsApp"
              >
                {/* Ícono de WhatsApp SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.016-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.861.114-.944-.05-.084-.182-.133-.38-.232z" />
                </svg>
                Enviar WhatsApp
              </button>
            </div>

            <div className="card-body">
              <ExamenItem
                respuesta={respuesta}
                examen={examen}
                index={index}
                enviarCorrecciones={enviarCorrecciones}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CorregirExamen;
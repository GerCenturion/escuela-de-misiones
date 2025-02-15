import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExamenItem from "../components/ExamenItem";

const CorregirExamen = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const navigate = useNavigate();
  const [modoRevision, setModoRevision] = useState(false);
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

  const enviarCorrecciones = async (alumnoId, respuestas) => {
    try {
      console.log("📤 Enviando correcciones para el alumno:", alumnoId);
      const response = await fetch(
        `${API_URL}/examenes/${examenId}/corregir/${alumnoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ respuestas }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar las correcciones.");
      }

      alert("✅ Correcciones enviadas con éxito.");
      setModoRevision(false); // Salir del modo revisión
      window.location.reload(); // 🔄 Recargar la página para ver los cambios
    } catch (error) {
      console.error("❌ Error al enviar correcciones:", error);
      alert("Hubo un problema al enviar las correcciones.");
    }
  };

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
          <ExamenItem
            key={index}
            respuesta={respuesta}
            examen={examen}
            index={index}
            enviarCorrecciones={enviarCorrecciones}
          />
        ))
      )}
    </div>
  );
};

export default CorregirExamen;

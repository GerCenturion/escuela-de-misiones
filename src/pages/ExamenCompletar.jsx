import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ExamenCompletar = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamen = async () => {
      if (!examenId) {
        console.error("❌ Error: `examenId` no válido.");
        return;
      }

      console.log("🟢 Solicitando examen con ID:", examenId);

      try {
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
        setLoading(false);
      } catch (error) {
        console.error("❌ Error al obtener el examen:", error);
        setLoading(false);
      }
    };

    fetchExamen();
  }, [examenId, token]);

  const manejarCambio = (preguntaId, respuestaTexto) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: respuestaTexto,
    }));
  };

  const enviarRespuestas = async () => {
    if (!examen) {
      alert("No se ha cargado el examen correctamente.");
      return;
    }

    try {
      const formattedRespuestas = Object.entries(respuestas).map(
        ([preguntaId, respuestaTexto]) => ({
          preguntaId,
          respuestaTexto,
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
            <label className="form-label">{pregunta.texto}</label>
            <input
              type="text"
              className="form-control"
              value={respuestas[pregunta._id] || ""}
              onChange={(e) => manejarCambio(pregunta._id, e.target.value)}
            />
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

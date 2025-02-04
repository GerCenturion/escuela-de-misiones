// src/components/ExamenRevisar.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ExamenRevisar = () => {
  const { examenId } = useParams();
  const [examen, setExamen] = useState(null);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamen = async () => {
      try {
        console.log(`📡 Solicitando revisión del examen: ${examenId}`);
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
        setError(error.message);
        console.error(error);
      }
    };

    fetchExamen();
  }, [examenId, token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!examen) {
    return <div className="text-center">Cargando revisión del examen...</div>;
  }

  return (
    <div className="container mt-5">
      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        Volver
      </button>
      <h1>Revisión del Examen: {examen.titulo}</h1>
      <h3>
        Nota Final: {examen.respuestas[0]?.totalPuntuacion ?? "Pendiente"} / 10
      </h3>

      <h2 className="mt-4">Preguntas y Puntos Obtenidos</h2>
      <ul className="list-group">
        {examen.preguntas.map((pregunta, index) => {
          const respuestaAlumno = examen.respuestas[0]?.respuestas.find(
            (r) => r.preguntaId === pregunta._id
          );
          return (
            <li
              key={index}
              className="list-group-item"
            >
              <strong>{pregunta.texto}</strong>
              <p>
                Respuesta del alumno:{" "}
                {respuestaAlumno?.respuestaTexto ?? "No respondida"}
              </p>
              <span className="badge bg-info">
                Puntos: {respuestaAlumno?.puntuacionObtenida ?? 0} /{" "}
                {pregunta.puntuacion}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ExamenRevisar;

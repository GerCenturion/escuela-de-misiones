import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

const ExamenesListModal = ({ materiaId, onClose }) => {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamenes = async () => {
      try {
        const response = await fetch(`${API_URL}/examenes/${materiaId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los exámenes");
        }

        const data = await response.json();

        // Obtener cantidad de exámenes pendientes de corrección por cada examen
        const examenesConPendientes = await Promise.all(
          data.map(async (examen) => {
            const res = await fetch(
              `${API_URL}/examenes/${examen._id}/respuestas`,
              {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!res.ok) return { ...examen, pendientesCorreccion: 0 };

            const respuestas = await res.json();

            // Contar respuestas con estado "pendiente" o "rehacer"
            const pendientesCorreccion = respuestas.filter(
              (r) => r.estado === "realizado"
            ).length;

            return { ...examen, pendientesCorreccion };
          })
        );

        setExamenes(examenesConPendientes);
      } catch (error) {
        console.error("Error al obtener exámenes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamenes();
  }, [materiaId, token]);

  const eliminarExamen = async (examenId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este examen?"))
      return;

    try {
      const response = await fetch(`${API_URL}/examenes/${examenId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar el examen");

      alert("Examen eliminado con éxito");
      setExamenes((prevExamenes) =>
        prevExamenes.filter((examen) => examen._id !== examenId)
      );
    } catch (error) {
      console.error("Error al eliminar examen:", error);
      alert("No se pudo eliminar el examen.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lista de Exámenes</h2>
      {loading ? (
        <Spinner />
      ) : examenes.length > 0 ? (
        <ul className="list-group">
          {examenes.map((examen) => (
            <li
              key={examen._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h5>{examen.titulo || `Examen #${examen._id}`}</h5>
                <p>
                  <strong>Fecha Límite:</strong>{" "}
                  {new Date(examen.fechaLimite).toLocaleDateString() ||
                    "No especificada"}
                </p>
                <p>
                  <strong>Pendientes de Corrección:</strong>{" "}
                  {examen.pendientesCorreccion}
                </p>
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => navigate(`/corregir/${examen._id}`)}
                >
                  Corregir ({examen.pendientesCorreccion})
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => eliminarExamen(examen._id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay exámenes disponibles.</p>
      )}
    </div>
  );
};

export default ExamenesListModal;

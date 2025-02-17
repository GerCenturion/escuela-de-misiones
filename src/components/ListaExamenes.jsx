import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RehacerExamen from "../pages/RehacerExamen";
import Spinner from "./Spinner";

const ListaExamenes = ({ examenes, API_URL, token }) => {
  const [estadoExamenes, setEstadoExamenes] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);
  const navigate = useNavigate();

  // ✅ Obtener usuarioId desde el backend
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        console.log("📡 Solicitando datos del usuario...");
        const response = await fetch(`${API_URL}/usuarios/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener usuario: ${response.status}`);
        }

        const data = await response.json();
        console.log("🟢 Usuario obtenido:", data);
        setUsuarioId(data._id);
      } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
      }
    };

    fetchUsuario();
  }, [API_URL, token]);

  // ✅ Obtener estados de los exámenes
  useEffect(() => {
    if (!usuarioId) {
      console.warn("⚠️ Esperando usuarioId...");
      return;
    }

    const fetchEstadoExamen = async (examenId) => {
      try {
        console.log(`📡 Solicitando estado del examen: ${examenId}`);

        const response = await fetch(
          `${API_URL}/examenes/${examenId}/estado-detallado/${usuarioId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Error al cargar estado: ${response.status}`);
        }

        const data = await response.json();
        console.log("🟢 Estado del examen obtenido:", data);

        let botonTexto = "⏳ Pendiente - Realizar Examen";
        let botonClase = "btn btn-secondary";
        let accionBoton = () => navigate(`/examen/${examenId}`);
        let botonDeshabilitado = false;

        if (data.completado) {
          if (data.corregido) {
            if (data.estadoGeneral === "aprobado") {
              botonTexto = "✔️ Aprobado - Ver Examen";
              botonClase = "btn btn-success";
              accionBoton = () =>
                navigate(`/revisar-examen/${examenId}`, {
                  state: { usuarioId, token },
                });
            } else if (data.estadoGeneral === "rehacer") {
              botonTexto = "❌ Rehacer - Examen Incorrecto";
              botonClase = "btn btn-danger";
              accionBoton = () => navigate(`/examen/${examenId}/rehacer`);
            }
          } else {
            botonTexto = "🕒 Pendiente de Corrección";
            botonClase = "btn btn-warning text-dark";
            botonDeshabilitado = true;
          }
        }

        setEstadoExamenes((prev) => ({
          ...prev,
          [examenId]: {
            botonTexto,
            botonClase,
            accionBoton,
            botonDeshabilitado,
            fechaLimite: data.fechaLimite || "No especificada",
          },
        }));
      } catch (error) {
        console.error("❌ Error al obtener estado del examen:", error);
      }
    };

    examenes.forEach((examen) => {
      fetchEstadoExamen(examen._id);
    });
  }, [examenes, API_URL, token, usuarioId]);

  if (!usuarioId) {
    return <Spinner />;
  }

  return (
    <div>
      <h2 className="mt-4">Exámenes</h2>
      {examenes.length > 0 ? (
        <ul className="list-group">
          {examenes.map((examen) => {
            const estado = estadoExamenes[examen._id] || {};

            return (
              <li
                key={examen._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5>{examen.titulo}</h5>
                  <p>
                    <strong>Fecha Límite:</strong>{" "}
                    {estado.fechaLimite
                      ? new Date(estado.fechaLimite).toLocaleDateString(
                          "es-AR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          }
                        )
                      : "No especificada"}
                  </p>
                </div>

                {/* Único botón dinámico */}
                <button
                  className={estado.botonClase}
                  onClick={estado.accionBoton}
                  disabled={estado.botonDeshabilitado}
                >
                  {estado.botonTexto}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No hay exámenes disponibles.</p>
      )}
    </div>
  );
};

export default ListaExamenes;

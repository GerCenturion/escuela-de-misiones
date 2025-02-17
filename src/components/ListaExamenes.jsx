import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

        let estadoTexto = "⏳ Pendiente";
        let estadoClase = "badge bg-secondary";
        let estadoBoton = "Realizar Examen";
        let accionBoton = () => navigate(`/examen/${examenId}`);
        let botonDeshabilitado = false;

        if (data.completado) {
          if (data.corregido) {
            if (data.estadoGeneral === "aprobado") {
              estadoTexto = "✔️ Aprobado";
              estadoClase = "badge bg-success";
              estadoBoton = "Ver Detalles";
              accionBoton = () =>
                navigate(`/revisar-examen/${examenId}`, {
                  state: { usuarioId, token },
                });
            } else {
              estadoTexto = "❌ Rehacer";
              estadoClase = "badge bg-danger";
              estadoBoton = "Rehacer Examen";
              accionBoton = () => navigate(`/examen/${examenId}`);
            }
          } else {
            estadoTexto = "🕒 Realizado - Esperando Corrección";
            estadoClase = "badge bg-warning text-dark";
            estadoBoton = "Esperando Corrección";
            botonDeshabilitado = true;
          }
        }

        setEstadoExamenes((prev) => ({
          ...prev,
          [examenId]: {
            completado: data.completado,
            corregido: data.corregido,
            estado: data.estadoGeneral,
            estadoTexto,
            estadoClase,
            estadoBoton,
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
    return <p className="text-warning">Cargando datos del usuario...</p>;
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
                    {estado.fechaLimite || "No especificada"}
                  </p>
                </div>

                {/* Estado del examen con colores */}
                <span className={`badge ${estado.estadoClase}`}>
                  {estado.estadoTexto}
                </span>

                {/* Botón con estado dinámico */}
                <button
                  className="btn btn-sm"
                  onClick={estado.accionBoton}
                  disabled={estado.botonDeshabilitado}
                  style={{
                    backgroundColor: estado.botonDeshabilitado
                      ? "#ccc"
                      : "#007bff",
                    color: "white",
                  }}
                >
                  {estado.estadoBoton}
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

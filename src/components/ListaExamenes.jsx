import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ListaExamenes = ({ examenes, API_URL, token, usuarioId }) => {
  const [estadoExamenes, setEstadoExamenes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuarioId) {
      console.error("❌ usuarioId no encontrado. No se puede continuar.");
      return;
    }

    const fetchEstadoExamen = async (examenId) => {
      try {
        console.log(
          `📡 Solicitando estado del examen desde: ${API_URL}/examenes/${examenId}/estado-detallado/${usuarioId}`
        );

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

        if (data.completado) {
          if (data.corregido) {
            estadoTexto =
              data.estadoGeneral === "aprobado" ? "✔️ Aprobado" : "❌ Rehacer";
            estadoClase =
              data.estadoGeneral === "aprobado"
                ? "badge bg-success"
                : "badge bg-danger";
          } else {
            estadoTexto = "🕒 Esperando corrección...";
            estadoClase = "badge bg-warning text-dark";
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

  return (
    <div>
      <h2 className="mt-4">Exámenes</h2>
      {examenes.length > 0 ? (
        <ul className="list-group">
          {examenes.map((examen) => {
            const estado = estadoExamenes[examen._id] || {};
            const mostrarBoton = !estado.completado;

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

                {/* Mostrar estado con colores */}
                <span className={`badge ${estado.estadoClase}`}>
                  {estado.estadoTexto}
                </span>

                {/* Botón para ver el examen corregido */}
                {estado.completado && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate(`/revisar-examen/${examen._id}`, {
                        state: { usuarioId, token }, // 🔥 Pasando usuarioId y token como estado
                      })
                    }
                  >
                    Ver Detalles
                  </button>
                )}

                {/* Botón para realizar el examen si aún no se ha hecho */}
                {mostrarBoton && (
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/examen/${examen._id}`)}
                  >
                    Realizar Examen
                  </button>
                )}
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

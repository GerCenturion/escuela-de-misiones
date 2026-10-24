import React, { useState } from "react";

const ListaAlumnos = ({ materia, gestionarInscripcion, error, onAlumnoEliminado }) => {
  const [filtro, setFiltro] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  // Normalizamos API_URL para que si ya termina en /api no lo duplique
  const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const baseUrl = rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl}/api`;

  const listaSegura = materia?.students || [];

  const alumnosFiltrados = listaSegura.filter((inscripcion) => {
    if (!inscripcion.student) return false;
    return inscripcion.student.name.toLowerCase().includes(filtro.toLowerCase());
  });

  const handleEliminarAlumno = async (alumnoId, alumnoNombre) => {
    const confirmacion = window.confirm(
      `¿Deseas eliminar a "${alumnoNombre || "este alumno"}" de la materia? Se borrará su inscripción o solicitud independientemente de su estado.`
    );

    if (!confirmacion) return;

    try {
      setEliminandoId(alumnoId);
      const token = localStorage.getItem("token");

      // Construcción exacta: baseUrl ya asegura un único "/api"
      const response = await fetch(
        `${baseUrl}/materias/${materia._id}/estudiante/${alumnoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMsg = "Error al eliminar alumno";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          errorMsg = `Error HTTP ${response.status}: Ruta no encontrada o error en backend`;
        }
        throw new Error(errorMsg);
      }

      alert("✅ Solicitud/Alumno eliminado con éxito.");

      if (onAlumnoEliminado) {
        onAlumnoEliminado(alumnoId);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("❌ Error al eliminar alumno:", err);
      alert(err.message || "Hubo un error al eliminar.");
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="mt-4">
      <h2>
        <button
          className="btn btn-link text-decoration-none"
          onClick={() => setMostrarLista(!mostrarLista)}
        >
          {mostrarLista ? "▼ Ocultar Alumnos" : "▶ Mostrar Alumnos"}
        </button>
      </h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Campo de búsqueda */}
      {mostrarLista && (
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Buscar alumno por nombre..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      )}

      {/* Lista desplegable de alumnos */}
      {mostrarLista && (
        <ul className="list-group">
          {alumnosFiltrados.length > 0 ? (
            alumnosFiltrados.map((inscripcion) => (
              <li
                key={inscripcion.student._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <p className="mb-1">
                    <strong>{inscripcion.student.name}</strong>
                  </p>
                  <p className="mb-0">
                    Estado actual:{" "}
                    <span
                      className={`badge ${
                        inscripcion.status === "Pendiente"
                          ? "bg-warning"
                          : inscripcion.status === "Aceptado"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {inscripcion.status || "Sin estado"}
                    </span>
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={inscripcion.status || ""}
                    onChange={(e) =>
                      gestionarInscripcion(inscripcion.student._id, e.target.value)
                    }
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aceptado">Aceptado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0 }}
                    title="Eliminar de la materia"
                    disabled={eliminandoId === inscripcion.student._id}
                    onClick={() =>
                      handleEliminarAlumno(
                        inscripcion.student._id,
                        inscripcion.student.name
                      )
                    }
                  >
                    {eliminandoId === inscripcion.student._id ? "..." : "✕"}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-muted text-center mt-2">
              No se encontraron alumnos.
            </p>
          )}
        </ul>
      )}
    </div>
  );
};

export default ListaAlumnos;
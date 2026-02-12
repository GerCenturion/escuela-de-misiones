import React, { useState } from "react";

const ListaAlumnos = ({ materia, gestionarInscripcion, error }) => {
  const [filtro, setFiltro] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false); // Controla si se despliega la lista

  // 🔥 CORRECCIÓN: Protección contra nulos
  // Antes: materia.students.filter(...) fallaba si un student era null.
  // Ahora: Verificamos que 'inscripcion.student' exista antes de filtrar.
  const listaSegura = materia?.students || [];

  const alumnosFiltrados = listaSegura.filter((inscripcion) => {
    // 1. Si el usuario fue eliminado de la DB, 'inscripcion.student' es null. Lo saltamos.
    if (!inscripcion.student) return false;

    // 2. Si existe, aplicamos tu filtro original
    return inscripcion.student.name.toLowerCase().includes(filtro.toLowerCase());
  });

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
                  <p>
                    <strong>{inscripcion.student.name}</strong>
                    {/* - {inscripcion.student.dni} */}
                  </p>
                  <p>
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
                <div>
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
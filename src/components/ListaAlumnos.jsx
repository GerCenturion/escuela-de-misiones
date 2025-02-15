import React, { useState } from "react";

const ListaAlumnos = ({ materia, gestionarInscripcion, error }) => {
  const [filtro, setFiltro] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false); // Controla si se despliega la lista

  // Filtrar alumnos según el nombre ingresado en el input
  const alumnosFiltrados = materia.students.filter((student) =>
    student.student.name.toLowerCase().includes(filtro.toLowerCase())
  );

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
            alumnosFiltrados.map((student) => (
              <li
                key={student.student._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <p>
                    <strong>{student.student.name}</strong> -{" "}
                    {student.student.email}
                  </p>
                  <p>
                    Estado actual:{" "}
                    <span
                      className={`badge ${
                        student.status === "Pendiente"
                          ? "bg-warning"
                          : student.status === "Aceptado"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {student.status || "Sin estado"}
                    </span>
                  </p>
                </div>
                <div>
                  <select
                    className="form-select form-select-sm"
                    value={student.status || ""}
                    onChange={(e) =>
                      gestionarInscripcion(student.student._id, e.target.value)
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

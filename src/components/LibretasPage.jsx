import React, { useEffect, useState } from "react";
import LibretaIndividual from "./LibretaIndividual";

const LibretasPage = () => {
  const [libretas, setLibretas] = useState([]);
  const [error, setError] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState(null); // 🔥 Almacenar alumno seleccionado
  const [selectedLibreta, setSelectedLibreta] = useState(null); // 🔥 Para el modal de edición
  const [searchQuery, setSearchQuery] = useState(""); // 🔥 Búsqueda por nombre o legajo
  const [recibo, setRecibo] = useState("");
  const [fechaDePago, setFechaDePago] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLibretas = async () => {
      try {
        const response = await fetch(`${API_URL}/materias/libretas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar las libretas");
        }

        const data = await response.json();
        setLibretas(data);
      } catch (error) {
        setError("Error al cargar las libretas");
        console.error(error);
      }
    };

    fetchLibretas();
  }, [token]);

  // ✅ Formatear fecha en dd/mm/aa
  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // ✅ Función para abrir el modal de edición
  const abrirModal = (libreta) => {
    setSelectedLibreta(libreta);
    setRecibo(libreta.recibo || "");
    setFechaDePago(libreta.fechaDePago || "");
  };

  // ✅ Función para guardar el recibo y la fecha de pago
  const guardarRecibo = async () => {
    if (!selectedLibreta) return;

    try {
      const response = await fetch(
        `${API_URL}/materias/registropagos/${selectedLibreta._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recibo, fechaDePago }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar el recibo");
      }

      // 🔥 Actualizar la libreta en el estado local
      setLibretas((prevLibretas) =>
        prevLibretas.map((lib) =>
          lib._id === selectedLibreta._id
            ? { ...lib, recibo, fechaDePago }
            : lib
        )
      );

      alert("Recibo y fecha de pago actualizados con éxito.");
      setSelectedLibreta(null);
    } catch (error) {
      console.error("Error al guardar el recibo:", error);
      alert("Hubo un error al actualizar el recibo.");
    }
  };

  // ✅ Función para filtrar las libretas según el texto de búsqueda
  const filteredLibretas = libretas.filter(
    (libreta) =>
      libreta.alumno.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      libreta.alumno.legajo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Función para manejar el clic en un alumno
  const handleAlumnoClick = (alumno) => {
    setSelectedAlumno(alumno);
  };

  // ✅ Función para volver atrás y mostrar la lista de libretas
  const handleVolverAtras = () => {
    setSelectedAlumno(null);
  };

  return (
    <div className="container mt-5">
      <h1>Libretas de Todos los Alumnos</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* 🔥 Mostrar LibretaIndividual al seleccionar un alumno */}
      {selectedAlumno && selectedAlumno._id ? (
        <div className="mt-4">
          <button
            className="btn btn-secondary mb-3"
            onClick={handleVolverAtras} // ✅ Función para volver atrás
          >
            Volver Atrás
          </button>
          <LibretaIndividual
            alumnoId={selectedAlumno._id}
            nombre={selectedAlumno.name}
            legajo={selectedAlumno.legajo}
          />
        </div>
      ) : (
        <>
          {/* 🔍 Buscador único para nombre o legajo */}
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Buscar por nombre o legajo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Legajo</th>
                <th>Alumno</th>
                <th>Materia</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th>Fecha de Cierre</th>
                <th>Recibo</th>
                <th>Fecha de Recibo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredLibretas.length > 0 ? (
                filteredLibretas.map((libreta) => (
                  <tr
                    key={libreta._id}
                    onClick={() => handleAlumnoClick(libreta.alumno)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{libreta.alumno.legajo || ""}</td>
                    <td>{libreta.alumno.name}</td>
                    <td>{libreta.materia.name}</td>
                    <td>{libreta.materia.level}</td>
                    <td>{libreta.estadoFinal}</td>
                    <td>{formatFecha(libreta.fechaCierre)}</td>
                    <td>{libreta.recibo || "No registrado"}</td>
                    <td>
                      {libreta.fechaDePago
                        ? formatFecha(libreta.fechaDePago)
                        : "No registrado"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          e.stopPropagation(); // 🔥 Evita conflicto con onClick de la fila
                          abrirModal(libreta);
                        }}
                      >
                        Editar Recibo
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center"
                  >
                    No hay libretas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* 🔥 MODAL PARA EDITAR RECIBO Y FECHA DE PAGO */}
      {selectedLibreta && (
        <div
          className="modal show d-block"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Recibo y Fecha de Pago</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedLibreta(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Número de Recibo:</label>
                  <input
                    type="text"
                    placeholder="N° de comprobante"
                    className="form-control"
                    onChange={(e) => {
                      const valorNumerico = e.target.value.replace(
                        /[^0-9]/g,
                        ""
                      );
                      setRecibo(valorNumerico);
                    }}
                    pattern="\d*"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha de Pago:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fechaDePago}
                    onChange={(e) => setFechaDePago(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedLibreta(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={guardarRecibo}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LibretasPage;

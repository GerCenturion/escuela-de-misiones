import React, { useEffect, useState } from "react";

const LibretasPage = () => {
  const [libretas, setLibretas] = useState([]);
  const [error, setError] = useState("");
  const [selectedLibreta, setSelectedLibreta] = useState(null); // 🔥 Para el modal de edición
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

  return (
    <div className="container mt-5">
      <h1>Libretas de Todos los Alumnos</h1>
      {error && <div className="alert alert-danger">{error}</div>}

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
          {libretas.length > 0 ? (
            libretas.map((libreta) => (
              <tr key={libreta._id}>
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
                    onClick={() => abrirModal(libreta)}
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
                      ); // Permite solo números
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

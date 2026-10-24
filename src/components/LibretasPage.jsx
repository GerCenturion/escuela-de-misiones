import React, { useEffect, useState } from "react";
import LibretaIndividual from "./LibretaIndividual";

const LibretasPage = () => {
  const [libretas, setLibretas] = useState([]);
  const [error, setError] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const baseUrl = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
  const token = localStorage.getItem("token");

  const fetchLibretas = async () => {
    try {
      const response = await fetch(`${baseUrl}/materias/libretas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al cargar las libretas");
      }

      const data = await response.json();

      // Filtrar alumnos únicos con al menos una libreta
      const alumnosUnicos = [];
      const seen = new Set();

      data.forEach((lib) => {
        if (lib.alumno && lib.alumno._id && !seen.has(lib.alumno._id)) {
          seen.add(lib.alumno._id);
          alumnosUnicos.push(lib.alumno);
        }
      });

      setLibretas(alumnosUnicos);
    } catch (err) {
      setError("Error al cargar las libretas");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLibretas();
  }, [token]);

  const handleAlumnoClick = (alumno) => {
    setSelectedAlumno(alumno);
  };

  const handleVolverAtras = () => {
    setSelectedAlumno(null);
  };

  const handleEliminarLibretasAlumno = async (e, alumno) => {
    e.stopPropagation(); // Evita que al hacer clic se abra la libreta individual

    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas eliminar todas las libretas de "${alumno.name}"? Esta acción borrará su historial académico y pagos asociados.`
    );

    if (!confirmacion) return;

    try {
      setEliminandoId(alumno._id);
      const response = await fetch(`${baseUrl}/materias/libreta/alumno/${alumno._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMsg = "Error al eliminar las libretas";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          errorMsg = `Error HTTP ${response.status}`;
        }
        throw new Error(errorMsg);
      }

      alert("✅ Historial de libretas eliminado con éxito.");
      setLibretas((prev) => prev.filter((item) => item._id !== alumno._id));
    } catch (err) {
      console.error("❌ Error al eliminar libretas:", err);
      alert(err.message || "Hubo un error al eliminar.");
    } finally {
      setEliminandoId(null);
    }
  };

  const filteredAlumnos = libretas.filter(
    (alumno) =>
      alumno.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumno.legajo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h1>Alumnos con Libreta</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {selectedAlumno && selectedAlumno._id ? (
        <div className="mt-4">
          <button className="btn btn-secondary mb-3" onClick={handleVolverAtras}>
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
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Buscar por nombre o legajo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Legajo</th>
                <th>Nombre</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumnos.length > 0 ? (
                filteredAlumnos.map((alumno) => (
                  <tr
                    key={alumno._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleAlumnoClick(alumno)}
                  >
                    <td>{alumno.legajo || "Sin legajo"}</td>
                    <td>{alumno.name}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={eliminandoId === alumno._id}
                        title="Eliminar historial de libretas de este alumno"
                        onClick={(e) => handleEliminarLibretasAlumno(e, alumno)}
                      >
                        {eliminandoId === alumno._id ? "Eliminando..." : "🗑️ Eliminar Libreta"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-3">
                    No se encontraron alumnos con libreta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default LibretasPage;
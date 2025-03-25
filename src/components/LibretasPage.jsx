import React, { useEffect, useState } from "react";
import LibretaIndividual from "./LibretaIndividual";

const LibretasPage = () => {
  const [libretas, setLibretas] = useState([]);
  const [error, setError] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [selectedLibreta, setSelectedLibreta] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

        // Filtrar alumnos únicos con al menos una libreta
        const alumnosUnicos = [];
        const seen = new Set();

        data.forEach((lib) => {
          if (!seen.has(lib.alumno._id)) {
            seen.add(lib.alumno._id);
            alumnosUnicos.push(lib.alumno);
          }
        });

        setLibretas(alumnosUnicos);
      } catch (error) {
        setError("Error al cargar las libretas");
        console.error(error);
      }
    };

    fetchLibretas();
  }, [token]);

  const handleAlumnoClick = (alumno) => {
    setSelectedAlumno(alumno);
  };

  const handleVolverAtras = () => {
    setSelectedAlumno(null);
  };

  const filteredAlumnos = libretas.filter(
    (alumno) =>
      alumno.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

          <table className="table table-hover">
            <thead>
              <tr>
                <th>Legajo</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumnos.map((alumno) => (
                <tr
                  key={alumno._id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleAlumnoClick(alumno)}
                >
                  <td>{alumno.legajo}</td>
                  <td>{alumno.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default LibretasPage;
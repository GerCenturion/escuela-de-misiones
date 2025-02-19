import React, { useEffect, useState } from "react";

const LibretasPage = () => {
  const [libretas, setLibretas] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Búsqueda general
  const [nivelFilter, setNivelFilter] = useState(""); // 🎯 Filtro por nivel
  const [profesorFilter, setProfesorFilter] = useState(""); // 🎓 Filtro por profesor
  const [sortOption, setSortOption] = useState("materia-asc"); // ⬆️ Ordenamiento

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

  // ✅ Filtrar y ordenar libretas
  const filteredLibretas = libretas
    .filter((libreta) =>
      searchQuery
        ? libreta.materia.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          libreta.profesor.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          libreta.alumno.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter((libreta) =>
      nivelFilter ? libreta.materia.level === nivelFilter : true
    )
    .filter((libreta) =>
      profesorFilter ? libreta.profesor.name === profesorFilter : true
    )
    .sort((a, b) => {
      if (sortOption === "materia-asc")
        return a.materia.name.localeCompare(b.materia.name);
      if (sortOption === "materia-desc")
        return b.materia.name.localeCompare(a.materia.name);
      if (sortOption === "profesor-asc")
        return a.profesor.name.localeCompare(b.profesor.name);
      if (sortOption === "profesor-desc")
        return b.profesor.name.localeCompare(a.profesor.name);
      if (sortOption === "nota-asc") return a.notaFinal - b.notaFinal;
      if (sortOption === "nota-desc") return b.notaFinal - a.notaFinal;
      return 0;
    });

  return (
    <div className="container mt-5">
      <h1>Libretas de Todos los Alumnos</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* 🔍 Buscador y filtros */}
      <div className="d-flex gap-3 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por materia, profesor o alumno..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="form-select"
          value={nivelFilter}
          onChange={(e) => setNivelFilter(e.target.value)}
        >
          <option value="">Todos los niveles</option>
          <option value="Elemental">Elemental</option>
          <option value="Avanzado 1">Avanzado 1</option>
          <option value="Avanzado 2">Avanzado 2</option>
          <option value="Avanzado 3">Avanzado 3</option>
        </select>

        <select
          className="form-select"
          value={profesorFilter}
          onChange={(e) => setProfesorFilter(e.target.value)}
        >
          <option value="">Todos los profesores</option>
          {Array.from(
            new Set(libretas.map((libreta) => libreta.profesor.name))
          ).map((profesor) => (
            <option
              key={profesor}
              value={profesor}
            >
              {profesor}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="materia-asc">Materia (A-Z)</option>
          <option value="materia-desc">Materia (Z-A)</option>
          <option value="profesor-asc">Profesor (A-Z)</option>
          <option value="profesor-desc">Profesor (Z-A)</option>
          <option value="nota-asc">Nota (Menor a Mayor)</option>
          <option value="nota-desc">Nota (Mayor a Menor)</option>
        </select>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Materia</th>
            <th>Nivel</th>
            <th>Profesor</th>
            <th>Estado</th>
            <th>Fecha de Cierre</th>
          </tr>
        </thead>
        <tbody>
          {filteredLibretas.length > 0 ? (
            filteredLibretas.map((libreta) => (
              <tr key={libreta._id}>
                <td>
                  {libreta.alumno.name} ({libreta.alumno.email})
                </td>
                <td>{libreta.materia.name}</td>
                <td>{libreta.materia.level}</td>
                <td>{libreta.profesor.name}</td>
                <td>{libreta.estadoFinal}</td>
                <td>{formatFecha(libreta.fechaCierre)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="text-center"
              >
                No hay libretas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LibretasPage;

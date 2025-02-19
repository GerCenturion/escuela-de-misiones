import React, { useEffect, useState } from "react";

const LibretaPage = () => {
  const [notas, setNotas] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Campo de búsqueda
  const [nivelFilter, setNivelFilter] = useState(""); // 🎯 Filtro por nivel
  const [sortOption, setSortOption] = useState("materia-asc"); // ⬆️ Ordenamiento

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // ✅ Obtener userId desde el token
  const getUserIdFromToken = () => {
    try {
      const tokenData = JSON.parse(atob(token.split(".")[1])); // Decodificar JWT
      return tokenData.id; // Retornar ID del usuario
    } catch (error) {
      console.error("Error al obtener userId del token:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchNotas = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        setError("No se pudo obtener el ID del usuario.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/materias/libreta/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar la libreta");
        }

        const data = await response.json();
        setNotas(data);
      } catch (error) {
        setError("Error al cargar la libreta");
        console.error(error);
      }
    };

    fetchNotas();
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

  // ✅ Filtrar y ordenar notas
  const filteredNotas = notas
    .filter((nota) =>
      searchQuery
        ? nota.materia.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nota.profesor.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .filter((nota) => (nivelFilter ? nota.materia.level === nivelFilter : true))
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
      <h1>Libreta de Notas</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* 🔍 Buscador y filtros */}
      <div className="d-flex gap-3 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por materia o profesor..."
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
            <th>Materia</th>
            <th>Nivel</th>
            <th>Profesor</th>
            <th>Estado</th>
            <th>Fecha de Cierre</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotas.length > 0 ? (
            filteredNotas.map((nota) => (
              <tr key={nota._id}>
                <td>{nota.materia.name}</td>
                <td>{nota.materia.level}</td>
                <td>{nota.profesor.name}</td>
                <td>{nota.estadoFinal}</td>
                <td>{formatFecha(nota.fechaCierre)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="text-center"
              >
                No hay notas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LibretaPage;

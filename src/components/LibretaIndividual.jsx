import React, { useEffect, useState } from "react";
import "./LibretaIndividual.css";

const LibretaIndividual = ({ alumnoId, nombre, legajo }) => {
  const [libreta, setLibreta] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // 🔥 Obtener todas las materias y la libreta del alumno
  useEffect(() => {
    const fetchLibreta = async () => {
      try {
        if (!alumnoId) {
          console.error("alumnoId no está definido");
          return;
        }

        // 🔥 Obtener todas las materias disponibles
        const materiasResponse = await fetch(`${API_URL}/materias`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!materiasResponse.ok) {
          throw new Error("Error al obtener las materias");
        }

        const materiasData = await materiasResponse.json();
        setMaterias(materiasData);

        // 🔥 Obtener la libreta del alumno
        const libretaResponse = await fetch(
          `${API_URL}/materias/libreta/${alumnoId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!libretaResponse.ok) {
          throw new Error("Error al obtener la libreta");
        }

        const libretaData = await libretaResponse.json();
        setLibreta(libretaData);
      } catch (error) {
        console.error("Error al cargar la libreta:", error);
        setError("Error al cargar la libreta");
      }
    };

    fetchLibreta();
  }, [API_URL, token, alumnoId]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (materias.length === 0) return <div>Cargando...</div>;

  // ✅ Formatear fecha en dd/mm/aa
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // ✅ Formatear estado de pago
  const formatPago = (recibo) => {
    return recibo ? "Pagó" : "Pendiente";
  };

  // ✅ Combinar todas las materias con la libreta del alumno
  const combinedData = materias.map((materia) => {
    const entry = libreta.find((lib) => lib.materia.name === materia.name);
    return {
      nivel: materia.level,
      nombre: materia.name,
      estadoFinal: entry ? entry.estadoFinal : "", // Si no existe, mostrar en blanco
      fechaCierre: entry ? entry.fechaCierre : "",
      recibo: entry ? entry.recibo : "",
      pago: entry ? formatPago(entry.recibo) : "",
    };
  });

  return (
    <div className="libreta-container">
      <h2 className="libreta-title">Libreta de Calificaciones</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ✅ Mostrar nombre y legajo del alumno */}
      <div className="alumno-info">
        <h3>{nombre}</h3>
        <p>Legajo: {legajo || "No registrado"}</p>
      </div>

      <table className="libreta-tabla">
        <thead>
          <tr>
            <th>Nivel</th>
            <th>Materia</th>
            <th>Estado</th>
            <th>Fecha de Cierre</th>
            <th>Pago</th>
            <th>Recibo N°</th>
          </tr>
        </thead>
        <tbody>
          {combinedData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.nivel}</td>
              <td>{entry.nombre}</td>
              <td>
                {entry.estadoFinal === "aprobado"
                  ? "Aprobado"
                  : entry.estadoFinal === "recursa"
                  ? "Recursa"
                  : ""}
              </td>
              <td>{formatFecha(entry.fechaCierre)}</td>
              <td>{entry.pago}</td>
              <td>{entry.recibo || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LibretaIndividual;

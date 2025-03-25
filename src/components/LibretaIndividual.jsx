import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./LibretaIndividual.css";

const LibretaIndividual = ({ alumnoId, nombre, legajo }) => {
  const [formData, setFormData] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  const formatFechaInput = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!alumnoId) return;

        const resMaterias = await fetch(`${API_URL}/materias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const materiasData = await resMaterias.json();
        setMaterias(materiasData);

        const resLibreta = await fetch(`${API_URL}/materias/libreta/${alumnoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let libretaData = [];
        if (resLibreta.ok) libretaData = await resLibreta.json();

        const combined = materiasData.map((materia) => {
          const entry = libretaData.find((lib) => lib.materia.name === materia.name);
          return {
            materiaId: materia._id,
            materiaName: materia.name,
            nivel: materia.level,
            estadoFinal: entry?.estadoFinal || "",
            fechaCierre: entry?.fechaCierre ? formatFechaInput(entry.fechaCierre) : "",
            recibo: entry?.recibo !== "No registrado" ? entry?.recibo : "",
            fechaDePago:
              entry?.fechaDePago && entry?.fechaDePago !== "No registrado"
                ? formatFechaInput(entry.fechaDePago)
                : "",
            pago: entry?.recibo && entry?.recibo !== "No registrado" ? "Pagó" : "Pendiente",
            libretaId: entry?._id || null,
          };
        });

        setFormData(combined);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudo cargar la libreta del alumno");
      }
    };

    fetchData();
  }, [alumnoId]);

  const handleChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handlePagoChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index].pago = value;
      if (value === "Pendiente") {
        updated[index].recibo = "";
        updated[index].fechaDePago = "";
      }
      return updated;
    });
  };

  const handleGuardarCambios = async () => {
    for (const item of formData) {
      const body = {
        alumno: alumnoId,
        materia: item.materiaId,
        estadoFinal: item.estadoFinal,
        fechaCierre: item.fechaCierre || null,
        recibo: item.pago === "Pagó" ? item.recibo : "",
        fechaDePago: item.pago === "Pagó" ? item.fechaDePago : null,
      };

      const url = item.libretaId
        ? `${API_URL}/materias/libreta/${item.libretaId}`
        : `${API_URL}/materias/manual`;

      const method = item.libretaId ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error("Error al guardar cambios");
        }
      } catch (err) {
        console.error("Error al guardar libreta:", err);
        alert("Error al guardar cambios en alguna materia.");
      }
    }
    alert("Cambios guardados con éxito");
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!formData.length) return <div>Cargando...</div>;

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Libreta del Alumno", 14, 20);
    doc.setFontSize(12);
    doc.text(`Nombre: ${nombre}`, 14, 30);
    doc.text(`Legajo: ${legajo || "No registrado"}`, 14, 37);
  
    const rows = formData.map((lib) => [
      lib.nivel,
      lib.materiaName,
      lib.estadoFinal === "aprobado"
        ? "Aprobado"
        : lib.estadoFinal === "recursa"
        ? "Recursa"
        : "",
      lib.fechaCierre ? formatFechaInput(lib.fechaCierre).split("-").reverse().join("/") : "",
      lib.pago,
      lib.fechaDePago ? formatFechaInput(lib.fechaDePago).split("-").reverse().join("/") : "",
      lib.recibo || "",
    ]);
  
    autoTable(doc, {
      startY: 45,
      head: [["Nivel", "Materia", "Estado", "Fecha Cierre", "Pago", "Fecha Pago", "Recibo"]],
      body: rows,
    });
  
    doc.save(`libreta-${nombre.replace(/\s+/g, "_")}.pdf`);
  };  

  return (
    <div className="libreta-container">
      <h2 className="libreta-title">Libreta del Alumno</h2>
      <div className="alumno-info">
        <h3>{nombre}</h3>
        <p>Legajo: {legajo || "No registrado"}</p>
      </div>
      <div className="mt-3 d-flex gap-3">

    <button className="btn btn-outline-primary" onClick={generarPDF}>
      Descargar PDF
    </button>
  </div>
      <table className="libreta-tabla">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Estado</th>
            <th>Fecha de Cierre</th>
            <th>Pago</th>
            <th>Fecha de Pago</th>
            <th>Recibo N°</th>
          </tr>
        </thead>
        <tbody>
          {formData.map((lib, index) => (
            <tr key={index}>
              <td>{lib.materiaName}</td>
              <td>
                <select
                  value={lib.estadoFinal}
                  onChange={(e) => handleChange(index, "estadoFinal", e.target.value)}
                  disabled={userRole !== "admin"}
                >
                  <option value="">--</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="recursa">Recursa</option>
                </select>
              </td>
              <td>
                <input
                  type="date"
                  value={lib.fechaCierre}
                  onChange={(e) => handleChange(index, "fechaCierre", e.target.value)}
                  disabled={userRole !== "admin"}
                />
              </td>
              <td>
                <select
                  value={lib.pago}
                  onChange={(e) => handlePagoChange(index, e.target.value)}
                  disabled={userRole !== "admin"}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagó">Pagó</option>
                </select>
              </td>
              <td>
                <input
                  type="date"
                  value={lib.fechaDePago}
                  onChange={(e) => handleChange(index, "fechaDePago", e.target.value)}
                  disabled={userRole !== "admin" || lib.pago !== "Pagó"}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={lib.recibo}
                  onChange={(e) => handleChange(index, "recibo", e.target.value)}
                  disabled={userRole !== "admin" || lib.pago !== "Pagó"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {userRole === "admin" && (
        <button className="btn btn-success mt-3" onClick={handleGuardarCambios}>
          Guardar Cambios
        </button>
      )}
    </div>
  );
};

export default LibretaIndividual;

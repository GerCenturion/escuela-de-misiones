import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AgregarLibreta = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [estadoFinal, setEstadoFinal] = useState("aprobado");
  const [recibo, setRecibo] = useState("");
  const [fechaDePago, setFechaDePago] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alumnosRes = await fetch(`${API_URL}/usuarios/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const materiasRes = await fetch(`${API_URL}/materias`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!alumnosRes.ok || !materiasRes.ok) {
          throw new Error("Error al cargar datos");
        }

        const alumnosData = await alumnosRes.json();
        const materiasData = await materiasRes.json();

        setAlumnos(alumnosData);
        setMaterias(materiasData);
      } catch (error) {
        setError("Error al cargar alumnos y materias");
        console.error(error);
      }
    };

    fetchData();
  }, [token]);

  const handleAlumnoSeleccionado = (nombre) => {
    const alumno = alumnos.find((a) => a.name === nombre);
    setAlumnoSeleccionado(alumno ? alumno._id : "");
  };

  const handleMateriaSeleccionada = (nombre) => {
    const materia = materias.find((m) => m.name === nombre);
    setMateriaSeleccionada(materia ? materia._id : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!alumnoSeleccionado || !materiaSeleccionada) {
      alert("Debes seleccionar un Alumno y una Materia.");
      return;
    }

    const confirmacion = window.confirm(
      "¿Estás seguro de que quieres agregar esta libreta?"
    );

    if (!confirmacion) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/materias/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          alumno: alumnoSeleccionado,
          materia: materiaSeleccionada,
          estadoFinal,
          recibo,
          fechaDePago,
          fechaCierre,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la libreta");
      }

      alert("Libreta agregada con éxito.");
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error al agregar la libreta:", error);
      alert("Hubo un problema al guardar la libreta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Agregar Nueva Libreta</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* 🔍 Campo combinado de búsqueda y selección para Alumno */}
        <div className="mb-3">
          <label className="form-label">Alumno:</label>
          <input
            type="text"
            className="form-control"
            list="lista-alumnos"
            placeholder="Escribe para buscar o seleccionar..."
            onChange={(e) => handleAlumnoSeleccionado(e.target.value)}
          />
          <datalist id="lista-alumnos">
            {alumnos.map((alumno) => (
              <option
                key={alumno._id}
                value={alumno.name}
              >
                {alumno.name} - {alumno.legajo || "Sin legajo"}
              </option>
            ))}
          </datalist>
        </div>

        {/* 🔍 Campo combinado de búsqueda y selección para Materia */}
        <div className="mb-3">
          <label className="form-label">Materia:</label>
          <input
            type="text"
            className="form-control"
            list="lista-materias"
            placeholder="Escribe para buscar o seleccionar..."
            onChange={(e) => handleMateriaSeleccionada(e.target.value)}
          />
          <datalist id="lista-materias">
            {materias.map((materia) => (
              <option
                key={materia._id}
                value={materia.name}
              >
                {materia.name} - {materia.level}
              </option>
            ))}
          </datalist>
        </div>

        {/* Estado Final */}
        <div className="mb-3">
          <label className="form-label">Estado Final:</label>
          <select
            className="form-select"
            value={estadoFinal}
            onChange={(e) => setEstadoFinal(e.target.value)}
          >
            <option value="aprobado">Aprobado</option>
            <option value="recursa">Recursa</option>
          </select>
        </div>
        {/* Fecha de Cierre */}
        <div className="mb-3">
          <label className="form-label">Fecha de Cierre:</label>
          <input
            type="date"
            className="form-control"
            value={fechaCierre}
            onChange={(e) => setFechaCierre(e.target.value)}
          />
        </div>

        {/* Recibo */}
        <div className="mb-3">
          <label className="form-label">Número de Recibo:</label>
          <input
            type="text"
            className="form-control"
            value={recibo}
            onChange={(e) => setRecibo(e.target.value)}
          />
        </div>

        {/* Fecha de Pago */}
        <div className="mb-3">
          <label className="form-label">Fecha de Pago:</label>
          <input
            type="date"
            className="form-control"
            value={fechaDePago}
            onChange={(e) => setFechaDePago(e.target.value)}
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Libreta"}
        </button>
      </form>
    </div>
  );
};

export default AgregarLibreta;

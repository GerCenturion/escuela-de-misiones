import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/LibretaIndividual.css";

const AgregarLibreta = () => {
  const userRole = localStorage.getItem("role");
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");
  const [libretaAlumno, setLibretaAlumno] = useState([]);
  const [error, setError] = useState("");
  const [materiasCargadas, setMateriasCargadas] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alumnosRes, materiasRes] = await Promise.all([
          fetch(`${API_URL}/usuarios/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/materias`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!alumnosRes.ok || !materiasRes.ok) {
          throw new Error("Error al cargar alumnos o materias");
        }

        const alumnosData = await alumnosRes.json();
        const materiasData = await materiasRes.json();

        const soloAlumnos = alumnosData.filter((usuario) => usuario.role === "alumno");
        setAlumnos(soloAlumnos);
        setMaterias(materiasData);
      } catch (error) {
        setError("Error al cargar alumnos o materias");
        console.error(error);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchLibreta = async () => {
      if (!alumnoSeleccionado) return;

      try {
        const res = await fetch(`${API_URL}/materias/libreta/${alumnoSeleccionado}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.ok ? await res.json() : [];
        setMateriasCargadas(data);

        const merged = materias.map((materia) => {
          const entry = data.find((lib) => lib.materia && (lib.materia._id === materia._id || lib.materia.name === materia.name));
          const tieneDatos = Boolean(entry);
          return {
            _id: entry?._id || `nuevo-${materia._id}`,
            alumno: entry?.alumno || alumnoSeleccionado,
            materia: { _id: materia._id, name: materia.name },
            estadoFinal: entry?.estadoFinal || "",
            fechaCierre: formatFecha(entry?.fechaCierre),
            pagoEstado: entry?.pagoEstado || (entry?.recibo ? "pagado" : "pendiente"),
            fechaDePago: formatFecha(entry?.fechaDePago),
            recibo: entry?.recibo || "",
            tieneDatos,
          };
        });

        setLibretaAlumno(merged);
      } catch (err) {
        console.error("Error al cargar libreta del alumno", err);
        // No seteamos error para permitir crear libreta nueva
        setMateriasCargadas([]);
        const merged = materias.map((materia) => ({
          _id: `nuevo-${materia._id}`,
          alumno: alumnoSeleccionado,
          materia: { _id: materia._id, name: materia.name },
          estadoFinal: "",
          fechaCierre: "",
          pagoEstado: "pendiente",
          fechaDePago: "",
          recibo: "",
          tieneDatos: false,
        }));
        setLibretaAlumno(merged);
      }
    };

    if (alumnoSeleccionado && materias.length > 0) {
      fetchLibreta();
    }
  }, [alumnoSeleccionado, materias]);

  const handleChange = (index, field, value) => {
    const updated = [...libretaAlumno];
    updated[index][field] = value;
    setLibretaAlumno(updated);
  };

  const handleGuardarCambios = async () => {
    try {
      for (const libreta of libretaAlumno) {
        const payload = {
          alumno: libreta.alumno,
          materia: libreta.materia._id,
          estadoFinal: libreta.estadoFinal,
          fechaCierre: libreta.fechaCierre,
          pagoEstado: libreta.pagoEstado,
          fechaDePago: libreta.fechaDePago,
          recibo: libreta.recibo,
        };

        if (libreta._id.toString().startsWith("nuevo-")) {
          await fetch(`${API_URL}/materias/manual`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
        } else {
          await fetch(`${API_URL}/materias/registropagos/${libreta._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ recibo: libreta.recibo, fechaDePago: libreta.fechaDePago }),
          });

          await fetch(`${API_URL}/materias/libreta/${libreta._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              alumno: libreta.alumno,
              materia: libreta.materia._id,
              estadoFinal: libreta.estadoFinal,
              fechaCierre: libreta.fechaCierre,
            }),
          });
        }
      }
      alert("Cambios guardados exitosamente");
      navigate(0);
    } catch (err) {
      console.error("Error al guardar los cambios:", err);
      alert("Error al guardar los cambios");
    }
  };

  return (
    <div className="libreta-container">
      <h2 className="libreta-title">Editar Libreta del Alumno</h2>
      <button className="btn btn-secondary mb-3" onClick={() => navigate('/admin-dashboard')}>
        Volver
      </button>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Seleccionar Alumno:</label>
        <select
          className="form-select"
          value={alumnoSeleccionado}
          onChange={(e) => setAlumnoSeleccionado(e.target.value)}
        >
          <option value="">Seleccione un alumno</option>
          {alumnos.map((alumno) => (
            <option key={alumno._id} value={alumno._id}>
              {alumno.name} - {alumno.legajo || "Sin legajo"}
            </option>
          ))}
        </select>
      </div>

      {alumnoSeleccionado && (
        <>
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
              {libretaAlumno.map((lib, index) => (
                <tr key={lib._id} className={lib.tieneDatos ? "libreta-existente" : ""}>
                  <td>{lib.materia.name}</td>
                  <td>
                    <select value={lib.estadoFinal} disabled={userRole !== 'admin'} onChange={(e) => handleChange(index, "estadoFinal", e.target.value)}
                    >
                      <option value="">--</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="recursa">Recursa</option>
                    </select>
                  </td>
                  <td>
                    <input type="date" value={lib.fechaCierre} disabled={userRole !== 'admin'} onChange={(e) => handleChange(index, "fechaCierre", e.target.value)}
                    />
                  </td>
                  <td>
                    <select value={lib.pagoEstado || "pendiente"} disabled={userRole !== 'admin'} onChange={(e) => handleChange(index, "pagoEstado", e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagó</option>
                    </select>
                  </td>
                  <td>
                    <input type="date" value={lib.fechaDePago} disabled={userRole !== 'admin'} onChange={(e) => handleChange(index, "fechaDePago", e.target.value)}
                    />
                  </td>
                  <td>
                    <input type="text" value={lib.recibo || ""} disabled={userRole !== 'admin'} onChange={(e) => handleChange(index, "recibo", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {userRole === 'admin' && <button className="btn btn-success mt-3" onClick={handleGuardarCambios}>
            Guardar Cambios</button>}
        </>
      )}
    </div>
  );
};

export default AgregarLibreta;

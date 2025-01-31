import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";

const ProfessorMateriaPage = () => {
  const { id } = useParams(); // ID de la materia desde la URL
  const [materia, setMateria] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMateria = async () => {
      try {
        const response = await fetch(`${API_URL}/materias/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar la materia");
        }

        const data = await response.json();
        setMateria(data);
      } catch (error) {
        setError("Error al cargar la materia");
        console.error(error);
      }
    };

    fetchMateria();
  }, [id, token]);

  const gestionarInscripcion = async (alumnoId, status) => {
    const currentStatus = materia.students.find(
      (student) => student.student._id === alumnoId
    )?.status;

    if (currentStatus === status) {
      alert("El estado seleccionado ya es el actual.");
      return;
    }

    const confirmChange = window.confirm(
      `¿Estás seguro de que deseas cambiar el estado a "${status}"?`
    );

    if (!confirmChange) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/materias/gestionar-inscripcion/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ alumnoId, status }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al gestionar la solicitud de inscripción");
      }

      const data = await response.json();
      alert(data.message);

      // Recargar los datos de la materia para reflejar los cambios
      setMateria((prevMateria) => ({
        ...prevMateria,
        students: prevMateria.students.map((student) =>
          student.student._id === alumnoId ? { ...student, status } : student
        ),
      }));
    } catch (error) {
      setError("Error al gestionar la solicitud");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarArchivo = async (fileUrl) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este archivo?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/uploads/delete-file/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el archivo");
      }

      const data = await response.json();
      alert(data.message);

      // Eliminar el archivo de la lista local
      setMateria((prevMateria) => ({
        ...prevMateria,
        files: prevMateria.files.filter((file) => file.fileUrl !== fileUrl),
      }));
    } catch (error) {
      setError("Error al eliminar el archivo");
      console.error(error);
    }
  };

  if (!materia) {
    return <div>Cargando materia...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>{materia.name}</h1>
      <p>Nivel: {materia.level}</p>

      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate("/professor-dashboard")}
      >
        Volver al Dashboard
      </button>

      <h2>Solicitudes de Inscripción</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="list-group">
        {materia.students.map((student) => (
          <li
            key={student.student._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <p>
                <strong>{student.student.name}</strong> -{" "}
                {student.student.email}
              </p>
              <p>
                Estado actual:{" "}
                <span
                  className={`badge ${
                    student.status === "Pendiente"
                      ? "bg-warning"
                      : student.status === "Aceptado"
                      ? "bg-success"
                      : student.status === "Rechazado"
                      ? "bg-danger"
                      : "bg-secondary"
                  }`}
                >
                  {student.status || "Sin estado"}
                </span>
              </p>
            </div>
            <div>
              {loading ? (
                <button
                  className="btn btn-primary btn-sm"
                  disabled
                >
                  Cargando...
                </button>
              ) : (
                <select
                  className="form-select form-select-sm"
                  value={student.status || ""}
                  onChange={(e) =>
                    gestionarInscripcion(student.student._id, e.target.value)
                  }
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aceptado">Aceptado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Subida de archivos */}
      <FileUploader
        materiaId={id}
        onUploadSuccess={() => window.location.reload()}
      />

      {/* Listado de archivos */}
      <h2 className="mt-4">Archivos Subidos</h2>
      {materia.files.length > 0 ? (
        <ul className="list-group">
          {materia.files.map((file, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{file.fileName}</span>
              <div>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm me-2"
                >
                  Descargar
                </a>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => eliminarArchivo(file.fileUrl)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay archivos subidos para esta materia.</p>
      )}
    </div>
  );
};

export default ProfessorMateriaPage;

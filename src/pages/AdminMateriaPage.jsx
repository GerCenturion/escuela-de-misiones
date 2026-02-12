import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import ExamenForm from "../components/ExamenForm";
import ExamenesListModal from "../components/ExamenesListModal";
import VideoManagerModal from "../components/VideoManagerModal";
import ListaAlumnos from "../components/ListaAlumnos";
import Spinner from "../components/Spinner";

const AdminMateriaPage = () => {
  const { id } = useParams();
  const [materia, setMateria] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Iniciamos cargando
  const [mostrarExamenForm, setMostrarExamenForm] = useState(false);
  const [mostrarExamenesModal, setMostrarExamenesModal] = useState(false);
  const [mostrarFileUploader, setMostrarFileUploader] = useState(false);
  const [mostrarVideoManager, setMostrarVideoManager] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchMateria = async () => {
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/materias/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 MANEJO DE TOKEN VENCIDO (401)
      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al cargar la materia");
      }

      const data = await response.json();
      setMateria(data);
    } catch (error) {
      setError("Error al cargar la materia");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar la carga inicial
  useEffect(() => {
    if (!token) {
        navigate("/login");
        return;
    }
    fetchMateria();
  }, [id, token]);

  const eliminarArchivo = async (fileUrl) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este archivo?"))
      return;

    try {
      const response = await fetch(`${API_URL}/uploads/delete-file/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileUrl }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) throw new Error("Error al eliminar el archivo");

      alert("Archivo eliminado con éxito");

      // Actualizar el estado eliminando el archivo
      setMateria((prevMateria) => ({
        ...prevMateria,
        files: prevMateria.files.filter((file) => file.fileUrl !== fileUrl),
      }));
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      alert("No se pudo eliminar el archivo.");
    }
  };

  const eliminarVideo = async (videoUrl) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este video?"))
      return;

    try {
      const response = await fetch(`${API_URL}/materias/${id}/eliminar-video`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (response.status === 401) {
         localStorage.removeItem("token");
         navigate("/login");
         return;
      }

      if (!response.ok) throw new Error("Error al eliminar el video");

      alert("Video eliminado con éxito");

      setMateria((prevMateria) => ({
        ...prevMateria,
        videos: prevMateria.videos.filter((video) => video.url !== videoUrl),
      }));
    } catch (error) {
      console.error("Error al eliminar video:", error);
      alert("No se pudo eliminar el video.");
    }
  };

  const cerrarMateria = async () => {
    if (!id) {
      alert("Error: No se encontró el ID de la materia.");
      return;
    }

    const confirmacion1 = confirm(
      "⚠️ ATENCIÓN: Al cerrar esta materia ocurrirá lo siguiente:\n\n" +
        "✅ Se guardarán las notas finales de los alumnos en la libreta.\n" +
        "✅ Se deshabilitarán nuevas inscripciones a la materia.\n" +
        "✅ Se eliminarán todos los exámenes relacionados.\n" +
        "✅ Se eliminarán todos los archivos y videos asociados.\n" +
        "✅ Se eliminarán todas las inscripciones de los alumnos.\n\n" +
        "❌ Esta acción no se puede deshacer.\n\n" +
        "¿Estás seguro de que quieres continuar?"
    );

    if (!confirmacion1) return;

    const confirmacion2 = confirm(
      "⚠️ ¿Estás completamente seguro? Esta acción es irreversible.\n\n" +
        "Presiona 'Aceptar' para continuar o 'Cancelar' para abortar."
    );

    if (!confirmacion2) return;

    try {
      const response = await fetch(`${API_URL}/materias/cerrar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
         localStorage.removeItem("token");
         navigate("/login");
         return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error desconocido al cerrar la materia");
      }

      alert(data.message);
      navigate("/admin-dashboard"); // Corregido redirección a admin
    } catch (error) {
      console.error("Error al cerrar materia:", error.message);
      alert(error.message || "No se pudo cerrar la materia.");
    }
  };

  const gestionarInscripcion = async (alumnoId, status) => {
    const currentStatus = materia.students.find(
      (student) => student.student && student.student._id === alumnoId
    )?.status;

    if (currentStatus === status) {
      alert("El estado seleccionado ya es el actual.");
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas cambiar el estado a "${status}"?`)) return;

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

      if (response.status === 401) {
         localStorage.removeItem("token");
         navigate("/login");
         return;
      }

      if (!response.ok) {
        throw new Error("Error al gestionar la solicitud de inscripción");
      }

      const data = await response.json();
      alert(data.message);

      setMateria((prevMateria) => ({
        ...prevMateria,
        students: prevMateria.students.map((student) =>
          // 🔥 Seguridad extra: verificar que student.student no sea null
          student.student && student.student._id === alumnoId ? { ...student, status } : student
        ),
      }));
    } catch (error) {
      setError("Error al gestionar la solicitud");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!materia) return <div className="alert alert-danger text-center mt-5">No se pudo cargar la materia.</div>;

  return (
    <div className="container mt-5 mb-5">
      <h1>{materia.name}</h1>
      <p className="lead">Nivel: {materia.level}</p>
      
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin-dashboard")}
        >
            ⬅ Volver al Dashboard
        </button>

        <button
            className="btn btn-success"
            onClick={() => setMostrarExamenForm(true)}
        >
            📝 Crear Examen
        </button>
        
        {/* Nuevo Botón para ver lista de exámenes */}
        <button
            className="btn btn-primary"
            onClick={() => setMostrarExamenesModal(true)}
        >
            📋 Ver Exámenes
        </button>

        <button
            className="btn btn-warning"
            onClick={() => setMostrarFileUploader(true)}
        >
            📂 Subir Archivo
        </button>

        <button
            className="btn btn-info text-white"
            onClick={() => setMostrarVideoManager(true)}
        >
            🎥 Administrar Videos
        </button>

        <button
            className="btn btn-danger"
            onClick={cerrarMateria}
        >
            🔒 Cerrar Materia
        </button>
      </div>

      <ListaAlumnos
        materia={materia}
        gestionarInscripcion={gestionarInscripcion}
        error={error}
      />

      {/* Listado de archivos */}
      <h3 className="mt-5 border-bottom pb-2">📂 Archivos Subidos</h3>
      {materia.files && materia.files.length > 0 ? (
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
        <p className="text-muted">No hay archivos subidos para esta materia.</p>
      )}

      {/* Listado de videos */}
      <h3 className="mt-5 border-bottom pb-2">🎥 Videos Asociados</h3>
      {materia.videos && materia.videos.length > 0 ? (
        <ul className="list-group">
          {materia.videos.map((video, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none fw-bold"
              >
                {video.title}
              </a>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => eliminarVideo(video.url)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No hay videos asociados.</p>
      )}

      {/* --- MODALES --- */}

      {/* ⚠️ CORRECCIÓN: Eliminado el <ExamenesListModal> suelto que tenías aquí */}

      {mostrarExamenForm && (
        <ExamenForm
          materiaId={id}
          onClose={() => {
              setMostrarExamenForm(false);
              fetchMateria(); // Recargar materia al cerrar para ver cambios
          }}
        />
      )}

      {mostrarExamenesModal && (
        <ExamenesListModal
          materiaId={id}
          onClose={() => setMostrarExamenesModal(false)}
        />
      )}

      {mostrarFileUploader && (
        <FileUploader
          materiaId={id}
          onClose={() => {
              setMostrarFileUploader(false);
              fetchMateria();
          }}
        />
      )}

      {mostrarVideoManager && (
        <VideoManagerModal
          materiaId={id}
          onClose={() => {
              setMostrarVideoManager(false);
              fetchMateria();
          }}
        />
      )}
    </div>
  );
};

export default AdminMateriaPage;
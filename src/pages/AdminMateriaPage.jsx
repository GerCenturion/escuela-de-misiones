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
  const [loading, setLoading] = useState(false);
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

  // Ejecutar la carga inicial
  useEffect(() => {
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

      if (!response.ok) throw new Error("Error al eliminar el video");

      alert("Video eliminado con éxito");

      // Actualizar el estado eliminando el video correspondiente
      setMateria((prevMateria) => ({
        ...prevMateria,
        videos: prevMateria.videos.filter((video) => video.url !== videoUrl),
      }));
    } catch (error) {
      console.error("Error al eliminar video:", error);
      alert("No se pudo eliminar el video.");
    }
  };

  if (!materia) {
    return <div>Cargando materia...</div>;
  }

  const cerrarMateria = async () => {
    if (!id) {
      alert("Error: No se encontró el ID de la materia.");
      return;
    }

    // 📌 Primera confirmación con explicación detallada
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

    if (!confirmacion1) {
      alert("Operación cancelada. La materia no ha sido cerrada.");
      return;
    }

    // 📌 Segunda confirmación antes de ejecutar la acción
    const confirmacion2 = confirm(
      "⚠️ ¿Estás completamente seguro? Esta acción es irreversible.\n\n" +
        "Si cierras la materia, se eliminarán los datos mencionados anteriormente.\n" +
        "Si tienes dudas, consulta con el administrador antes de proceder.\n\n" +
        "Presiona 'Aceptar' para continuar o 'Cancelar' para abortar."
    );

    if (!confirmacion2) {
      alert("Operación cancelada. La materia sigue activa.");
      return;
    }

    console.log("Cerrando materia con ID:", id); // Depuración

    try {
      const response = await fetch(`${API_URL}/materias/cerrar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json(); // Intentar parsear la respuesta
      if (!response.ok) {
        console.error("Error en la respuesta del servidor:", data);
        throw new Error(
          data.message || "Error desconocido al cerrar la materia"
        );
      }

      alert(data.message);
      navigate("/professor-dashboard"); // Redirigir después de cerrar
    } catch (error) {
      console.error("Error al cerrar materia:", error.message);
      alert(error.message || "No se pudo cerrar la materia.");
    }
  };

  // Cambiar el estado de inscripción de un alumno
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

    if (loading) return <Spinner />;
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

  if (loading) return <Spinner />;

  return (
    <div className="container mt-5">
      <h1>{materia.name}</h1>
      <p>Nivel: {materia.level}</p>
      <button
        className="btn btn-secondary mb-3 me-2"
        onClick={() => navigate("/admin-dashboard")}
      >
        Volver al Dashboard
      </button>

      {/* Botones para abrir modales */}
      <button
        className="btn btn-success mb-3 me-2"
        onClick={() => setMostrarExamenForm(true)}
      >
        Crear Examen
      </button>

      <button
        className="btn btn-warning mb-3 me-2"
        onClick={() => setMostrarFileUploader(true)}
      >
        Subir Archivo
      </button>

      <button
        className="btn btn-info mb-3 me-2"
        onClick={() => setMostrarVideoManager(true)}
        onUploadSuccess={fetchMateria}
      >
        Administrar Videos
      </button>

      <button
        className="btn btn-danger mb-3"
        onClick={cerrarMateria}
      >
        Cerrar Materia
      </button>

      <ListaAlumnos
        materia={materia} // Objeto con la materia y los alumnos
        gestionarInscripcion={gestionarInscripcion} // Función para actualizar el estado del alumno
        error={error} // Mensaje de error si lo hay
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

      {/* Listado de videos */}
      <h2 className="mt-4">Videos Asociados</h2>
      {materia?.videos.length > 0 ? (
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
        <p>No hay videos asociados.</p>
      )}

      <ExamenesListModal materiaId={id} />

      {/* Modal de Crear Examen */}
      {mostrarExamenForm && (
        <ExamenForm
          materiaId={id}
          onClose={() => setMostrarExamenForm(false)}
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
          onClose={() => setMostrarFileUploader(false)}
        />
      )}

      {mostrarVideoManager && (
        <VideoManagerModal
          materiaId={id}
          onClose={() => setMostrarVideoManager(false)}
        />
      )}
    </div>
  );
};

export default AdminMateriaPage;

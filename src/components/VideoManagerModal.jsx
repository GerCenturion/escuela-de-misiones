import React, { useState, useEffect } from "react";

const VideoManagerModal = ({ materiaId, onClose }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videos, setVideos] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${API_URL}/materias/${materiaId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener los videos");

        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error("Error al obtener los videos:", error);
      }
    };

    fetchVideos();
  }, [materiaId, token]);

  const agregarVideo = async () => {
    if (!videoUrl || !videoTitle) {
      alert("Ingrese un título y una URL válida");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/materias/${materiaId}/agregar-video`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: videoUrl, title: videoTitle }),
        }
      );

      if (!response.ok) throw new Error("Error al agregar el video");

      alert("Video agregado con éxito");

      // ✅ Recargar la página para ver los cambios
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("No se pudo agregar el video.");
    }
  };

  const eliminarVideo = async (url) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este video?"))
      return;

    try {
      const response = await fetch(
        `${API_URL}/materias/${materiaId}/eliminar-video`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) throw new Error("Error al eliminar el video");

      alert("Video eliminado con éxito");

      // ✅ Actualizar la lista de videos sin recargar la página
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video.url !== url)
      );
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el video.");
    }
  };

  return (
    <div
      className="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Administrar Videos</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <h6>Agregar Nuevo Video</h6>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Título del video"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="URL de YouTube"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <button
              className="btn btn-success w-100"
              onClick={agregarVideo}
            >
              Agregar Video
            </button>

            <hr />

            <h6>Videos Asociados</h6>
            {videos.length > 0 ? (
              <ul className="list-group">
                {videos.map((video, index) => (
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
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary w-100"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoManagerModal;

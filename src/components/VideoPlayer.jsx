import React, { useState } from "react";

const VideoPlayer = ({ video }) => {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL 

  if (!video || !video.url) {
    return <p className="text-danger">Error: Video no válido</p>;
  }

  // Extraer el ID del video de YouTube
  const videoId = new URL(video.url).searchParams.get("v");
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  const fetchDownloadUrl = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/youtube/download?url=https://www.youtube.com/watch?v=${videoId}`
      );
      const data = await response.json();
      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      } else {
        alert("No se pudo obtener el enlace de descarga.");
      }
    } catch (error) {
      console.error("Error al obtener el enlace de descarga:", error);
      alert("Hubo un error al generar el enlace.");
    }
    setLoading(false);
  };

  return (
    <div className="video-container mb-4">
      <h5>{video.title}</h5>
      <div className="embed-responsive embed-responsive-16by9">
        <iframe
          className="embed-responsive-item"
          src={embedUrl}
          allowFullScreen
          title={video.title}
        ></iframe>
      </div>

      <button
        onClick={fetchDownloadUrl}
        className="btn btn-primary mt-2"
        disabled={loading}
      >
        {loading ? "Generando enlace..." : "Obtener enlace de descarga"}
      </button>

      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success mt-2 ml-2"
        >
          Descargar Video
        </a>
      )}
    </div>
  );
};

export default VideoPlayer;

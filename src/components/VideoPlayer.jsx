import React, { useState } from "react";

const VideoPlayer = ({ video }) => {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  if (!video || !video.url) {
    return <p className="text-danger">Error: Video no válido</p>;
  }

  const isYouTube = video.url.includes("youtube.com") || video.url.includes("youtu.be");
  const isGoogleDrive = video.url.includes("drive.google.com");

  // Generar URL embebida y lógica de descarga
  let embedUrl = "";
  const handleDownload = async () => {
    setLoading(true);
    try {
      if (isYouTube) {
        const videoId = new URL(video.url).searchParams.get("v");
        const response = await fetch(`${API_URL}/youtube/download?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
        } else {
          alert("No se pudo obtener el enlace de descarga.");
        }
      } else if (isGoogleDrive) {
        // Extraer ID del video en Drive
        const driveIdMatch = video.url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
        const driveId = driveIdMatch ? driveIdMatch[1] : null;

        if (driveId) {
          const directUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
          setDownloadUrl(directUrl);
        } else {
          alert("No se pudo obtener el ID del archivo de Google Drive.");
        }
      }
    } catch (error) {
      console.error("Error al obtener el enlace de descarga:", error);
      alert("Hubo un error al generar el enlace.");
    }
    setLoading(false);
  };

  // Embeds
  if (isYouTube) {
    const videoId = new URL(video.url).searchParams.get("v");
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (isGoogleDrive) {
    const driveIdMatch = video.url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
    const driveId = driveIdMatch ? driveIdMatch[1] : null;
    if (driveId) {
      embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    }
  }

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
        onClick={handleDownload}
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

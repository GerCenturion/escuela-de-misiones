import React from "react";

const VideoPlayer = ({ video }) => {
  if (!video || !video.url) {
    return <p className="text-danger">Error: Video no válido</p>;
  }

  // Extraer el ID del video de YouTube
  const videoId = new URL(video.url).searchParams.get("v");
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const downloadUrl = `https://www.ssyoutube.com/watch?v=${videoId}`;

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
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-success mt-2"
      >
        Descargar Video
      </a>
    </div>
  );
};

export default VideoPlayer;

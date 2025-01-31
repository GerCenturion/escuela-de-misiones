import React, { useState } from "react";


const FileUploader = ({ materiaId, onUploadSuccess }) => {

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      alert("Por favor selecciona un archivo.");
      return;
    }
    setFile(selectedFile);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Selecciona un archivo para subir");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Subiendo archivo...");
      const response = await fetch(`${API_URL}/uploads/upload/${materiaId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Error al subir archivo");
      }

      const data = await response.json();

      setUploadStatus("Archivo subido con éxito");

      if (onUploadSuccess) onUploadSuccess(data.fileUrl);

    } catch (error) {
      console.error("Error al subir archivo:", error);
      setUploadStatus("Error al subir archivo");
    }
  };

  return (
    <div>
      <h2>Subir Archivos</h2>
      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          onChange={handleFileChange}
        />
        <button type="submit">Subir</button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default FileUploader;

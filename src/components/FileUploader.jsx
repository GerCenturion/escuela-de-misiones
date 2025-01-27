import React, { useState } from "react";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (
      selectedFile &&
      !["application/pdf", "image/jpeg", "image/png"].includes(
        selectedFile.type
      )
    ) {
      alert("Solo se permiten archivos .pdf, .jpg y .png");
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
      const response = await fetch(`${API_URL}/uploads/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Error al subir archivo");
      }

      const data = await response.json();
      setUploadStatus(`Archivo subido con éxito: ${data.fileUrl}`);
      setFile(null);
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setUploadStatus("Error al subir archivo");
    }
  };

  return (
    <div>
      <h2 className="mt-4">Subir Archivos</h2>
      <form onSubmit={handleFileUpload}>
        <div className="mb-3">
          <input
            type="file"
            name="file"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Subir Archivo
        </button>
      </form>
      {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
    </div>
  );
};

export default FileUploader;

import React, { useState, useEffect } from "react";

const FileUploaderModal = ({ materiaId, onClose }) => {
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

      alert("Archivo subido con éxito");

      // ✅ Recargar la página para ver los cambios reflejados
      window.location.reload();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      setUploadStatus("Error al subir archivo");
    }
  };

  // Cerrar modal con la tecla "Esc"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
            <h5 className="modal-title">Subir Archivo</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleFileUpload}>
              <input
                type="file"
                className="form-control mb-3"
                onChange={handleFileChange}
              />
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Subir
              </button>
            </form>
            {uploadStatus && <p className="mt-3 text-center">{uploadStatus}</p>}
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

export default FileUploaderModal;

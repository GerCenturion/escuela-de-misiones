import React, { useState } from "react";

const ClassManager = ({ materiaId, classes, setClasses }) => {
  const [newClass, setNewClass] = useState({
    title: "",
    description: "",
    videoUrl: "",
    files: [],
  });
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleFileChange = (e) => {
    setNewClass({ ...newClass, files: e.target.files });
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newClass.title);
    formData.append("description", newClass.description);
    formData.append("videoUrl", newClass.videoUrl);
    for (const file of newClass.files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch(`${API_URL}/uploads/${materiaId}/classes`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al crear la clase");
      }

      const data = await response.json();
      setClasses((prev) => [...prev, data.newClass]);
      setNewClass({ title: "", description: "", videoUrl: "", files: [] });
    } catch (err) {
      setError("Error al crear la clase");
    }
  };

  return (
    <div>
      <h2>Crear Clase</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleCreateClass}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Título de la clase"
            value={newClass.title}
            onChange={(e) =>
              setNewClass({ ...newClass, title: e.target.value })
            }
            required
          />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Descripción"
            value={newClass.description}
            onChange={(e) =>
              setNewClass({ ...newClass, description: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <input
            type="url"
            className="form-control"
            placeholder="URL del video de YouTube"
            value={newClass.videoUrl}
            onChange={(e) =>
              setNewClass({ ...newClass, videoUrl: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Crear Clase
        </button>
      </form>

      <h2 className="mt-4">Clases</h2>
      {classes?.length > 0 ? (
        classes.map((clase) => (
          <div
            key={clase._id}
            className="card mb-3"
          >
            <div className="card-body">
              <h5 className="card-title">{clase.title}</h5>
              <p className="card-text">{clase.description}</p>
              {clase.videoUrl && (
                <a
                  href={clase.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm mb-2"
                >
                  Ver video
                </a>
              )}
              <ul className="list-group list-group-flush">
                {clase.files.map((file) => (
                  <li
                    key={file.fileUrl}
                    className="list-group-item"
                  >
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      ) : (
        <p>No hay clases disponibles.</p>
      )}
    </div>
  );
};

export default ClassManager;

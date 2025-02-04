import React, { useState, useEffect } from "react";

const Perfil = () => {
  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/usuarios/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos del usuario");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, [token]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten archivos JPG y PNG.");
      setSelectedFile(null);
      return;
    }

    setError(""); // Resetear errores si el archivo es válido
    cropAndResizeImage(file);
  };

  const cropAndResizeImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Asegurar recorte centrado
        const minSize = Math.min(img.width, img.height);
        const offsetX = (img.width - minSize) / 2;
        const offsetY = (img.height - minSize) / 2;

        canvas.width = 300;
        canvas.height = 300;

        ctx.drawImage(img, offsetX, offsetY, minSize, minSize, 0, 0, 300, 300);

        // Convertir el canvas en un Blob para subirlo
        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
            });
            setSelectedFile(resizedFile);
            setPreviewImage(URL.createObjectURL(resizedFile)); // Mostrar vista previa
          },
          "image/jpeg",
          0.9
        );
      };
    };
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(`${API_URL}/uploads/subir-foto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setUserData((prev) => ({ ...prev, profileImage: data.imageUrl }));
      } else {
        console.error(data.message);
        setError("Error al subir la foto.");
      }
    } catch (error) {
      console.error("Error al subir la foto:", error);
      setError("Error interno del servidor.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Perfil de Usuario</h1>
      {userData && (
        <div>
          <img
            src={previewImage || userData.profileImage || "/default-avatar.png"}
            alt="Foto de perfil"
            className="profile-picture"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover", // Asegura que la imagen se recorte sin distorsión
              objectPosition: "center", // Centra la imagen correctamente
            }}
          />
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
          />
          {error && <p className="text-danger">{error}</p>}
          <button
            className="btn btn-primary mt-2"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Subir Foto
          </button>
        </div>
      )}
    </div>
  );
};

export default Perfil;

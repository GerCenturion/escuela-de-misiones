import React, { useState, useEffect, useRef } from "react";
import { FaPen, FaCheck, FaTimes } from "react-icons/fa"; // Íconos para edición
import "../App.css"; // Archivo de estilos

const Perfil = ({ API_URL, token }) => {
  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

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
        setError("Error al obtener la información personal.");
      }
    };

    fetchUserData();
  }, [API_URL, token]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten archivos JPG y PNG.");
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

        // Recorte centrado
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
        setSelectedFile(null); // Ocultar el botón después de subir la foto
        setPreviewImage(null);
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
    <div className="perfil-container">
      <h1>Perfil de Usuario</h1>
      {userData && (
        <div className="profile-wrapper">
          <div className="profile-image-container">
            <img
              src={
                previewImage || userData.profileImage || "/default-avatar.png"
              }
              alt="Foto de perfil"
              className="profile-picture"
            />
            <div
              className="edit-icon"
              onClick={() => fileInputRef.current.click()}
            >
              <FaPen />
            </div>
          </div>

          <input
            type="file"
            accept="image/jpeg, image/png"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {error && <p className="text-danger">{error}</p>}

          {/* Botones solo si hay una imagen seleccionada */}
          {selectedFile && (
            <div className="upload-buttons">
              <button
                className="upload-confirm"
                onClick={handleUpload}
              >
                <FaCheck />
              </button>
              <button
                className="upload-cancel"
                onClick={() => setSelectedFile(null)}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Información personal */}
      <div className="info-card">
        <h3>Datos Personales</h3>
        <p>
          <strong>Nombre:</strong> {userData?.name}
        </p>
        <p>
          <strong>Email:</strong> {userData?.email}
        </p>
        <p>
          <strong>Fecha de Nacimiento:</strong>{" "}
          {new Date(userData?.birthdate).toLocaleDateString()}
        </p>
        <p>
          <strong>DNI:</strong> {userData?.dni}
        </p>
        <p>
          <strong>Dirección:</strong> {userData?.address}
        </p>
      </div>

      <div className="info-card">
        <h3>Contacto</h3>
        <p>
          <strong>Teléfono:</strong> (+{userData?.phoneCode}){" "}
          {userData?.phoneArea}-{userData?.phoneNumber}
        </p>
        <p>
          <strong>Tipo de Teléfono:</strong> {userData?.phoneType}
        </p>
      </div>

      <div className="info-card">
        <h3>Datos Religiosos</h3>
        <p>
          <strong>Iglesia:</strong> {userData?.church}
        </p>
        <p>
          <strong>Rol Ministerial:</strong>{" "}
          {userData?.ministerialRole || "No asignado"}
        </p>
        <p>
          <strong>Motivo de Inscripción:</strong> {userData?.reason}
        </p>
      </div>

      <div className="info-card">
        <h3>Otros</h3>
        <p>
          <strong>Estado Civil:</strong> {userData?.civilStatus}
        </p>
        <p>
          <strong>Profesión:</strong> {userData?.profession}
        </p>
        <p>
          <strong>Rol en la Plataforma:</strong> {userData?.role}
        </p>
      </div>
    </div>
  );
};

export default Perfil;

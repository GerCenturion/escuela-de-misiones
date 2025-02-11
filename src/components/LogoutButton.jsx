import React from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // URL del backend

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Llamar a la API para cerrar sesión (si se maneja en el backend)
      const response = await fetch(`${API_URL}/login/logout`, {
        method: "POST",
        credentials: "include", // En caso de que uses cookies
      });

      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }

      // Eliminar token del almacenamiento local
      localStorage.removeItem("token");

      // Redirigir al usuario a la página de inicio de sesión
      navigate("/login");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <button
      className="btn btn-danger"
      onClick={handleLogout}
    >
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;

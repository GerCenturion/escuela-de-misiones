import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Importa el export nombrado

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.role !== "admin") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    return children;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }
};

export default AdminRoute;

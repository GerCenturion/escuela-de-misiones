import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProfessorRoute = ({ children }) => {
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
    const decoded = jwtDecode(token); // Decodifica el token

    // Permitir acceso si el usuario es "profesor" o "admin"
    if (decoded.role === "profesor" || decoded.role === "admin") {
      return children;
    }

    // Redirige al dashboard general si no tiene el rol necesario
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
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

export default ProfessorRoute;

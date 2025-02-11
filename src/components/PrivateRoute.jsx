import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Si no hay token, redirigir al inicio de sesión
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si hay token, permitir acceso al contenido protegido
  return children;
};

export default PrivateRoute;

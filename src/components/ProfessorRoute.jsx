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

    if (decoded.role !== "profesor") {
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

export default ProfessorRoute;

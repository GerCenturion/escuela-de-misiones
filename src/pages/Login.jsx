import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password }),
      });

      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }

      const data = await response.json();

      // Guardar token en localStorage para mantener la sesión
      localStorage.setItem("token", data.token);

      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "profesor") {
        navigate("/professor-dashboard");
      } else if (data.user.role === "alumno") {
        navigate("/dashboard");
      } else {
        setError("Rol desconocido. Contacte al administrador.");
      }
    } catch (error) {
      setError("Credenciales inválidas. Intente nuevamente.");
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">DNI:</label>
          <input
            type="text"
            className="form-control"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary w-100"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;

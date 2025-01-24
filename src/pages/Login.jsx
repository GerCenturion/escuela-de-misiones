import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook para redirigir

  // URL de la API desde el archivo .env
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

      // Guardar token en localStorage
      localStorage.setItem("token", data.token);

      // Redirigir a /dashboard
      navigate("/dashboard");
    } catch (error) {
      setError("Credenciales inválidas. Intente nuevamente.");
      console.error("Error:", error.message);
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
        {error && <div className="text-danger mb-3">{error}</div>}
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

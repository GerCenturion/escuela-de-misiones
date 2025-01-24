import React, { useState } from "react";

const Login = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // URL de la API desde el archivo .env
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password }),
      });

      if (!response.ok) {
        throw new Error("Error al iniciar sesión");
      }

      const data = await response.json();
      alert(data.message);
      console.log("Token:", data.token);
      localStorage.setItem("token", data.token);
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

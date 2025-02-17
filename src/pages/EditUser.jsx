import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Error al cargar el usuario");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError("Error al cargar el usuario");
        console.error(error);
      }
    };

    fetchUser();
  }, [id, token, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    // Confirmación del usuario
    const confirmed = window.confirm(
      "¿Estás seguro de guardar los cambios en este usuario?"
    );

    if (!confirmed) {
      return; // Salir si el usuario no confirma
    }

    try {
      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios");
      }

      // Redirigir al dashboard de admin
      navigate("/admin-dashboard");
    } catch (error) {
      setError("Error al guardar los cambios");
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard"); // Redirige al panel de administración
  };

  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="container mt-5">
      <h1>Editar Usuario</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="mb-3">
          <label className="form-label">Nombre:</label>
          <input
            type="text"
            className="form-control"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Rol:</label>
          <select
            className="form-control"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
          >
            <option value="admin">Administrador</option>
            <option value="profesor">Profesor</option>
            <option value="alumno">Alumno</option>
          </select>
        </div>
        <div className="d-flex gap-3">
          <button
            type="submit"
            className="btn btn-primary"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

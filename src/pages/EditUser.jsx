import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
          throw new Error("Error al cargar el usuario.");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError("Error al cargar el usuario.");
        console.error(error);
      }
    };

    fetchUser();
  }, [id, token, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validaciones antes de enviar
    if (
      !user.name.trim() ||
      !user.email.trim() ||
      !user.legajo.trim() ||
      !user.phoneCode.trim() ||
      !user.phoneArea.trim() ||
      !user.phoneNumber.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const confirmed = window.confirm(
      "¿Estás seguro de guardar los cambios en este usuario?"
    );

    if (!confirmed) return;

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
        throw new Error("Error al guardar los cambios.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1500);
    } catch (error) {
      setError("Error al guardar los cambios.");
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="container mt-5">
      <h1>Editar Usuario</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          ✅ Cambios guardados con éxito.
        </div>
      )}

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
          <label className="form-label">Legajo:</label>
          <input
            type="text"
            className="form-control"
            value={user.legajo}
            onChange={(e) => setUser({ ...user, legajo: e.target.value })}
          />
        </div>

        {/* 🔹 Campos para editar el teléfono */}
        <div className="mb-3">
          <label className="form-label">Teléfono:</label>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Área (XXX)"
              value={user.phoneArea}
              onChange={(e) => setUser({ ...user, phoneArea: e.target.value })}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Número (XXXXXXX)"
              value={user.phoneNumber}
              onChange={(e) =>
                setUser({ ...user, phoneNumber: e.target.value })
              }
            />
          </div>
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
            disabled={success} // Deshabilita el botón tras guardar con éxito
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

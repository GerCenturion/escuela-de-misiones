import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // URL de la API
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Token almacenado
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirigir si no está autenticado
      return;
    }

    // Obtener usuarios
    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar usuarios");
        }

        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        setError("Error al cargar usuarios");
        console.error(error);
      }
    };

    fetchUsuarios();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      setUsuarios(usuarios.filter((usuario) => usuario._id !== id));
    } catch (error) {
      setError("Error al eliminar usuario");
      console.error(error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Panel de Administración</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario._id}>
              <td>{usuario.name}</td>
              <td>{usuario.email}</td>
              <td>{usuario.role}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => handleDelete(usuario._id)}
                >
                  Eliminar
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/admin/edit/${usuario._id}`)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("usuarios");
  const [isProfessor, setIsProfessor] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
          headers: {
            Authorization: `Bearer ${token}`,
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

    const fetchMaterias = async () => {
      try {
        const response = await fetch(`${API_URL}/materias`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar materias");
        }

        const data = await response.json();
        setMaterias(data);

        // Verificar si el usuario actual tiene materias asignadas
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decodifica el token
        const userId = decoded.id;
        const assignedMaterias = data.filter(
          (materia) => materia.professor?._id === userId
        );
        setIsProfessor(assignedMaterias.length > 0);
      } catch (error) {
        setError("Error al cargar materias");
        console.error(error);
      }
    };

    fetchUsuarios();
    fetchMaterias();
  }, [token, navigate]);

  const handleDeleteUsuario = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleDeleteMateria = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta materia?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/materias/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Asegúrate de usar el prefijo "Bearer"
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("No tienes permisos para eliminar esta materia.");
        }
        if (response.status === 404) {
          throw new Error("Materia no encontrada.");
        }
        throw new Error("Error al eliminar la materia.");
      }

      setMaterias((prevMaterias) =>
        prevMaterias.filter((materia) => materia._id !== id)
      );
      setError("");
      alert("Materia eliminada con éxito.");
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleGoToProfessorDashboard = () => {
    navigate("/professor-dashboard");
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Panel de Administración</h1>

      <div className="mb-4">
        <button
          className={`btn btn-secondary me-2 ${
            activeSection === "usuarios" && "active"
          }`}
          onClick={() => setActiveSection("usuarios")}
        >
          Administrar Usuarios
        </button>
        <button
          className={`btn btn-secondary me-2 ${
            activeSection === "materias" && "active"
          }`}
          onClick={() => setActiveSection("materias")}
        >
          Administrar Materias
        </button>
        {isProfessor && (
          <button
            className="btn btn-info"
            onClick={handleGoToProfessorDashboard}
          >
            Ir al Dashboard de Profesor
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeSection === "usuarios" && (
        <div>
          <h2>Usuarios</h2>
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
                      onClick={() => handleDeleteUsuario(usuario._id)}
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
      )}

      {activeSection === "materias" && (
        <div>
          <h2>Materias</h2>
          <button
            className="btn btn-success mb-3"
            onClick={() => navigate("/admin/materias/create")}
          >
            Agregar Materia
          </button>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Nivel</th>
                <th>Profesor</th>
                <th>Inscripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((materia) => (
                <tr key={materia._id}>
                  <td>{materia.name}</td>
                  <td>{materia.level}</td>
                  <td>{materia.professor?.name || "Sin asignar"}</td>
                  <td>
                    {materia.isEnrollmentOpen ? "Habilitada" : "Deshabilitada"}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDeleteMateria(materia._id)}
                    >
                      Eliminar
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(`/admin/materias/edit/${materia._id}`)
                      }
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

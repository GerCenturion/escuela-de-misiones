import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Perfil from "../components/Perfil";
import "../Dashboard.css";

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState("usuarios");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isProfessor, setIsProfessor] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleDeleteMateria = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta materia?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/materias/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la materia");
      }

      setMaterias(materias.filter((materia) => materia._id !== id));
    } catch (error) {
      setError("Error al eliminar materia");
      console.error(error);
    }
  };

  const handleDeleteUsuario = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }

      setUsuarios(usuarios.filter((usuario) => usuario._id !== id));
    } catch (error) {
      setError("Error al eliminar usuario");
      console.error(error);
    }
  };

  const handleGoToProfessorDashboard = () => {
    navigate("/professor-dashboard");
  };

  return (
    <div className="dashboard-container">
      <button
        className="menu-hamburguesa"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <h2 className="sidebar-title">Escuela de Misiones</h2>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                className={activeSection === "usuarios" ? "active" : ""}
                onClick={() => setActiveSection("usuarios")}
              >
                Administrar Usuarios
              </button>
            </li>
            <li>
              <button
                className={activeSection === "materias" ? "active" : ""}
                onClick={() => setActiveSection("materias")}
              >
                Administrar Materias
              </button>
            </li>
            <li>
              {isProfessor && (
                <button
                  className="btn btn-info"
                  onClick={handleGoToProfessorDashboard}
                >
                  Ir al Panel del Profesor
                </button>
              )}
            </li>
            <li>
              <button
                className={activeSection === "profile" ? "active" : ""}
                onClick={() => {
                  setActiveSection("profile");
                  setIsSidebarOpen(false);
                  <Perfil
                    userData={userData}
                    API_URL={API_URL}
                    token={token}
                  />;
                }}
              >
                Perfil
              </button>
              <li>
                <Link to="/">Cerrar Sesión</Link>
              </li>
            </li>{" "}
          </ul>
        </nav>
        <div className="container">
          {/* Logo con imagen */}
          <img
            src="/logo.png"
            alt="Escuela de Misiones"
            style={{ height: "150px", marginRight: "5px" }}
          />
        </div>
      </aside>

      <main className="main-content">
        {activeSection === "usuarios" && (
          <section>
            <h1>Administración de Usuarios</h1>
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
          </section>
        )}

        {activeSection === "materias" && (
          <section>
            <h1>Administración de Materias</h1>
            <button
              className="btn btn-success mb-3"
              onClick={() => navigate("/admin/materias/create")}
            >
              Agregar Materia
            </button>
            {error && <div className="alert alert-danger">{error}</div>}
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
                      {materia.isEnrollmentOpen
                        ? "Habilitada"
                        : "Deshabilitada"}
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
          </section>
        )}
        {activeSection === "profile" && (
          <Perfil
            userData={userData}
            API_URL={API_URL}
            token={token}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

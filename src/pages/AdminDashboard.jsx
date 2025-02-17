import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Perfil from "../components/Perfil";
import LogoutButton from "../components/LogoutButton";
import LibretasPage from "../components/LibretasPage";
import "../Dashboard.css";
import Spinner from "../components/Spinner";

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [levelFilter, setLevelFilter] = useState("");
  const [professorFilter, setProfessorFilter] = useState("");
  const [enrollmentFilter, setEnrollmentFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // 📌 Estado para el Spinner
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
      } finally {
        setLoading(false); // 📌 Ocultar Spinner cuando los datos estén listos
      }
    };

    fetchUsuarios();
    fetchMaterias();
  }, [token, navigate]);

  if (loading) return <Spinner />;

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

  const MateriaItem = ({ materia }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const isAdmin = decodedToken?.role === "admin";

    const alumnosAceptados = materia.students.filter(
      (student) => student.status === "Aceptado"
    ).length;

    const alumnosPendientes = materia.students.filter(
      (student) => student.status === "Pendiente"
    ).length;

    return (
      <li className="list-group-item">
        <h5>{materia.name}</h5>
        <p>Nivel: {materia.level}</p>
        <p>
          <strong>Alumnos:</strong> {alumnosAceptados} aceptados,{" "}
          {alumnosPendientes} pendientes
        </p>
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                isAdmin
                  ? `/admin/materias/${materia._id}`
                  : `/professor/materias/${materia._id}`
              )
            }
          >
            Ver Materia
          </button>
        </div>
      </li>
    );
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
                className={activeSection === "verMaterias" ? "active" : ""}
                onClick={() => setActiveSection("verMaterias")}
              >
                Materias Habilitadas
              </button>
            </li>
            <button
              onClick={() => {
                setActiveSection("libretas");
                setIsSidebarOpen(false);
              }}
            >
              Ver Libretas
            </button>
            <li>
              <button
                className={activeSection === "profile" ? "active" : ""}
                onClick={() => {
                  setActiveSection("profile");
                  setIsSidebarOpen(false);
                }}
              >
                Perfil
              </button>
            </li>
            <li>
              <LogoutButton />
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {activeSection === "usuarios" && (
          <section>
            <h1>Administración de Usuarios</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {/* Filtros y Ordenación */}
            <div className="d-flex mb-3 gap-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Todos los Roles</option>
                <option value="alumno">Alumno</option>
                <option value="profesor">Profesor</option>
                <option value="admin">Administrador</option>
              </select>

              <select
                className="form-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
              </select>
            </div>

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
                {usuarios
                  .filter(
                    (usuario) =>
                      usuario.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      usuario.email
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .filter((usuario) =>
                    roleFilter ? usuario.role === roleFilter : true
                  )
                  .sort((a, b) => {
                    if (sortOption === "name-asc")
                      return a.name.localeCompare(b.name);
                    if (sortOption === "name-desc")
                      return b.name.localeCompare(a.name);
                    if (sortOption === "email-asc")
                      return a.email.localeCompare(b.email);
                    if (sortOption === "email-desc")
                      return b.email.localeCompare(a.email);
                    return 0;
                  })
                  .map((usuario) => (
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
        {activeSection === "libretas" && <LibretasPage token={token} />}

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

            {/* Filtros y Ordenación */}
            <div className="d-flex mb-3 gap-3">
              {/* Buscar por nombre */}
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Filtrar por nivel */}
              <select
                className="form-select"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="">Todos los niveles</option>
                <option value="Elemental">Elemental</option>
                <option value="Avanzado 1">Avanzado 1</option>
                <option value="Avanzado 2">Avanzado 2</option>
                <option value="Avanzado 3">Avanzado 3</option>
              </select>

              {/* Filtrar por profesor */}
              <select
                className="form-select"
                value={professorFilter}
                onChange={(e) => setProfessorFilter(e.target.value)}
              >
                <option value="">Todos los profesores</option>
                {materias
                  .map((materia) => materia.professor?.name)
                  .filter(
                    (name, index, self) => name && self.indexOf(name) === index
                  )
                  .map((profName, index) => (
                    <option
                      key={index}
                      value={profName}
                    >
                      {profName}
                    </option>
                  ))}
              </select>

              {/* Filtrar por estado de inscripción */}
              <select
                className="form-select"
                value={enrollmentFilter}
                onChange={(e) => setEnrollmentFilter(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Habilitada">Habilitada</option>
                <option value="Deshabilitada">Deshabilitada</option>
              </select>

              {/* Ordenar */}
              <select
                className="form-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="level-asc">Nivel (A-Z)</option>
                <option value="level-desc">Nivel (Z-A)</option>
                <option value="professor-asc">Profesor (A-Z)</option>
                <option value="professor-desc">Profesor (Z-A)</option>
              </select>
            </div>

            {/* Tabla de materias */}
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
                {materias
                  .filter((materia) =>
                    materia.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .filter((materia) =>
                    levelFilter ? materia.level === levelFilter : true
                  )
                  .filter((materia) =>
                    professorFilter
                      ? materia.professor?.name === professorFilter
                      : true
                  )
                  .filter((materia) =>
                    enrollmentFilter
                      ? enrollmentFilter === "Habilitada"
                        ? materia.isEnrollmentOpen
                        : !materia.isEnrollmentOpen
                      : true
                  )
                  .sort((a, b) => {
                    if (sortOption === "name-asc")
                      return a.name.localeCompare(b.name);
                    if (sortOption === "name-desc")
                      return b.name.localeCompare(a.name);
                    if (sortOption === "level-asc")
                      return a.level.localeCompare(b.level);
                    if (sortOption === "level-desc")
                      return b.level.localeCompare(a.level);
                    if (sortOption === "professor-asc")
                      return (a.professor?.name || "").localeCompare(
                        b.professor?.name || ""
                      );
                    if (sortOption === "professor-desc")
                      return (b.professor?.name || "").localeCompare(
                        a.professor?.name || ""
                      );
                    return 0;
                  })
                  .map((materia) => (
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

        {activeSection === "verMaterias" && (
          <section>
            <h1>Todas las Materias Habilitadas</h1>
            <div className="materias-container">
              {materias
                .filter((materia) => materia.isEnrollmentOpen)
                .map((materia) => (
                  <div
                    key={materia._id}
                    className="materia-card"
                  >
                    <h3>{materia.name}</h3>
                    <p>
                      <strong>Nivel:</strong> {materia.level}
                    </p>
                    <p>
                      <strong>Profesor:</strong>{" "}
                      {materia.professor?.name || "Sin asignar"}
                    </p>
                    <p>
                      <strong>Alumnos Inscritos:</strong>{" "}
                      {materia.students.length}
                    </p>
                    <div className="button-group">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(`/admin/materias/${materia._id}`)
                        }
                      >
                        Ingresar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;

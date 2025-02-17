import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Perfil from "../components/Perfil";
import LogoutButton from "../components/LogoutButton";
import LibretasPage from "../components/LibretasPage";
import Spinner from "../components/Spinner";

const ProfessorDashboard = () => {
  const [materias, setMaterias] = useState([]);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [activeSection, setActiveSection] = useState("home");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      alert("Por favor, inicia sesión para acceder al dashboard.");
      window.location.href = "/login";
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos del usuario");
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      }
    };

    const fetchMaterias = async () => {
      try {
        const response = await fetch(`${API_URL}/materias`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar las materias asignadas");
        }

        const data = await response.json();
        const materiasProfesor = data.filter(
          (materia) => materia.professor?._id === obtenerIdProfesor()
        );
        setMaterias(materiasProfesor);
      } catch (error) {
        setError("Error al cargar las materias asignadas");
        console.error(error);
      }
    };

    const verificarAdmin = () => {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        if (decodedToken.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    };

    fetchUserData();
    fetchMaterias();
    verificarAdmin();
  }, [token]);

  const obtenerIdProfesor = () => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      return decodedToken.id;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  const MateriaItem = ({ materia }) => {
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
            onClick={() => navigate(`/professor/materias/${materia._id}`)}
          >
            Ver Materia
          </button>
        </div>
      </li>
    );
  };

  if (loading) return <Spinner />;

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
            {isAdmin && (
              <li>
                <button onClick={() => navigate("/admin-dashboard")}>
                  Ir al Panel de Administración
                </button>
              </li>
            )}
            <li>
              <button
                className={activeSection === "materias" ? "active" : ""}
                onClick={() => {
                  setActiveSection("materias");
                  setIsSidebarOpen(false);
                }}
              >
                Materias Asignadas
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
            <LogoutButton />{" "}
          </ul>
        </nav>
        <div className="container">
          <img
            src="/logo.png"
            alt="Escuela de Misiones"
            style={{ height: "150px", marginRight: "5px" }}
          />
        </div>
      </aside>

      <main className="main-content">
        {activeSection === "home" && (
          <section>
            <h1> Bienvenido {userData ? userData.name : "Cargando..."}</h1>
          </section>
        )}
        <div className="container mt-5">
          {activeSection === "libretas" && <LibretasPage token={token} />}

          {activeSection === "profile" && (
            <Perfil
              userData={userData}
              API_URL={API_URL}
              token={token}
            />
          )}

          {activeSection === "materias" && (
            <ul className="list-group">
              {materias.length > 0 ? (
                materias.map((materia) => (
                  <MateriaItem
                    key={materia._id}
                    materia={materia}
                  />
                ))
              ) : (
                <p>No tienes materias asignadas.</p>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfessorDashboard;

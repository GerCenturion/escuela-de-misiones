import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Perfil from "../components/Perfil";
import "../Dashboard.css";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [userData, setUserData] = useState(null);
  const [availableMaterias, setAvailableMaterias] = useState([]);
  const [inscriptionStatus, setInscriptionStatus] = useState({});
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

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
      alert("Por favor, inicia sesión para acceder al dashboard.");
      window.location.href = "/login";
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/usuarios/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos del usuario");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        alert(
          "Hubo un problema al cargar los datos. Por favor, inicia sesión nuevamente."
        );
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    const fetchAvailableMaterias = async () => {
      try {
        const response = await fetch(`${API_URL}/materias`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Error al cargar las materias disponibles");
        }

        const data = await response.json();
        const filteredMaterias = data.filter(
          (materia) => materia.isEnrollmentOpen
        );
        setAvailableMaterias(filteredMaterias);

        // Verificar estado de inscripción de todas las materias
        filteredMaterias.forEach((materia) =>
          fetchInscriptionStatus(materia._id)
        );
      } catch (error) {
        setError("Error al cargar las materias disponibles");
        console.error(error);
      }
    };

    const fetchInscriptionStatus = async (materiaId) => {
      try {
        const response = await fetch(
          `${API_URL}/materias/${materiaId}/estado-inscripcion`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Error al verificar inscripción para ${materiaId}`);
        }

        const data = await response.json();
        setInscriptionStatus((prev) => ({
          ...prev,
          [materiaId]: data.status, // Guardar estado de inscripción
        }));
      } catch (error) {
        console.error("Error al obtener estado de inscripción:", error);
      }
    };

    fetchUserData();
    fetchAvailableMaterias();
  }, [token]);

  const handleInscripcion = async (materiaId) => {
    try {
      const response = await fetch(
        `${API_URL}/materias/solicitar-inscripcion/${materiaId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al solicitar inscripción");
      }

      const data = await response.json();
      alert(data.message);

      setInscriptionStatus((prev) => ({
        ...prev,
        [materiaId]: "Pendiente",
      }));
    } catch (error) {
      console.error("Error al solicitar inscripción:", error);
      alert("Error al solicitar inscripción");
    }
  };

  const MateriaItem = ({ materia }) => {
    const estadoInscripcion = inscriptionStatus[materia._id] || "No Inscrito";

    return (
      <div className="materia-card">
        <h3 className="materia-title">{materia.name}</h3>
        <p className="materia-level">{materia.level}</p>
        <p className="materia-profesor">
          Profesor: {materia.professor?.name || "Sin profesor asignado"}
        </p>

        {/* Estado de inscripción con espaciado */}
        <div className="inscription-status">
          {estadoInscripcion === "Pendiente" && (
            <span className="badge badge-pendiente">Pendiente</span>
          )}
          {estadoInscripcion === "Aceptado" && (
            <span className="badge badge-aceptado">Aceptado</span>
          )}
          {estadoInscripcion === "Rechazado" && (
            <span className="badge badge-rechazado">Rechazado</span>
          )}
        </div>

        {/* Botón bien posicionado */}
        <div className="materia-action">
          {estadoInscripcion === "Aceptado" ? (
            <Link
              to={`/materia/${materia._id}`}
              className="btn-materia"
            >
              Acceder
            </Link>
          ) : (
            <button
              className="btn-materia"
              disabled={estadoInscripcion === "Pendiente"}
              onClick={() => handleInscripcion(materia._id)}
            >
              {estadoInscripcion === "Pendiente"
                ? "Solicitud Enviada"
                : "Solicitar Inscripción"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Menú hamburguesa en pantallas pequeñas */}
      <button
        className="menu-hamburguesa"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <h2 className="sidebar-title">Escuela de Misiones</h2>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                className={activeSection === "home" ? "active" : ""}
                onClick={() => {
                  setActiveSection("home");
                }}
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                className={activeSection === "materias" ? "active" : ""}
                onClick={() => setActiveSection("materias")}
              >
                Materias
              </button>
            </li>
            <li>
              <button
                className={activeSection === "profile" ? "active" : ""}
                onClick={() => setActiveSection("profile")}
              >
                Perfil
              </button>
            </li>
            <li>
              <Link to="/">Cerrar Sesión</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        {activeSection === "home" && (
          <section>
            <h1> Bienvenido {userData ? userData.name : "Cargando..."}</h1>
          </section>
        )}
        {activeSection === "materias" && (
          <section>
            <h1>Materias Disponibles</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="materias-container">
              {availableMaterias.map((materia) => (
                <MateriaItem
                  key={materia._id}
                  materia={materia}
                />
              ))}
            </div>
          </section>
        )}
        {activeSection === "profile" && (
          <Perfil
            userData={userData}
            API_URL={API_URL}
            token={token}
          />
        )}
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <h2 className="sidebar-title">Escuela de Misiones</h2>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <button
                  className={activeSection === "home" ? "active" : ""}
                  onClick={() => {
                    setActiveSection("home");
                    setIsSidebarOpen(false);
                  }}
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  className={activeSection === "materias" ? "active" : ""}
                  onClick={() => {
                    setActiveSection("materias");
                    setIsSidebarOpen(false);
                  }}
                >
                  Materias
                </button>
              </li>
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
                <Link to="/">Cerrar Sesión</Link>
              </li>
            </ul>
          </nav>

          {/* Barra de navegación inmediatamente debajo del sidebar */}
          <nav className>
            <div className="container">
              {/* Logo con imagen */}
              <img
                src="/logo.png"
                alt="Escuela de Misiones"
                style={{ height: "150px", marginRight: "5px" }}
              />
            </div>
          </nav>
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;

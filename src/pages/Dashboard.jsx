import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LibretaIndividual from "../components/LibretaIndividual";
import Perfil from "../components/Perfil";
import LogoutButton from "../components/LogoutButton";
import Spinner from "../components/Spinner";
import "../Dashboard.css";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [userData, setUserData] = useState(null);
  const [availableMaterias, setAvailableMaterias] = useState([]);
  const [inscriptionStatus, setInscriptionStatus] = useState({});
  const sidebarRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [loadingInscripcion, setLoadingInscripcion] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [alumnoId, setAlumnoId] = useState(null); // ✅ Definido como estado
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("Por favor, inicia sesión.");
      navigate("/login");
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
        setLoading(false);
        setAlumnoId(data._id);
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
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
        setAvailableMaterias(
          data.filter((materia) => materia.isEnrollmentOpen)
        );

        // Verificar estado de inscripción para cada materia
        data.forEach((materia) => fetchInscriptionStatus(materia._id));
      } catch (error) {
        console.error("Error al cargar las materias disponibles:", error);
      }
    };

    const fetchInscriptionStatus = async (materiaId) => {
      if (!materiaId) return;
      setLoadingInscripcion(true);

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
          [materiaId]: data.status,
        }));
      } catch (error) {
        console.error("Error al obtener estado de inscripción:", error);
      } finally {
        setLoadingInscripcion(false); // ✅ Ocultar Spinner al finalizar
      }
    };

    fetchUserData();
    fetchAvailableMaterias();
  }, [token, navigate]);

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

      // Actualizar estado de inscripción en el frontend
      setInscriptionStatus((prev) => ({
        ...prev,
        [materiaId]: "Pendiente",
      }));
    } catch (error) {
      console.error("Error al solicitar inscripción:", error);
      alert("Error al solicitar inscripción");
    }
  };

  // ✅ Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Cierra el menú al hacer clic en una opción
  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
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
            {/* <li>
              <button
                className={activeSection === "home" ? "active" : ""}
                onClick={() => handleSectionChange("home")}
              >
                Inicio
              </button>
            </li> */}
            <li>
              <button
                className={activeSection === "materias" ? "active" : ""}
                onClick={() => handleSectionChange("materias")}
              >
                Materias
              </button>
            </li>
            <li>
              <button
                className={activeSection === "libreta" ? "active" : ""}
                onClick={() => handleSectionChange("libreta")}
              >
                Libreta
              </button>
            </li>
            <li>
              <button
                className={activeSection === "profile" ? "active" : ""}
                onClick={() => handleSectionChange("profile")}
              >
                Perfil
              </button>
            </li>
            <LogoutButton />
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {/* {activeSection === "home" && (
          <div className="home-section">
            <h1>Bienvenido {userData ? userData.name : "Cargando..."}</h1>
            <div className="image-container">
              <img
                src="/fotos/mes.jpg"
                alt="Imagen de mes"
                className="responsive-image"
              />
            </div>
          </div>
        )} */}

        {activeSection === "libreta" && (
          <LibretaIndividual
            alumnoId={userData?._id}
            nombre={userData?.name}
            legajo={userData?.legajo}
          />
        )}

        {activeSection === "materias" && (
          <section>
            <h1>Materias Disponibles</h1>

            {loadingMaterias ? (
              <Spinner />
            ) : (
              <div className="materias-container">
                {availableMaterias.map((materia) => {
                  const estadoInscripcion =
                    inscriptionStatus[materia._id] || "No Inscrito";
                  const userId = userData?._id;

                  return (
                    <div
                      key={materia._id}
                      className="materia-card"
                    >
                      <h3 className="materia-title">{materia.name}</h3>
                      <p className="materia-level">{materia.level}</p>
                      <p className="materia-profesor">
                        Profesor:{" "}
                        {materia.professor?.name || "Sin profesor asignado"}
                      </p>

                      {/* Estado de inscripción con colores */}
                      <div className="inscription-status">
                        {estadoInscripcion === "Pendiente" && (
                          <span className="badge badge-warning">Pendiente</span>
                        )}
                        {estadoInscripcion === "Aceptado" && (
                          <span className="badge badge-success">Inscripto</span>
                        )}
                        {estadoInscripcion === "Rechazado" && (
                          <span className="badge badge-danger">Rechazado</span>
                        )}
                        {estadoInscripcion === "No Inscrito" && (
                          <span className="badge badge-secondary">
                            No Inscrito
                          </span>
                        )}
                      </div>

                      {/* Botón de acceso siempre visible */}
                      <div className="materia-action">
                        <Link
                          to={`/materia/${materia._id}`}
                          state={{ userId, estadoInscripcion }}
                          className="btn-materia"
                        >
                          Acceder
                        </Link>
                      </div>

                      {/* Botón de inscripción oculto si está Aceptado */}
                      <div className="materia-action">
                        {estadoInscripcion === "Aceptado" ? (
                          <span className="badge bg-success text-white">
                            Ya estás inscripto
                          </span>
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
                })}
              </div>
            )}
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

export default Dashboard;

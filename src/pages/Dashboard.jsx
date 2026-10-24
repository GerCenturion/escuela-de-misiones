import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LibretaIndividual from "../components/LibretaIndividual";
import Perfil from "../components/Perfil";
import LogoutButton from "../components/LogoutButton";
import Spinner from "../components/Spinner";
import "../Dashboard.css";

// Helper para detectar campos vacíos, nulos, guiones o placeholders ("No especificada", etc.)
const isCampoIncompleto = (valor) => {
  if (valor === undefined || valor === null) return true;
  const limpio = String(valor).trim().toLowerCase();

  const valoresInvalidos = [
    "",
    "-",
    "--",
    "no especificada",
    "no especificado",
    "no asignado",
    "sin asignar",
    "null",
    "undefined",
  ];

  return valoresInvalidos.includes(limpio);
};

// 📌 Validador de correo: invalida correos por defecto (@sinemail.com, @noemail.com)
const isEmailInvalido = (email) => {
  if (!email) return true;
  const limpio = String(email).trim().toLowerCase();
  
  if (
    limpio === "" ||
    limpio.includes("@sinemail.com") ||
    limpio.includes("@noemail.com") ||
    !limpio.includes("@") ||
    !limpio.includes(".")
  ) {
    return true;
  }
  return false;
};

// Comprobar si faltan datos esenciales del alumno (incluyendo email real)
const tienePerfilIncompleto = (user) => {
  if (!user) return false;
  // Solo se exige a los alumnos. Administradores y profesores quedan exentos.
  if (user.role === "admin" || user.role === "profesor") {
    return false;
  }

  // 1. Validar correo electrónico real
  if (isEmailInvalido(user.email)) {
    return true;
  }

  // 2. Validar resto de campos obligatorios
  const camposObligatorios = [
    user.name,
    user.birthdate,
    user.address,
    user.phoneArea,
    user.phoneNumber,
    user.civilStatus,
    user.profession,
    user.church,
    user.reason,
  ];

  return camposObligatorios.some(isCampoIncompleto);
};

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("materias");
  const [userData, setUserData] = useState(null);
  const [availableMaterias, setAvailableMaterias] = useState([]);
  const [inscriptionStatus, setInscriptionStatus] = useState({});
  const sidebarRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [loadingInscripcion, setLoadingInscripcion] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [alumnoId, setAlumnoId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [showSpinner, setShowSpinner] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);

  // 🔒 Estado de bloqueo obligatorio de perfil
  const [isProfileLocked, setIsProfileLocked] = useState(false);

  const handleButtonClick = async (materiaId) => {
    if (loadingButton) return;
    setLoadingButton(true);

    await handleInscripcion(materiaId);

    setTimeout(() => {
      setLoadingButton(false);
    }, 4000);
  };

  useEffect(() => {
    if (!loadingMaterias) {
      setShowSpinner(true);
      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loadingMaterias]);

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
        setAlumnoId(data._id);

        // 🔒 Verificar si el alumno tiene perfil incompleto o email por defecto
        if (tienePerfilIncompleto(data)) {
          setIsProfileLocked(true);
          setActiveSection("profile"); // Forzar apertura de la sección de perfil
        } else {
          setIsProfileLocked(false);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        setLoading(false);
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
        setTimeout(() => {
          setLoadingInscripcion(false);
        }, 5000);
      }
    };

    fetchUserData();
    fetchAvailableMaterias();
  }, [token, navigate, API_URL]);

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

  const handleSectionChange = (section) => {
    if (isProfileLocked && section !== "profile") {
      alert("Debes completar todos tus datos de perfil (incluyendo un email real) para acceder a las materias y a la libreta.");
      return;
    }

    setActiveSection(section);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  // Callback ejecutado cuando el usuario guarda su perfil con éxito en Perfil.jsx
  const handleProfileUpdated = (usuarioActualizado) => {
    setUserData(usuarioActualizado);
    setIsProfileLocked(false);
    setActiveSection("materias");
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

      <aside ref={sidebarRef} className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <h2 className="sidebar-title">Escuela de Misiones</h2>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                className={activeSection === "materias" ? "active" : ""}
                onClick={() => handleSectionChange("materias")}
                disabled={isProfileLocked}
                style={isProfileLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                title={isProfileLocked ? "Completa tu perfil para acceder" : ""}
              >
                Materias {isProfileLocked && "🔒"}
              </button>
            </li>
            <li>
              <button
                className={activeSection === "libreta" ? "active" : ""}
                onClick={() => handleSectionChange("libreta")}
                disabled={isProfileLocked}
                style={isProfileLocked ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                title={isProfileLocked ? "Completa tu perfil para acceder" : ""}
              >
                Libreta {isProfileLocked && "🔒"}
              </button>
            </li>
            <li>
              <button
                className={activeSection === "profile" ? "active" : ""}
                onClick={() => handleSectionChange("profile")}
              >
                Perfil {isProfileLocked && "⚠️ (Requerido)"}
              </button>
            </li>
            <LogoutButton />
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {/* Banner de advertencia superior mientras esté bloqueado */}
        {isProfileLocked && activeSection === "profile" && (
          <div className="alert alert-warning mb-4 shadow-sm text-center" style={{ borderRadius: "8px" }}>
            <strong>Atención:</strong> Tienes datos pendientes, no especificados o un correo temporal en tu perfil. Completa todos los campos obligatorios para desbloquear el campus.
          </div>
        )}

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

            {loadingMaterias || showSpinner ? (
              <Spinner />
            ) : (
              <div className="materias-container">
                {availableMaterias.map((materia) => {
                  const estadoInscripcion =
                    inscriptionStatus[materia._id] || "No Inscrito";
                  const userId = userData?._id;

                  return (
                    <div key={materia._id} className="materia-card">
                      <h3 className="materia-title">{materia.name}</h3>
                      <p className="materia-level">{materia.level}</p>
                      <p className="materia-profesor">
                        Profesor:{" "}
                        {materia.professor?.name || "Sin profesor asignado"}
                      </p>

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

                      <div className="materia-action">
                        <Link
                          to={
                            estadoInscripcion === "Aceptado"
                              ? `/materia/${materia._id}`
                              : `/oyente/${materia._id}`
                          }
                          state={{ userId, estadoInscripcion }}
                          className="btn-materia"
                        >
                          Acceder
                        </Link>
                      </div>

                      <div className="materia-action">
                        {estadoInscripcion === "Aceptado" ? (
                          <span className="badge bg-success text-white">
                            Ya estás inscripto
                          </span>
                        ) : (
                          <button
                            className="btn-materia"
                            disabled={
                              estadoInscripcion === "Pendiente" || loadingButton
                            }
                            onClick={() => handleButtonClick(materia._id)}
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
            onProfileComplete={handleProfileUpdated}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
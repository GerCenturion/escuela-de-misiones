import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [userData, setUserData] = useState(null);
  const [availableMaterias, setAvailableMaterias] = useState([]);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar las materias disponibles");
        }

        const data = await response.json();
        const filteredMaterias = data.filter(
          (materia) => materia.isEnrollmentOpen
        );
        setAvailableMaterias(filteredMaterias);
      } catch (error) {
        setError("Error al cargar las materias disponibles");
        console.error(error);
      }
    };

    fetchUserData();
    fetchAvailableMaterias();
  }, [token]);

  const verificarEstadoInscripcion = async (materiaId) => {
    try {
      const response = await fetch(
        `${API_URL}/materias/${materiaId}/estado-inscripcion`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al verificar estado de inscripción");
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error("Error al verificar estado de inscripción:", error.message);
      return null;
    }
  };

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

      setAvailableMaterias((prevMaterias) =>
        prevMaterias.map((materia) =>
          materia._id === materiaId
            ? { ...materia, inscripcionStatus: "Pendiente" }
            : materia
        )
      );
    } catch (error) {
      console.error("Error al solicitar inscripción:", error.message);
      alert("Error al solicitar inscripción");
    }
  };

  const MateriaItem = ({ materia }) => {
    const [estadoInscripcion, setEstadoInscripcion] = useState(null);

    useEffect(() => {
      const obtenerEstado = async () => {
        const estado = await verificarEstadoInscripcion(materia._id);
        setEstadoInscripcion(estado);
      };

      obtenerEstado();
    }, [materia._id]);

    return (
      <li className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h5>{materia.name}</h5>
          <p>{materia.level}</p>
          <small>
            Profesor: {materia.professor?.name || "Sin profesor asignado"}
          </small>
          <div className="mt-2">
            {estadoInscripcion && (
              <span
                className={`badge ${
                  estadoInscripcion === "Pendiente"
                    ? "bg-warning text-dark"
                    : estadoInscripcion === "Aceptado"
                    ? "bg-success"
                    : estadoInscripcion === "Rechazado"
                    ? "bg-danger"
                    : "bg-secondary"
                }`}
              >
                {estadoInscripcion}
              </span>
            )}
          </div>
        </div>
        {estadoInscripcion === "Aceptado" ? (
          <Link
            to={`/materia/${materia._id}`}
            className="btn btn-primary btn-sm"
          >
            Acceder a la materia
          </Link>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            disabled={estadoInscripcion === "Pendiente"}
            onClick={() => handleInscripcion(materia._id)}
          >
            {estadoInscripcion === "Pendiente"
              ? "Solicitud Enviada"
              : "Solicitar Inscripción"}
          </button>
        )}
      </li>
    );
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Campus Virtual</h2>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                className={activeSection === "home" ? "active" : ""}
                onClick={() => setActiveSection("home")}
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                className={activeSection === "materias" ? "active" : ""}
                onClick={() => setActiveSection("materias")}
              >
                Materias Disponibles
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

      <main className="main-content">
        {activeSection === "home" && (
          <section>
            <h1>Bienvenido {userData ? userData.name : "Cargando..."}</h1>
          </section>
        )}

        {activeSection === "materias" && (
          <section>
            <h1>Materias Disponibles para Inscripción</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {availableMaterias.length > 0 ? (
              <ul className="list-group">
                {availableMaterias.map((materia) => (
                  <MateriaItem
                    key={materia._id}
                    materia={materia}
                  />
                ))}
              </ul>
            ) : (
              <p>No hay materias disponibles en este momento.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

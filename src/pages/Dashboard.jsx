import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [userData, setUserData] = useState(null); // Estado para guardar los datos del usuario

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Por favor, inicia sesión para acceder al dashboard.");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/usuarios/me", {
          method: "GET",
          headers: {
            Authorization: token, // Enviar el token en el encabezado
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

    fetchUserData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Menú lateral */}
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
                className={activeSection === "materials" ? "active" : ""}
                onClick={() => setActiveSection("materials")}
              >
                Materiales de Estudio
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
            <h1>
              Bienvenido {userData ? userData.name : "Cargando..."} al Campus
              Virtual
            </h1>
            <p>
              Aquí puedes acceder a tus materiales, revisar tu perfil y
              mantenerte al día con la información del seminario.
            </p>
          </section>
        )}
        {activeSection === "materials" && (
          <section>
            <h1>Materiales de Estudio</h1>
            <ul>
              <li>
                <a
                  href="/path/to/pdf1.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tema 1: Introducción a las Misiones
                </a>
              </li>
              <li>
                <a
                  href="/path/to/video1.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Clase 1: La Gran Comisión
                </a>
              </li>
            </ul>
          </section>
        )}
        {activeSection === "profile" && (
          <section>
            <h1>Mi Perfil</h1>
            {userData ? (
              <ul>
                <li>Nombre: {userData.name}</li>
                <li>Email: {userData.email}</li>
                <li>DNI: {userData.dni}</li>
                {/* Agregar más datos si es necesario */}
              </ul>
            ) : (
              <p>Cargando información del perfil...</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");

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
            <h1>Bienvenido al Campus Virtual</h1>
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
            <p>Aquí puedes actualizar tu información personal.</p>
            <ul>
              <li>Nombre: Gerson Centurión</li>
              <li>Email: gercenturion@example.com</li>
              <li>DNI: 37468369</li>
              {/* Puedes agregar más datos según la estructura */}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

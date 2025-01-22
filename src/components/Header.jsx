import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Logo con imagen */}
        <Link
          className="navbar-brand d-flex align-items-center"
          to="/"
        >
          <img
            src="/logo.png"
            alt="Escuela de Misiones"
            style={{ height: "40px", marginRight: "10px" }}
          />
          <span className="fw-bold">Escuela de Misiones</span>
        </Link>

        {/* Botón Hamburguesa */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navegación */}
        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/about"
                onClick={() => setIsOpen(false)}
              >
                Sobre Nosotros
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/program"
                onClick={() => setIsOpen(false)}
              >
                Programa
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/registration"
                onClick={() => setIsOpen(false)}
              >
                Inscripción
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/contact"
                onClick={() => setIsOpen(false)}
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;

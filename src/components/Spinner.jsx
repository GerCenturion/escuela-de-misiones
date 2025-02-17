import React from "react";

const Spinner = () => {
  return (
    <div className="spinner-container">
      <img
        src="/logo.png"
        alt="Cargando..."
        className="spinner-logo"
      />
      <p className="spinner-text">Cargando...</p>
    </div>
  );
};

export default Spinner;

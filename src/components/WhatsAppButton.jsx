import React from "react";

const WhatsAppButton = () => {
  const phoneNumber = "5493874205520"; // Número de WhatsApp
  const message =
    "¡Hola! Me gustaría obtener más información sobre la Escuela de Misiones."; // Mensaje predefinido

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#25D366",
        color: "#fff",
        padding: "15px",
        borderRadius: "50%",
        textAlign: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Usando ícono de WhatsApp desde Font Awesome */}
      <i
        className="fab fa-whatsapp"
        style={{ fontSize: "24px", color: "white" }}
      ></i>
    </a>
  );
};

export default WhatsAppButton;

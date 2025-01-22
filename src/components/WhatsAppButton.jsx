import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"; // Ícono de WhatsApp

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
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
      }}
    >
      {/* Usando el ícono de FontAwesome */}
      <FontAwesomeIcon
        icon={faWhatsapp}
        size="2x"
        style={{ color: "white" }}
      />
    </a>
  );
};

export default WhatsAppButton;

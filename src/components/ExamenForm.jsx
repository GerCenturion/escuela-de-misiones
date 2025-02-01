import React, { useState } from "react";

const ExamenForm = ({ materiaId, onClose }) => {
  const [titulo, setTitulo] = useState(""); // Estado para el título
  const [preguntas, setPreguntas] = useState([{ texto: "", puntuacion: "" }]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const totalPuntos = preguntas.reduce(
    (sum, pregunta) => sum + pregunta.puntuacion,
    0
  );

  const agregarPregunta = () => {
    if (totalPuntos >= 10) {
      alert(
        "No puedes agregar más preguntas, ya alcanzaste el límite de 10 puntos."
      );
      return;
    }
    setPreguntas([...preguntas, { texto: "", puntuacion: "" }]);
  };

  const actualizarPregunta = (index, campo, valor) => {
    const nuevasPreguntas = [...preguntas];

    if (campo === "puntuacion") {
      const nuevoTotal =
        totalPuntos - nuevasPreguntas[index].puntuacion + Number(valor);
      if (nuevoTotal > 10) {
        alert("La suma total de puntos no puede ser mayor que 10.");
        return;
      }
    }

    nuevasPreguntas[index][campo] =
      campo === "puntuacion" ? Number(valor) : valor;
    setPreguntas(nuevasPreguntas);
  };

  const eliminarPregunta = (index) => {
    const nuevasPreguntas = preguntas.filter((_, i) => i !== index);
    setPreguntas(nuevasPreguntas);
  };

  const enviarExamen = async () => {
    if (!titulo.trim()) {
      alert("El título del examen es obligatorio.");
      return;
    }

    if (totalPuntos !== 10) {
      alert("La suma total de los puntos debe ser exactamente 10.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/examenes/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ materia: materiaId, titulo, preguntas }),
      });

      if (!response.ok) throw new Error("Error al crear el examen");

      alert("Examen creado con éxito");
      setPreguntas([{ texto: "", puntuacion: 0 }]);
      setTitulo(""); // Resetear título
      onClose(); // Cerrar modal después de enviar
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* <div className="modal-header">
          <h5 className="modal-title">Crear Examen</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div> */}
        <div className="modal-body">
          <label>
            <strong>Título del Examen</strong>
          </label>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Ingrese el título del examen"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <p>
            <strong>Puntos asignados:</strong> {totalPuntos} / 10
          </p>

          {preguntas.map((pregunta, index) => (
            <div
              key={index}
              className="mb-3"
            >
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Pregunta"
                value={pregunta.texto}
                onChange={(e) =>
                  actualizarPregunta(index, "texto", e.target.value)
                }
              />
              <label>Puntos</label>
              <input
                type="number"
                className="form-control"
                placeholder="Puntos"
                value={pregunta.puntuacion}
                min="0"
                max="10"
                onChange={(e) =>
                  actualizarPregunta(index, "puntuacion", e.target.value)
                }
              />
              <button
                className="btn btn-danger mt-2"
                onClick={() => eliminarPregunta(index)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-primary me-2"
            onClick={agregarPregunta}
            disabled={totalPuntos >= 10}
          >
            Agregar Pregunta
          </button>
          <button
            className="btn btn-success"
            onClick={enviarExamen}
            disabled={totalPuntos !== 10}
          >
            Enviar Examen
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamenForm;

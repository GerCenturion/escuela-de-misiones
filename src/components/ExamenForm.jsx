import React, { useState } from "react";

const ExamenForm = ({ materiaId, onClose }) => {
  const [titulo, setTitulo] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [preguntas, setPreguntas] = useState([
    { texto: "", tipo: "desarrollo", opciones: [] },
  ]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const agregarPregunta = () => {
    setPreguntas([
      ...preguntas,
      { texto: "", tipo: "desarrollo", opciones: [] },
    ]);
  };

  const eliminarPregunta = (index) => {
    if (preguntas.length === 1) {
      alert("Debe haber al menos una pregunta en el examen.");
      return;
    }
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas.splice(index, 1);
    setPreguntas(nuevasPreguntas);
  };

  const actualizarPregunta = (index, campo, valor) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[index][campo] = valor;
    setPreguntas(nuevasPreguntas);
  };

  const agregarOpcion = (index) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[index].opciones.push({ texto: "" });
    setPreguntas(nuevasPreguntas);
  };

  const actualizarOpcion = (pIndex, oIndex, campo, valor) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[pIndex].opciones[oIndex][campo] = valor;
    setPreguntas(nuevasPreguntas);
  };

  const eliminarOpcion = (pIndex, oIndex) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[pIndex].opciones.splice(oIndex, 1);
    setPreguntas(nuevasPreguntas);
  };

  const enviarExamen = async () => {
    if (!titulo.trim()) {
      alert("El título del examen es obligatorio.");
      return;
    }

    if (!fechaLimite) {
      alert("La fecha límite es obligatoria.");
      return;
    }

    // 📌 Convertir la fecha seleccionada al **uso horario de Argentina (GMT-3)**
    const fechaSeleccionada = new Date(`${fechaLimite}T23:59:59.999-03:00`); // ✅ Fijar GMT-3
    const fechaFinal = fechaSeleccionada.toISOString(); // ✅ Convertir a formato ISO UTC para guardar

    try {
      const response = await fetch(`${API_URL}/examenes/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          materia: materiaId,
          titulo,
          fechaLimite: fechaFinal, // 📌 Enviar la fecha correctamente formateada
          preguntas,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear el examen: ${errorText}`);
      }

      alert("Examen creado con éxito");
      setPreguntas([{ texto: "", tipo: "desarrollo", opciones: [] }]);
      setTitulo("");
      onClose();
    } catch (error) {
      console.error("❌ Error al crear el examen:", error);
      alert("Hubo un problema al crear el examen.");
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

          {/* 📌 Campo para la fecha límite con uso horario de Argentina */}
          <label>Fecha Límite</label>
          <input
            type="date"
            className="form-control"
            value={
              fechaLimite
                ? new Date(fechaLimite).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => setFechaLimite(e.target.value)}
          />

          {preguntas.map((pregunta, index) => (
            <div
              key={index}
              className="mb-3 border p-3 rounded"
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

              <label>Tipo de pregunta</label>
              <select
                className="form-control"
                value={pregunta.tipo}
                onChange={(e) =>
                  actualizarPregunta(index, "tipo", e.target.value)
                }
              >
                <option value="desarrollo">Desarrollo</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="audio">Audio</option>
              </select>

              {pregunta.tipo === "multiple-choice" && (
                <div>
                  <h5>Opciones</h5>
                  {pregunta.opciones.map((opcion, oIndex) => (
                    <div
                      key={oIndex}
                      className="d-flex gap-2"
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Texto de la opción"
                        value={opcion.texto}
                        onChange={(e) =>
                          actualizarOpcion(
                            index,
                            oIndex,
                            "texto",
                            e.target.value
                          )
                        }
                      />
                      <button
                        className="btn btn-danger"
                        onClick={() => eliminarOpcion(index, oIndex)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => agregarOpcion(index)}
                  >
                    Agregar Opción
                  </button>
                </div>
              )}

              {/* Botón para eliminar pregunta */}
              <button
                className="btn btn-danger mt-2"
                onClick={() => eliminarPregunta(index)}
              >
                🗑 Eliminar Pregunta
              </button>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <button
          className="btn btn-primary me-2"
          onClick={agregarPregunta}
        >
          ➕ Agregar Pregunta
        </button>
        <button
          className="btn btn-success"
          onClick={enviarExamen}
        >
          📤 Enviar Examen
        </button>
      </div>
    </div>
  );
};

export default ExamenForm;

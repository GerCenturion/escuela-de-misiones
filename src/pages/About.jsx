import React from "react";

const About = () => {
  return (
    <section className="about-container">
      <h2 className="about-title">📚 Modalidad de Estudio</h2>
      <p>
        Nuestro <strong>Seminario Bíblico</strong> cuenta con un{" "}
        <strong>Campus Virtual</strong> que permite a los estudiantes acceder a
        todas las herramientas necesarias para su formación. A través de esta
        plataforma, los alumnos pueden:
      </p>

      <ul className="about-list">
        <li>
          📝 <strong>Inscribirse</strong> en las materias disponibles.
        </li>
        <li>
          📚 <strong>Acceder</strong> al material de estudio.
        </li>
        <li>
          🎥 <strong>Ver</strong> clases en video y material complementario.
        </li>
        <li>
          ✍️ <strong>Realizar</strong> las tareas correspondientes.
        </li>
        <li>
          📊 <strong>Aprobar</strong> la materia realizando todas las tareas semanalmente.
        </li>
      </ul>

      <h3 className="about-subtitle">🗓️ Funcionamiento</h3>
      <p>
        📌 <strong>Calendario Académico:</strong> Las materias se dictan de{" "}
        <strong>marzo a noviembre</strong> de cada año. Cada una inicia el{" "}
        <strong>día 1º del mes</strong> y finaliza el{" "}
        <strong>último día del mismo</strong>.
      </p>

      <p>
        📌 <strong>Evaluaciones:</strong> Los alumnos deben completar sus
        tareas a través del Campus Virtual antes de la fecha límite.
      </p>

      <h3 className="about-subtitle">📝 Inscripción</h3>
      <p>
        Para comenzar, los estudiantes deben registrarse en el{" "}
        <strong>Campus Virtual</strong> y solicitar la inscripción en las
        materias de su interés.
      </p>

      <h3 className="about-subtitle">💰 Costos y Pagos</h3>
      <p>
        <strong>✅ No se cobra inscripción.</strong> El costo por materia es:
      </p>
      <ul className="about-list">
        <li>
          🧍 <strong>$8.000</strong> por estudiante individual.
        </li>
        <li>
          👫 <strong>$13.000</strong> por matrimonio.
        </li>
      </ul>

      <p>
        Los pagos pueden realizarse mediante{" "}
        <strong>depósito, transferencia bancaria o MercadoPago</strong>. Se paga
        por materia, y <strong>no es obligatorio abonar si no se cursa</strong>{" "}
        en un mes específico.
      </p>

      <p className="about-footer">
        📩 Para más información, no dude en <strong>consultarnos.</strong>
      </p>
    </section>
  );
};

export default About;

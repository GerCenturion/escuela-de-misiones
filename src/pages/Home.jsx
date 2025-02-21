import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../HomePage.css";

const HomePage = () => {
  return (
    <div className="container mt-5">
      {/* Carrusel de Imágenes */}
      <div
        id="homeCarousel"
        className="carousel slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="/fotos/1.jpeg"
              className="d-block w-100"
              alt="Slide 1"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/2.jpeg"
              className="d-block w-100"
              alt="Slide 2"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/3.jpeg"
              className="d-block w-100"
              alt="Slide 3"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/4.jpeg"
              className="d-block w-100"
              alt="Slide 4"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/5.jpeg"
              className="d-block w-100"
              alt="Slide 5"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/6.jpeg"
              className="d-block w-100"
              alt="Slide 6"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/7.jpeg"
              className="d-block w-100"
              alt="Slide 7"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/8.jpeg"
              className="d-block w-100"
              alt="Slide 8"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/9.jpeg"
              className="d-block w-100"
              alt="Slide 9"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/10.jpeg"
              className="d-block w-100"
              alt="Slide 10"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/11.jpeg"
              className="d-block w-100"
              alt="Slide 11"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/12.jpeg"
              className="d-block w-100"
              alt="Slide 12"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/fotos/13.jpeg"
              className="d-block w-100"
              alt="Slide 13"
            />
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#homeCarousel"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#homeCarousel"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>

      {/* Contenido Informativo */}
      <section className="mt-5">
        <h2 className="text-center">PRESENTE</h2>
        <p className="text-justify">
          Le saludamos en el nombre del Señor Jesús y le invitamos a{" "}
          <strong>
            Capacitarse para un mejor y más eficiente servicio al Señor
          </strong>
          .
        </p>
        <p className="text-justify">
          Nuestro SEMINARIO BÍBLICO <strong>“ESCUELA DE MISIONES”</strong> le
          ofrece prepararse bíblicamente con una orientación Misionera y de
          expansión del Evangelio con la visión desde “casa”, “…hasta los
          confines de la tierra”.
        </p>
        <p className="text-justify">
          <strong>Conforme al Plan de Estudios presente en este folleto</strong>
          , el curso es de un período de (4 cuatro) años en el que materias por
          año, desde Marzo a Noviembre, haciendo un total de (36) treinta y seis
          materias.
        </p>
        <p className="text-justify">
          Cada materia se dicta en una semana por mes de Lunes a Viernes, (3
          tres) horas diarias, haciendo (5 cinco) horas mensuales, completando
          el total de (14) catorce horas (quincenas cuatrimestrales) por año.
        </p>
        <p className="text-justify">
          Al completar todo el Plan de Estudios (4 años) se entrega el{" "}
          <strong>Certificado de Estudios Bíblicos y Teológicos.</strong>
        </p>

        <h2 className="text-center mt-5">OBJETIVOS</h2>
        <p className="text-justify">
          Nuestro objetivo es la preparación integral del alumno en lo
          espiritual y académico para un mejor desenvolvimiento social.
        </p>
        <p className="text-justify">
          En cuanto a su espiritualidad el SEMINARIO BÍBLICO{" "}
          <strong>“ESCUELA DE MISIONES”</strong>, a través del estudio
          sistemático de la palabra de Dios en manera profunda y relevante, lo
          capacita para un mejor conocimiento y relación con el Creador.
        </p>
        <p className="text-justify">
          Al inscribirse, sin costo de inscripción, el alumno recibe la
          <strong> “SOLICITUD DE INSCRIPCIÓN”</strong> debidamente firmada y
          cumplimentada ante la firma de Autorización de su Pastor y el
          <strong> “RECLAMO INTERNO”</strong> donde encontrará el reglamento
          académico administrativo.
        </p>
        <p className="text-center mt-4">
          <strong>“ESTE ES EL TIEMPO DE DIOS”</strong>
        </p>

        <div className="text-end">
          <p>
            <strong>MIGUEL ÁNGEL ZAMPERDI</strong>
            <br />
            PASTOR <br />
            DIRECTOR
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

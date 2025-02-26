import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../HomePage.css";

const HomePage = () => {
  return (
    <div className="about-container">
      {/* Breve Historial */}
      <section className="mt-5">
        <h2 className="text-center">HISTORIA</h2>
        <p>
          Nuestro Seminario Bíblico dio comienzos en el mes de marzo del año
          1993 en la ciudad de San Nicolás, Provincia de Buenos Aires, sede
          central de nuestra Institución, extendiéndose rápidamente a diferentes
          ciudades del interior como Corrientes, Rosario (Sta. Fe), Pirané
          (Formosa), Aguas Calientes (Jujuy), Güemes (Salta), Salto Argentino
          (Bs. As.), Salta (Capital), Baradero (Bs. As.) y Arroyo Seco (Sta. Fe)
          y en la localidad de La Unión en el Dpto. Rivadavia Banda Sur en el
          chaco salteño.
        </p>
      </section>

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
      {/* Objetivos */}
      <section className="mt-5">
        <h2 className="text-center">OBJETIVOS</h2>
        <p className="text-justify">
          <em>
            Nuestro objetivo es la preparación integral del alumno en lo
            espiritual y académico para un mejor desenvolvimiento social.
          </em>
        </p>
        <p>
          En cuanto a su espiritualidad el SEMINARIO BÍBLICO{" "}
          <strong>“ESCUELA DE MISIONES”</strong>, a través del estudio
          sistemático de la Biblia prepara al alumno para un mejor conocimiento
          y relación con el Creador.
        </p>
        <p>
          Referente a lo académico gracias a la cantidad de horas cátedras
          implementadas llevamos al alumno a un conocimiento exhaustivo y
          sistemático de la Biblia y su verdadera importancia en el desarrollo
          personal, familiar y social.
        </p>
        <p>
          Todo ello con el fin de lograr que el alumno sea un ciudadano
          integrado a la sociedad en la cual se desenvuelve y a la vez sea de
          aporte positivo y significativo en la misma al Servicio del Señor.
        </p>
        <p>
          En pos de estos objetivos quienes dictan las materias correspondientes
          son Siervos con idoneidad, capacitados en pleno ejercicio de sus
          funciones ministeriales.
        </p>
        <p>
          Nuestro SEMINARIO BÍBLICO <strong>“ESCUELA DE MISIONES”</strong> le
          ofrece prepararse bíblicamente con una orientación Misionera y de
          expansión del Evangelio con la visión desde “casa”, “…hasta los
          confines de la tierra”.
        </p>
        <p>
          Conforme al Plan de Estudios el curso es de un período de 4 (cuatro)
          años con 9 (nueve) materias por año, desde Marzo a Noviembre, haciendo
          un total de 36 (treinta y seis) materias.
        </p>
        <p>
          Al completar todo el Plan de Estudios (4 años) se entrega al alumno el{" "}
          <strong>Certificado de Estudios Bíblicos y Teológicos.</strong>
        </p>
      </section>
      <section>
        <p className="text-center mt-4">
          <strong>“ESTE ES EL TIEMPO DE DIOS”</strong>
        </p>
        {/* Invitación a Inscribirse */}
        <section className="mt-5 text-center">
          <h2>¡Inscríbete Ahora!</h2>
          <p>
            ¿Quieres formar parte de nuestra Escuela de Misiones? Da el primer
            paso en tu camino de preparación espiritual y académica.
          </p>
          <Link
            to="/registration"
            className="btn btn-primary"
          >
            Inscribirme
          </Link>
        </section>
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

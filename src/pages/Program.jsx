import React from "react";

const Program = () => {
  return (
    <section className="container py-5">
      <h1 className="text-center mb-4">Plan de Estudios</h1>
      <div className="row">
        {/* Nivel Elemental */}
        <div className="col-md-6 col-lg-3 mb-4">
          <h3 className="text-primary text-uppercase">Elemental</h3>
          <ul className="list-group">
            <li className="list-group-item">
              Evangelización y Crecimiento “A”
            </li>
            <li className="list-group-item">
              Evangelización y Crecimiento “B”
            </li>
            <li className="list-group-item">Panorama Bíblico “A”</li>
            <li className="list-group-item">Panorama Bíblico “B”</li>
            <li className="list-group-item">
              Las Bases Bíblicas de la Evangelización Mundial
            </li>
            <li className="list-group-item">
              Análisis Hechos de los Apóstoles “A”
            </li>
            <li className="list-group-item">
              Análisis Hechos de los Apóstoles “B”
            </li>
            <li className="list-group-item">Doctrinas Básicas “A”</li>
            <li className="list-group-item">Doctrinas Básicas “B”</li>
          </ul>
        </div>

        {/* Avanzado 1 */}
        <div className="col-md-6 col-lg-3 mb-4">
          <h3 className="text-primary text-uppercase">Avanzado 1</h3>
          <ul className="list-group">
            <li className="list-group-item">Análisis Pentateuco “A”</li>
            <li className="list-group-item">Análisis Pentateuco “B”</li>
            <li className="list-group-item">
              Análisis Epístolas a los Hebreos
            </li>
            <li className="list-group-item">Análisis Epístolas Romanos “A”</li>
            <li className="list-group-item">Análisis Epístolas Romanos “B”</li>
            <li className="list-group-item">Análisis Epístolas Paulinas “A”</li>
            <li className="list-group-item">Análisis Epístolas Paulinas “B”</li>
            <li className="list-group-item">
              Análisis Epístolas Generales “A”
            </li>
            <li className="list-group-item">
              Análisis Epístolas Generales “B”
            </li>
          </ul>
        </div>

        {/* Avanzado 2 */}
        <div className="col-md-6 col-lg-3 mb-4">
          <h3 className="text-primary text-uppercase">Avanzado 2</h3>
          <ul className="list-group">
            <li className="list-group-item">Análisis Apocalipsis “A”</li>
            <li className="list-group-item">Análisis Apocalipsis “B”</li>
            <li className="list-group-item">Bibliología I</li>
            <li className="list-group-item">Bibliología II</li>
            <li className="list-group-item">Análisis Libros Históricos “A”</li>
            <li className="list-group-item">Análisis Libros Históricos “B”</li>
            <li className="list-group-item">
              Análisis del Movimiento Cristiano Global
            </li>
            <li className="list-group-item">Análisis Libros Poéticos “A”</li>
            <li className="list-group-item">Análisis Libros Poéticos “B”</li>
          </ul>
        </div>

        {/* Avanzado 3 */}
        <div className="col-md-6 col-lg-3 mb-4">
          <h3 className="text-primary text-uppercase">Avanzado 3</h3>
          <ul className="list-group">
            <li className="list-group-item">Homilética “A”</li>
            <li className="list-group-item">Homilética “B”</li>
            <li className="list-group-item">
              Teología Pastoral y Liderazgo “A”
            </li>
            <li className="list-group-item">
              Teología Pastoral y Liderazgo “B”
            </li>
            <li className="list-group-item">Análisis Libros Proféticos “A”</li>
            <li className="list-group-item">Análisis Libros Proféticos “B”</li>
            <li className="list-group-item">Vida de Cristo “A”</li>
            <li className="list-group-item">Vida de Cristo “B”</li>
            <li className="list-group-item">Ocultismo y Liberación</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Program;

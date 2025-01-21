const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container text-center">
        {/* Información institucional en texto más pequeño */}
        <p
          className="mb-1"
          style={{ fontSize: "0.6rem" }}
        >
          Asociación Hermandad Cristiana Vida Abundante
        </p>
        <p
          className="mb-1"
          style={{ fontSize: "0.6rem" }}
        >
          Reg Nacional de Cultos Nº 1993 – Pers. Jur. Insp. Gral. Just. Nº
          18.438
        </p>
        <p
          className="mb-3"
          style={{ fontSize: "0.6rem" }}
        >
          Tte. Cnel. Petrecca N° 79 – 2900 – San Nicolás (Bs. As.)
        </p>

        {/* Derechos reservados */}
        <p
          className="mb-0"
          style={{ fontSize: "0.8rem" }}
        >
          &copy; {new Date().getFullYear()} SEMINARIO BÍBLICO “ESCUELA DE
          MISIONES” Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

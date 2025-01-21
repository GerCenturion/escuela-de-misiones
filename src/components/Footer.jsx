const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3">
      <div className="container text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Escuela de Misiones. Todos los
          derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

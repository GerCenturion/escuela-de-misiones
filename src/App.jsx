import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Program from "./pages/Program";
import Registration from "./pages/Registration";
import Contact from "./pages/Contact";
import WhatsAppButton from "./components/WhatsAppButton"; // Importación del botón

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/about"
              element={<About />}
            />
            <Route
              path="/program"
              element={<Program />}
            />
            <Route
              path="/registration"
              element={<Registration />}
            />
            <Route
              path="/contact"
              element={<Contact />}
            />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton /> {/* Botón flotante de WhatsApp */}
      </div>
    </Router>
  );
};

export default App;

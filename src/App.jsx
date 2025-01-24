import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Program from "./pages/Program";
import Registration from "./pages/Registration";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import EditUser from "./pages/EditUser";
import WhatsAppButton from "./components/WhatsAppButton";

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
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Ruta protegida para el dashboard de alumno */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Ruta protegida para el dashboard de admin */}
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/edit/:id"
              element={
                <PrivateRoute>
                  <EditUser />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </Router>
  );
};

export default App;

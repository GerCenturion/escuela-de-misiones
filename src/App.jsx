import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Program from "./pages/Program";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import ProfessorRoute from "./components/ProfessorRoute";
import EditUser from "./pages/EditUser";
import EditMateria from "./pages/EditMateria";
import CreateMateria from "./pages/CreateMateria";
import ProfessorMateriaPage from "./pages/ProfessorMateriaPage";
import AdminMateriaPage from "./pages/AdminMateriaPage";
import MateriaDetalle from "./pages/MateriaDetalle";
import ExamenCompletar from "./pages/ExamenCompletar";
import CorregirExamen from "./pages/CorregirExamen";
import ExamenRevisar from "./components/ExamenRevisar";
import RehacerExamen from "./pages/RehacerExamen";
import RecuperarContrasena from "./pages/RecuperarContrasena";
import WhatsAppButton from "./components/WhatsAppButton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = localStorage.getItem("token");

const App = () => {
  return (
    <Router>
      <div className="app">
        {/* Rutas con Header y Footer */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Header />
                <About />
                <Footer />
              </>
            }
          />
          <Route
            path="/program"
            element={
              <>
                <Header />
                <Program />
                <Footer />
              </>
            }
          />
          <Route
            path="/registration"
            element={
              <>
                <Header />
                <Registration />
                <Footer />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Header />
                <Login />
                <Footer />
              </>
            }
          />
          <Route
            path="/recuperar"
            element={
              <>
                <Header />
                <RecuperarContrasena />
                <Footer />
              </>
            }
          />
          {/* Rutas sin Header ni Footer */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/professor-dashboard"
            element={
              <ProfessorRoute>
                <ProfessorDashboard />
              </ProfessorRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          {/* Otras rutas */}
          <Route
            path="/materia/:id"
            element={<MateriaDetalle />}
          />
          <Route
            path="/examen/:examenId"
            element={<ExamenCompletar />}
          />
          <Route
            path="/corregir/:examenId"
            element={<CorregirExamen />}
          />
          <Route
            path="/revisar-examen/:examenId"
            element={<ExamenRevisar />}
          />
          <Route
            path="/examen/:examenId/rehacer"
            element={
              <RehacerExamen
                API_URL={API_URL}
                token={token}
              />
            }
          />

          <Route
            path="/admin/edit/:id"
            element={
              <AdminRoute>
                <EditUser />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/materias/edit/:id"
            element={
              <AdminRoute>
                <EditMateria />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/materias/create"
            element={<CreateMateria />}
          />
          <Route
            path="/professor/materias/:id"
            element={
              <ProfessorRoute>
                <ProfessorMateriaPage />
              </ProfessorRoute>
            }
          />
          <Route
            path="/admin/materias/:id"
            element={<AdminMateriaPage />}
          />
        </Routes>
        <WhatsAppButton />
      </div>
    </Router>
  );
};

export default App;

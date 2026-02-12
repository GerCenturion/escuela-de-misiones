import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// 🌎 LISTA DE PAÍSES CONFIGURADA
const COUNTRIES = [
  { code: "AR", name: "Argentina", prefix: "54", type: "composite" }, // composite = pide área separada
  { code: "BO", name: "Bolivia", prefix: "591", type: "single" },     // single = solo pide número
  { code: "ES", name: "España", prefix: "34", type: "single" },
  { code: "US", name: "Estados Unidos", prefix: "1", type: "single" },
  { code: "BR", name: "Brasil", prefix: "55", type: "single" },
  { code: "CL", name: "Chile", prefix: "56", type: "single" },
  { code: "CO", name: "Colombia", prefix: "57", type: "single" },
  { code: "CR", name: "Costa Rica", prefix: "506", type: "single" },
  { code: "CU", name: "Cuba", prefix: "53", type: "single" },
  { code: "EC", name: "Ecuador", prefix: "593", type: "single" },
  { code: "SV", name: "El Salvador", prefix: "503", type: "single" },
  { code: "GT", name: "Guatemala", prefix: "502", type: "single" },
  { code: "HN", name: "Honduras", prefix: "504", type: "single" },
  { code: "MX", name: "México", prefix: "52", type: "single" },
  { code: "NI", name: "Nicaragua", prefix: "505", type: "single" },
  { code: "PA", name: "Panamá", prefix: "507", type: "single" },
  { code: "PY", name: "Paraguay", prefix: "595", type: "single" },
  { code: "PE", name: "Perú", prefix: "51", type: "single" },
  { code: "PR", name: "Puerto Rico", prefix: "1", type: "single" },
  { code: "DO", name: "Rep. Dominicana", prefix: "1", type: "single" },
  { code: "UY", name: "Uruguay", prefix: "598", type: "single" },
  { code: "VE", name: "Venezuela", prefix: "58", type: "single" },
];

const Registration = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // --- 1. ESTADO DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    birthdate: "",
    password: "",
    confirmPassword: "",
    // Inicializamos con Argentina
    phoneCode: "54", 
    phoneArea: "",
    phoneNumber: "",
  });

  // --- 2. ESTADO VISUAL ---
  const [selectedCountryCode, setSelectedCountryCode] = useState("AR"); 
  const [singlePhoneInput, setSinglePhoneInput] = useState(""); // Para países de un solo campo

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showVerificationField, setShowVerificationField] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [existingUser, setExistingUser] = useState(null);

  // --- LOGICA DE CAMBIO DE PAÍS ---
  const handleCountryChange = (e) => {
    const code = e.target.value;
    const countryData = COUNTRIES.find((c) => c.code === code);
    
    setSelectedCountryCode(code);
    setSinglePhoneInput(""); // Limpiar input visual
    
    // Actualizamos el prefijo en formData
    setFormData(prev => ({ 
        ...prev, 
        phoneCode: countryData.prefix, 
        phoneArea: "", 
        phoneNumber: "" 
    }));
  };

  // --- MANEJO DE INPUTS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Manejo para países de "Solo Número" (Todos menos Argentina)
  const handleSinglePhoneChange = (e) => {
    const value = e.target.value;
    setSinglePhoneInput(value);
    
    // TRUCO: Llenamos phoneArea con un guion "-" para satisfacer al Backend
    setFormData(prev => ({
        ...prev,
        phoneArea: "-", 
        phoneNumber: value
    }));
  };

  // Limpieza especial para Argentina (Quitar 0 y 15)
  const handleBlurArg = (e) => {
    let { name, value } = e.target;
    if (name === "phoneArea" && value.startsWith("0")) setFormData(prev => ({ ...prev, [name]: value.substring(1) }));
    if (name === "phoneNumber" && value.startsWith("15") && value.length > 7) setFormData(prev => ({ ...prev, [name]: value.substring(2) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode);

    // Validaciones
    if (!formData.name || !formData.dni || !formData.password) {
        setError("⚠️ Completa todos los campos obligatorios.");
        return;
    }

    // Validación de Teléfono según el tipo de país
    if (currentCountry.type === "composite" && (!formData.phoneArea || !formData.phoneNumber)) {
        setError("⚠️ Completa el código de área y el número.");
        return;
    }
    if (currentCountry.type === "single" && !singlePhoneInput) {
        setError("⚠️ Completa tu número de celular.");
        return;
    }
    
    if (formData.password !== formData.confirmPassword) {
        setError("⚠️ Las contraseñas no coinciden.");
        return;
    }

    setIsSubmitting(true);

    try {
      const fakeEmail = `${formData.dni}@sinemail.com`;
      
      const payload = {
        ...formData,
        email: fakeEmail, 
        address: "No especificada",
        civilStatus: "Soltero/a",
        profession: "-",
        church: "-",
        ministerialRole: "-",
        reason: "Registro Web",
        profileImage: ""
      };

      const response = await fetch(`${apiUrl}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), 
      });

      const data = await response.json();

      if (data.userExists || (data.message && data.message.includes("registrado"))) {
        setExistingUser({ phone: data.phone || "tu celular" });
        setIsSubmitting(false);
        return; 
      }

      if (!response.ok || data.res === false) {
        throw new Error(data.message || data.error || "Error al procesar registro.");
      }

      setStatus("📩 Código enviado a tu WhatsApp.");
      setShowVerificationField(true);

    } catch (error) {
      setError(error.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    setIsSubmitting(true);
    try {
        const fakeEmail = `${formData.dni}@sinemail.com`;
        const response = await fetch(`${apiUrl}/usuarios/verificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni: formData.dni, email: fakeEmail, verificationCode }),
        });
        const data = await response.json();

        if (response.ok) {
            alert("✅ ¡Cuenta verificada! Ahora inicia sesión.");
            navigate("/login");
        } else {
            setError(data.message || "Código incorrecto.");
        }
    } catch (error) {
        setError("Error de conexión.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Helper para obtener datos del país seleccionado actual
  const currentCountry = COUNTRIES.find(c => c.code === selectedCountryCode);

  return (
    <div className="container my-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow p-4 border-0">
        
        {existingUser ? (
             <div className="text-center animate__animated animate__fadeIn">
                <div className="alert alert-warning">
                    <h4 className="fw-bold">⚠️ Usuario Existente</h4>
                    <p>El DNI ya está registrado.</p>
                </div>
                <button onClick={() => navigate("/recuperar")} className="btn btn-primary w-100 mb-2">Recuperar Contraseña</button>
                <button onClick={() => setExistingUser(null)} className="btn btn-outline-secondary w-100">Corregir DNI</button>
             </div>
        ) : !showVerificationField ? (
          
          <form onSubmit={handleSubmit}>
            <h2 className="text-center mb-4" style={{color: "#005f73"}}>Registro</h2>
            
            <div className="mb-3">
                <label className="form-label fw-bold">Nombre Completo</label>
                <input type="text" className="form-control" name="name" onChange={handleChange} required />
            </div>
            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label fw-bold">DNI / Documento</label>
                    <input type="number" className="form-control" name="dni" onChange={handleChange} required />
                </div>
                <div className="col-6 mb-3">
                    <label className="form-label fw-bold">Nacimiento</label>
                    <input type="date" className="form-control" name="birthdate" onChange={handleChange} />
                </div>
            </div>

            {/* --- SECCIÓN INTERNACIONAL DE TELÉFONO --- */}
            <div className="mb-3">
              <label className="form-label fw-bold">País</label>
              <select className="form-select mb-2" value={selectedCountryCode} onChange={handleCountryChange}>
                  {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                          {country.code === "US" ? "🇺🇸" : 
                           country.code === "ES" ? "🇪🇸" : 
                           country.code === "BR" ? "🇧🇷" : 
                           "🏳️"} {country.name} (+{country.prefix})
                      </option>
                  ))}
              </select>

              <label className="form-label fw-bold">Celular / WhatsApp</label>
              
              {/* VISTA PARA ARGENTINA (Área + Número) */}
              {currentCountry.type === "composite" && (
                <div className="input-group">
                    <span className="input-group-text bg-white">+{currentCountry.prefix}</span>
                    <input 
                        type="text" className="form-control" 
                        name="phoneArea" placeholder="Área (341)" 
                        value={formData.phoneArea} onChange={handleChange} onBlur={handleBlurArg}
                        required 
                        style={{maxWidth: "100px"}}
                    />
                    <input 
                        type="text" className="form-control" 
                        name="phoneNumber" placeholder="Número (6123456)" 
                        value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlurArg}
                        required 
                    />
                </div>
              )}

              {/* VISTA PARA RESTO DEL MUNDO (Solo Número) */}
              {currentCountry.type === "single" && (
                <div className="input-group">
                    <span className="input-group-text bg-white">
                        +{currentCountry.prefix}
                    </span>
                    <input 
                        type="text" className="form-control" 
                        placeholder="Número de celular" 
                        value={singlePhoneInput} onChange={handleSinglePhoneChange}
                        required 
                    />
                </div>
              )}
              <small className="text-muted" style={{fontSize: "0.75rem"}}>
                 Ingresa tu número sin espacios ni guiones.
              </small>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Contraseña</label>
                <div className="input-group">
                    <input type={showPasswords ? "text" : "password"} className="form-control" name="password" onChange={handleChange} required minLength={6}/>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPasswords(!showPasswords)} tabIndex="-1">
                        {showPasswords ? "🙈" : "👁️"}
                    </button>
                </div>
            </div>
            <div className="mb-4">
                <label className="form-label fw-bold">Confirmar</label>
                <div className="input-group">
                    <input type={showPasswords ? "text" : "password"} className="form-control" name="confirmPassword" onChange={handleChange} required />
                </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isSubmitting} style={{backgroundColor: "#005f73"}}>
              {isSubmitting ? "Procesando..." : "Registrarme"}
            </button>
            <div className="text-center mt-3">
              <button type="button" className="btn btn-link text-decoration-none" onClick={() => navigate("/recuperar")}>¿Olvidaste tu contraseña?</button>
            </div>
          </form>

        ) : (
          <div className="text-center animate__animated animate__fadeIn">
             <h3 className="text-primary fw-bold">🔑 Verifica tu Código</h3>
             <p className="text-muted mb-4">{status}</p>
             <input type="text" className="form-control text-center mb-3 fs-2 letter-spacing-2" maxLength={6} placeholder="123456" onChange={(e) => setVerificationCode(e.target.value)}/>
             {error && <div className="alert alert-danger py-2">{error}</div>}
             <button className="btn btn-success w-100 py-2 fw-bold" onClick={handleVerifyCode} disabled={isSubmitting}>Confirmar y Entrar</button>
             <button onClick={() => setShowVerificationField(false)} className="btn btn-link mt-3 text-muted">← Corregir número</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
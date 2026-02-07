import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // --- 1. ESTADO DEL FORMULARIO (Solo lo que ve el usuario) ---
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    birthdate: "",
    phoneCode: "54",
    phoneArea: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // --- 2. ESTADOS DE LA INTERFAZ ---
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // --- 3. ESTADOS DE FLUJO (Verificación / Usuario Existente) ---
  const [showVerificationField, setShowVerificationField] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [existingUser, setExistingUser] = useState(null);

  // --- AUTO-CORRECCIÓN DE TELÉFONOS (Quita 0 y 15) ---
  const handleBlur = (e) => {
    let { name, value } = e.target;
    // Si es área y empieza con 0 (ej: 0341 -> 341)
    if (name === "phoneArea" && value.startsWith("0")) {
        setFormData(prev => ({ ...prev, [name]: value.substring(1) }));
    }
    // Si es número y empieza con 15 (ej: 156... -> 6...)
    if (name === "phoneNumber" && value.startsWith("15") && value.length > 7) {
        setFormData(prev => ({ ...prev, [name]: value.substring(2) }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // --- ENVÍO DEL REGISTRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    // Validaciones básicas
    if (!formData.name || !formData.dni || !formData.phoneArea || !formData.phoneNumber || !formData.password) {
        setError("⚠️ Por favor completa todos los campos.");
        return;
    }
    if (formData.password.length < 6) {
        setError("⚠️ La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("⚠️ Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🔥 TRUCO: Generamos datos de relleno para satisfacer al Backend
      // Usamos el DNI para crear un email único ficticio
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

      console.log("Enviando al backend:", payload); 

      const response = await fetch(`${apiUrl}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), 
      });

      const data = await response.json();

      // CASO A: YA REGISTRADO
      if (data.userExists || (data.message && data.message.includes("registrado"))) {
        const phoneData = data.phone || "su celular";
        setExistingUser({ phone: phoneData });
        setIsSubmitting(false);
        return; 
      }

      // CASO B: ERROR DEL BACKEND (Ej: WhatsApp inválido)
      if (!response.ok || data.res === false) {
        throw new Error(data.message || data.error || "Error al procesar el registro.");
      }

      // CASO C: ÉXITO
      setStatus("📩 Código enviado a tu WhatsApp.");
      setShowVerificationField(true);

    } catch (error) {
      console.error("Error en registro:", error);
      setError(error.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- VERIFICACIÓN DEL CÓDIGO ---
  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    setIsSubmitting(true);
    
    try {
        // 🔥 IMPORTANTE: Reconstruimos el mismo email falso para validar
        // Si no enviamos esto, el backend no encuentra al usuario.
        const fakeEmail = `${formData.dni}@sinemail.com`;

        const response = await fetch(`${apiUrl}/usuarios/verificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                dni: formData.dni, 
                email: fakeEmail, // <--- CLAVE PARA QUE NO DE ERROR 404
                verificationCode 
            }),
        });
        
        const data = await response.json();

        if (response.ok) {
            alert("✅ ¡Cuenta verificada exitosamente!");
            navigate("/login");
        } else {
            setError(data.message || data.error || "Código incorrecto.");
        }
    } catch (error) {
        console.error(error);
        setError("Error de conexión al verificar.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow p-4 border-0">
        
        {/* --- VISTA 1: USUARIO YA EXISTE --- */ }
        {existingUser ? (
             <div className="text-center animate__animated animate__fadeIn">
                <div className="alert alert-warning border-warning">
                    <h4 className="fw-bold">⚠️ Ya estás registrado</h4>
                    <p>El DNI <b>{formData.dni}</b> ya tiene cuenta.</p>
                    <p className="small mb-0">¿Quieres recuperar tu contraseña?</p>
                </div>
                
                <button 
                    onClick={() => navigate("/recuperar")} 
                    className="btn btn-primary w-100 mb-2 fw-bold"
                >
                    Sí, Restaurar Contraseña
                </button>
                
                <button 
                    onClick={() => setExistingUser(null)} 
                    className="btn btn-outline-secondary w-100"
                >
                    No, corregir DNI
                </button>
             </div>

        ) : !showVerificationField ? (
          
          /* --- VISTA 2: FORMULARIO DE REGISTRO --- */
          <form onSubmit={handleSubmit}>
            <h2 className="text-center mb-4" style={{color: "#005f73"}}>Registro</h2>
            
            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label fw-bold">Nombre Completo</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            {/* DNI y Fecha */}
            <div className="row">
                <div className="col-6 mb-3">
                    <label className="form-label fw-bold">DNI</label>
                    <input type="number" className="form-control" name="dni" value={formData.dni} onChange={handleChange} required />
                </div>
                <div className="col-6 mb-3">
                    <label className="form-label fw-bold">Nacimiento</label>
                    <input type="date" className="form-control" name="birthdate" value={formData.birthdate} onChange={handleChange} />
                </div>
            </div>

            {/* WhatsApp */}
            <div className="mb-3">
              <label className="form-label fw-bold">WhatsApp (Sin 0 ni 15)</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">+</span>
                <input 
                    type="text" className="form-control border-start-0" 
                    name="phoneCode" value={formData.phoneCode} onChange={handleChange} 
                    required style={{maxWidth:"60px"}} 
                />
                <input 
                    type="text" className="form-control" 
                    name="phoneArea" placeholder="341" value={formData.phoneArea} onChange={handleChange} onBlur={handleBlur}
                    required style={{maxWidth:"90px"}}
                />
                <input 
                    type="text" className="form-control" 
                    name="phoneNumber" placeholder="6123456" value={formData.phoneNumber} onChange={handleChange} onBlur={handleBlur}
                    required 
                />
              </div>
            </div>

            {/* Contraseñas */}
            <div className="mb-3">
              <label className="form-label fw-bold">Contraseña</label>
              <div className="input-group">
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    className="form-control" name="password" value={formData.password} onChange={handleChange} required minLength={6}
                  />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPasswords(!showPasswords)} tabIndex="-1">
                    {showPasswords ? "🙈" : "👁️"}
                  </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Confirmar</label>
              <div className="input-group">
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required 
                  />
              </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="alert alert-danger py-2 d-flex align-items-center">
                    <span className="me-2">🛑</span> {error}
                </div>
            )}

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isSubmitting} style={{backgroundColor: "#005f73"}}>
              {isSubmitting ? "Procesando..." : "Registrarme"}
            </button>
          </form>

        ) : (
          /* --- VISTA 3: VERIFICACIÓN --- */
          <div className="text-center animate__animated animate__fadeIn">
             <h3 className="text-primary fw-bold">🔑 Verifica tu Código</h3>
             <p className="text-muted mb-4">{status}</p>
             
             <input 
                type="text" className="form-control text-center mb-3 fs-2 letter-spacing-2" 
                maxLength={6} placeholder="123456" 
                value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
             />
             
             {error && <div className="alert alert-danger py-2">{error}</div>}
             
             <button 
                className="btn btn-success w-100 py-2 fw-bold" 
                onClick={handleVerifyCode} 
                disabled={isSubmitting || verificationCode.length < 6}
             >
                {isSubmitting ? "Validando..." : "Confirmar y Entrar"}
             </button>
             
             <button onClick={() => setShowVerificationField(false)} className="btn btn-link mt-3 text-muted text-decoration-none">
                 ← Corregir número
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
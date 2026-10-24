// src/utils/perfilValidator.js

export const isCampoIncompleto = (valor) => {
  if (valor === undefined || valor === null) return true;
  const limpio = String(valor).trim().toLowerCase();

  const valoresInvalidos = [
    "",
    "-",
    "--",
    "no especificada",
    "no especificado",
    "no asignado",
    "sin asignar",
    "null",
    "undefined",
  ];

  return valoresInvalidos.includes(limpio);
};

export const tienePerfilIncompleto = (user) => {
  if (!user) return false;
  // Solo se exige a los alumnos. Administradores y profesores quedan exentos.
  if (user.role === "admin" || user.role === "profesor") {
    return false;
  }

  const camposObligatorios = [
    user.name,
    user.address,
    user.phoneArea,
    user.phoneNumber,
    user.church,
    user.reason,
    user.profession,
    user.birthdate,
  ];

  return camposObligatorios.some(isCampoIncompleto);
};
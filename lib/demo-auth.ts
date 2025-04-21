"use client"

import Cookies from "js-cookie"

// Establecer el usuario de demostración
export function setDemoUser() {
  Cookies.set("demo_user", "true", { expires: 1 }) // Expira en 1 día
}

// Verificar si es un usuario de demostración
export function isDemoUser() {
  return Cookies.get("demo_user") === "true"
}

// Eliminar el usuario de demostración
export function removeDemoUser() {
  Cookies.remove("demo_user")
}

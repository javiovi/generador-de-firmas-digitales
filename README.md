## Descripción General

El Generador de Firmas de Email es una aplicación web completa que permite a los usuarios crear, personalizar, guardar y exportar firmas de email profesionales. La aplicación está construida con Next.js, React, Tailwind CSS y utiliza Supabase para la autenticación y almacenamiento de datos, y Vercel Blob para el almacenamiento de imágenes.

## Características Principales

1. **Múltiples plantillas de firma**
    
2. Clásica
    
3. Moderna
    
4. Minimalista
    
5. Corporativa
    
6. **Personalización completa**
    
7. Información personal y de contacto
    
8. Colores personalizables
    
9. Subida de logo (PNG, JPG, SVG)
    
10. Subida de foto de perfil
    
11. Redes sociales configurables
    
12. **Sistema de usuarios**
    
13. Registro y autenticación
    
14. Modo de demostración sin registro
    
15. Recuperación de contraseña
    
16. **Gestión de firmas**
    
17. Guardar múltiples firmas
    
18. Cargar firmas guardadas
    
19. Editar firmas existentes
    
20. Eliminar firmas
    
21. **Opciones de exportación**
    
22. Código HTML (con estilos inline)
    
23. Exportación como imagen (PNG/JPG)
    
24. Vista previa en diferentes clientes de email
    
25. Guías de implementación para clientes de email populares
    
26. **Características adicionales**
    
27. Diseño responsivo
    
28. Modo claro/oscuro para las firmas
    
29. Optimización de imágenes automática
    

## Cómo Funciona

### 1. Navegación y Autenticación

- **Página de inicio**: Muestra el generador de firmas si el usuario está autenticado, o redirige a la página de login.
    
- **Registro**: Los usuarios pueden crear una cuenta con email y contraseña.
    
- **Login**: Acceso con credenciales o mediante el modo de demostración.
    
- **Recuperación de contraseña**: Sistema para restablecer contraseñas olvidadas.
    

### 2. Creación de Firmas

El proceso de creación de firmas se divide en cuatro pestañas principales:

#### a. Plantilla

- Selección entre cuatro diseños predefinidos (Clásica, Moderna, Minimalista, Corporativa)
    
- Vista previa instantánea de cada plantilla
    

#### b. Editor

- **Información Personal**: Nombre, cargo, empresa, dirección
    
- **Contacto**: Teléfono, email, sitio web
    
- **Redes Sociales**: Activación/desactivación y configuración de enlaces a Facebook, Instagram, YouTube, LinkedIn y Twitter (X)
    
- **Personalización**:
    
- Selector de color principal
    
- Carga de logo (soporta PNG, JPG y SVG)
    
- Carga de foto de perfil (con recorte circular y borde del color principal)
    

#### c. Exportar

- **Código HTML**:
    
- Generación de código HTML con estilos inline
    
- Opciones para modo claro/oscuro
    
- Opción para hacer el diseño responsivo
    
- Botones para copiar y descargar el código
    
- **Imagen**:
    
- Exportación como PNG o JPG
    
- Resolución optimizada para email
    
- **Vista Previa**:
    
- Simulación de cómo se verá la firma en diferentes clientes de email
    
- **Guías**:
    
- Instrucciones paso a paso para implementar la firma en:
    
- Gmail
    
- Outlook
    
- Apple Mail
    
- Thunderbird
    

#### d. Colaboración

- Funcionalidades para compartir firmas con el equipo
    
- Opciones para estandarizar firmas corporativas
    

### 3. Gestión de Firmas

- **Guardar**: Almacena la firma actual con un nombre y descripción opcional
    
- **Cargar**: Muestra una lista de firmas guardadas para seleccionar
    
- **Editar**: Permite modificar firmas existentes
    
- **Eliminar**: Opción para borrar firmas guardadas
    

### 4. Vista Previa en Tiempo Real

- Panel lateral que muestra cómo se ve la firma mientras se edita
    
- Actualización instantánea con cada cambio
    


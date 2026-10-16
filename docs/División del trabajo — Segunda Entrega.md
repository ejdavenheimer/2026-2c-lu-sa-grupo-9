# **División del trabajo — Segunda Entrega**

## **Trabajo Práctico Integrador: Código a Voluntad**

Para la **Segunda Entrega**, el trabajo se dividirá entre cinco integrantes buscando que cada persona sea responsable de una funcionalidad completa, incluyendo su lógica de negocio, persistencia, endpoints, pruebas y documentación.

La entrega comprende principalmente la adaptación del dominio, la incorporación de persistencia mediante **MongoDB**, nuevas funcionalidades de búsqueda y notificación, la implementación de tests unitarios con **Jest** y la documentación de la API mediante **Swagger**. enunciado

---

## **Integrante 1 — Gestión de perfiles de proyecto**

### **Requerimiento**

Implementar la gestión de los perfiles requeridos por cada proyecto.

Los proyectos dejarán de asociar directamente las habilidades requeridas y pasarán a definir uno o más **perfiles**. Cada perfil deberá contener una descripción, habilidades obligatorias, habilidades opcionales, tipo de compromiso esperado y modalidad de colaboración. enunciado

### **Historias de Usuario**

**HU01 — Crear un perfil**

> Como colectivo, quiero agregar un perfil a un proyecto para especificar el tipo de persona colaboradora que necesito.

**HU02 — Administrar perfiles**

> Como colectivo, quiero consultar, modificar y eliminar los perfiles de un proyecto para mantener actualizadas sus necesidades.

### **Tareas técnicas**

* Crear la entidad `Perfil`.  
* Adaptar la entidad `Proyecto` para contener una colección de perfiles.  
* Implementar habilidades obligatorias y opcionales.  
* Incorporar compromiso esperado y modalidad de colaboración por perfil.  
* Implementar el CRUD de perfiles.  
* Crear los endpoints REST correspondientes.  
* Implementar la persistencia de perfiles en MongoDB.  
* Crear Repository, Service y Controller.  
* Implementar validaciones de existencia del proyecto y de las habilidades asociadas.  
* Crear tests unitarios de dominio y servicios.  
* Documentar los endpoints mediante Swagger.

---

## **Integrante 2 — Logros y avance de proyectos**

### **Requerimiento**

Implementar el seguimiento del avance de cada proyecto mediante porcentajes de concreción, hitos y enlaces relacionados.

El proyecto deberá permitir registrar periódicamente su porcentaje de avance, sus logros o hitos y los enlaces al sistema funcionando y al código fuente público. enunciado

### **Historias de Usuario**

**HU03 — Registrar un logro**

> Como colectivo, quiero registrar los logros o hitos alcanzados en un proyecto para reflejar su evolución.

**HU04 — Actualizar el progreso**

> Como colectivo, quiero actualizar el porcentaje de avance y los enlaces de un proyecto para informar su estado actual.

### **Tareas técnicas**

* Crear la entidad `Hito` o `Logro`.  
* Relacionar los logros con la entidad `Proyecto`.  
* Incorporar el porcentaje de concreción al proyecto.  
* Incorporar el enlace al sistema en funcionamiento.  
* Incorporar el enlace al repositorio público.  
* Implementar el CRUD de logros.  
* Crear endpoints REST para administrar los logros.  
* Implementar la actualización del progreso del proyecto.  
* Persistir los nuevos datos en MongoDB.  
* Crear Repository, Service y Controller.  
* Validar que el porcentaje se encuentre entre 0 y 100\.  
* Crear tests unitarios.  
* Documentar los endpoints mediante Swagger.

---

## **Integrante 3 — Medios de contacto y contribuciones anónimas**

### **Requerimiento**

Extender la información de las personas colaboradoras incorporando medios de contacto y preferencias de privacidad.

Las personas colaboradoras podrán registrar cero o más medios de contacto, incluyendo **email, WhatsApp y SMS**, además de indicar si desean recibir mensajes internos relacionados con proyectos compatibles con sus habilidades. enunciado

También deberán poder indicar si una contribución realizada a un proyecto será pública o anónima. En caso de ser anónima, la contribución continuará apareciendo en la plataforma, pero sin revelar quién la realizó. enunciado

### **Historias de Usuario**

**HU05 — Registrar medios de contacto**

> Como persona colaboradora, quiero registrar mis medios de contacto para poder recibir comunicaciones relacionadas con la plataforma.

**HU06 — Configurar mensajería interna**

> Como persona colaboradora, quiero indicar si deseo recibir mensajes internos sobre proyectos relacionados con mis habilidades.

**HU07 — Realizar una contribución anónima**

> Como persona colaboradora, quiero decidir si mi participación en un proyecto será pública o anónima para controlar la visibilidad de mi identidad.

### **Tareas técnicas**

* Crear la entidad `MedioContacto`.  
* Crear los tipos de contacto:  
  * Email.  
  * WhatsApp.  
  * SMS.  
* Adaptar `PersonaColaboradora` para almacenar sus medios de contacto.  
* Incorporar la preferencia de recepción de mensajes internos.  
* Adaptar la entidad `Colaboracion` para soportar contribuciones anónimas.  
* Implementar endpoints para agregar, consultar, modificar y eliminar medios de contacto.  
* Adaptar los endpoints relacionados con las colaboraciones.  
* Persistir la información en MongoDB.  
* Implementar Repository, Service y Controller.  
* Crear tests unitarios.  
* Documentar los endpoints mediante Swagger.

---

## **Integrante 4 — Búsqueda y compatibilidad**

### **Requerimiento**

Implementar mecanismos que permitan encontrar colaboradores compatibles con los perfiles de un proyecto y proyectos compatibles con las habilidades de una persona colaboradora.

La Segunda Entrega requiere específicamente la búsqueda de potenciales colaboradores según un perfil y la búsqueda de potenciales proyectos según las habilidades de los colaboradores. enunciado

### **Historias de Usuario**

**HU08 — Buscar colaboradores compatibles**

> Como colectivo, quiero buscar personas colaboradoras compatibles con un perfil requerido para encontrar candidatos adecuados para mi proyecto.

**HU09 — Buscar proyectos compatibles**

> Como persona colaboradora, quiero buscar proyectos relacionados con mis habilidades para encontrar oportunidades en las que pueda participar.

### **Tareas técnicas**

* Definir los criterios de compatibilidad entre perfiles y colaboradores.  
* Implementar la búsqueda por habilidades obligatorias.  
* Considerar habilidades opcionales dentro del proceso de búsqueda.  
* Implementar consultas MongoDB para localizar colaboradores compatibles.  
* Implementar consultas MongoDB para localizar proyectos compatibles.  
* Crear endpoints REST para ambas búsquedas.  
* Implementar Repository, Service y Controller.  
* Manejar búsquedas sin resultados.  
* Crear tests unitarios para la lógica de compatibilidad.  
* Documentar los endpoints mediante Swagger.

---

## **Integrante 5 — Notificaciones e integración general**

### **Requerimiento**

Implementar el sistema de notificaciones internas y su replicación mediante medios de contacto externos.

Las organizaciones podrán buscar personas colaboradoras compatibles con determinados perfiles y contactarlas mediante un mensaje interno, siempre que la persona haya aceptado previamente este tipo de contacto. Las notificaciones internas también deberán poder replicarse mediante los medios externos registrados. enunciado

### **Historias de Usuario**

**HU10 — Contactar a una persona colaboradora**

> Como colectivo, quiero enviar un mensaje interno a una persona compatible con un perfil para invitarla a participar de un proyecto.

**HU11 — Recibir notificaciones por medios externos**

> Como persona colaboradora, quiero recibir notificaciones mediante mis medios de contacto registrados para enterarme de mensajes importantes fuera de la plataforma.

### **Tareas técnicas**

* Crear la entidad `Notificacion`.  
* Relacionar las notificaciones con colectivos y personas colaboradoras.  
* Implementar el sistema de mensajería interna.  
* Validar que la persona haya aceptado ser contactada.  
* Implementar una abstracción para medios externos de notificación.  
* Contemplar Email, WhatsApp y SMS.  
* Registrar los medios utilizados para cada notificación.  
* Persistir las notificaciones en MongoDB.  
* Crear endpoints para enviar y consultar notificaciones.  
* Implementar Repository, Service y Controller.  
* Crear tests unitarios.  
* Documentar los endpoints mediante Swagger.  
* Configurar y revisar los scripts de datos iniciales o **seeds**.  
* Colaborar con la configuración general de MongoDB y el despliegue de la aplicación.

---

# **Resumen de asignación**

| Integrante | Responsabilidad principal | Historias de Usuario |
| ----- | ----- | ----- |
| **Integrante 1** | Perfiles de proyecto | HU01 – HU02 |
| **Integrante 2** | Logros y avance | HU03 – HU04 |
| **Integrante 3** | Contactos y anonimato | HU05 – HU07 |
| **Integrante 4** | Búsquedas y compatibilidad | HU08 – HU09 |
| **Integrante 5** | Notificaciones e integración | HU10 – HU11 |

---

# **Tareas comunes a todo el equipo**

Además de las responsabilidades individuales, cada integrante deberá implementar sobre su módulo:

* Persistencia de las entidades correspondientes en **MongoDB**.  
* Arquitectura en capas.  
* Repository, Service y Controller.  
* Validaciones y manejo de errores.  
* Endpoints REST necesarios.  
* Tests unitarios de dominio.  
* Tests unitarios de servicios mediante **Jest**.  
* Documentación de los endpoints mediante **Swagger**.

Finalmente, el equipo deberá integrar todos los módulos en una única API REST y verificar que todas las entidades del dominio se encuentren correctamente persistidas en MongoDB, tal como exige la Segunda Entrega. enunciado

## **Resultado esperado**

La división propuesta busca que cada integrante sea responsable de una **funcionalidad completa de punta a punta**, evitando separar el trabajo únicamente por capas técnicas. De esta manera, cada miembro trabaja sobre su dominio, endpoints, persistencia, lógica de negocio, pruebas y documentación, facilitando posteriormente la integración de todos los módulos en la aplicación final.


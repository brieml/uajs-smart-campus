/**
 * Datos ficticios (mock) de UAJS Smart Campus.
 * IMPORTANTE: toda la informacion aqui es de prueba. No se utilizan
 * datos personales reales de estudiantes, docentes o funcionarios de
 * la Universidad Antonio Jose de Sucre, conforme a lo solicitado en
 * el proyecto integrador.
 */

export const ESTADOS_SOLICITUD = [
  'REGISTRADA',
  'EN_REVISION',
  'ASIGNADA',
  'EN_PROCESO',
  'RESUELTA',
  'CERRADA',
]

export const usuarioActual = {
  id: 'u-001',
  nombre: 'Andres Herrera Pérez',
  tipoUsuario: 'ESTUDIANTE',
  programa: 'Ingeniería de Sistemas',
  codigo: 'UAJS-2023-0142',
  correo: 'Andres.herrera@uajs.edu.co',
  iniciales: 'AH',
}

export const servicios = [
  {
    id: 'solicitudes',
    nombre: 'Solicitudes',
    categoria: 'Trámites',
    icono: '📄',
    color: 'navy',
    descripcionCorta: 'Registra y haz seguimiento a tus trámites académicos y administrativos.',
    descripcion:
      'El servicio de Solicitudes centraliza el registro y seguimiento de trámites universitarios. Cada solicitud queda asociada a un tipo, una dependencia responsable, prioridad y un estado que evoluciona desde su registro hasta su cierre.',
    funcionalidades: [
      'Registrar una nueva solicitud indicando tipo y dependencia',
      'Consultar el estado actual de cada trámite',
      'Ver el historial completo de una solicitud',
    ],
  },
  {
    id: 'reservas',
    nombre: 'Reservas',
    categoria: 'Espacios y equipos',
    icono: '🗓️',
    color: 'gold',
    descripcionCorta: 'Consulta disponibilidad y reserva salas, laboratorios y equipos.',
    descripcion:
      'El servicio de Reservas permite consultar la disponibilidad de salas, laboratorios, equipos y espacios académicos, y registrar una solicitud de reserva indicando fecha, hora y recurso deseado.',
    funcionalidades: [
      'Consultar disponibilidad de un recurso por fecha y hora',
      'Registrar una reserva',
      'Consultar el historial de reservas realizadas',
    ],
  },
  {
    id: 'recursos',
    nombre: 'Recursos',
    categoria: 'Inventario académico',
    icono: '🧰',
    color: 'info',
    descripcionCorta: 'Explora los recursos institucionales disponibles para la comunidad.',
    descripcion:
      'El servicio de Recursos administra el inventario de espacios y equipos disponibles para reserva, incluyendo su código, tipo, ubicación y disponibilidad actual.',
    funcionalidades: [
      'Consultar el catálogo de recursos disponibles',
      'Filtrar recursos por tipo o ubicación',
      'Ver el estado de disponibilidad en tiempo real',
    ],
  },
  {
    id: 'eventos',
    nombre: 'Eventos',
    categoria: 'Vida universitaria',
    icono: '🎓',
    color: 'success',
    descripcionCorta: 'Entérate de conferencias, talleres y actividades institucionales.',
    descripcion:
      'El servicio de Eventos y Actividades reúne la agenda institucional: conferencias, seminarios, talleres y actividades académicas, con su fecha, hora, lugar y descripción.',
    funcionalidades: [
      'Consultar la agenda de eventos próximos',
      'Ver el detalle de lugar y horario de cada actividad',
      'Recibir notificación cuando se publica un nuevo evento',
    ],
  },
  {
    id: 'notificaciones',
    nombre: 'Notificaciones',
    categoria: 'Comunicaciones',
    icono: '🔔',
    color: 'warning',
    descripcionCorta: 'Mantente al tanto de cambios en tus trámites y reservas.',
    descripcion:
      'El servicio de Notificaciones informa sobre cambios de estado en una solicitud, confirmaciones o modificaciones de reservas, nuevos eventos y demás comunicaciones relevantes para el usuario.',
    funcionalidades: [
      'Ver notificaciones no leídas',
      'Marcar notificaciones como leídas',
      'Filtrar notificaciones por tipo',
    ],
  },
  {
    id: 'pqrs',
    nombre: 'PQRS',
    categoria: 'Atención al usuario',
    icono: '💬',
    color: 'danger',
    descripcionCorta: 'Radica peticiones, quejas, reclamos y sugerencias.',
    descripcion:
      'Módulo académico para peticiones, quejas, reclamos y sugerencias, planteado como componente de integración de UAJS Smart Campus y no como sustitución del sistema institucional oficial.',
    funcionalidades: [
      'Radicar una petición, queja, reclamo o sugerencia',
      'Consultar el estado de tu PQRS',
      'Recibir respuesta a través de notificaciones',
    ],
  },
]

export const solicitudesIniciales = [
  {
    id: 'SOL-1001',
    tipoServicio: 'Certificado académico',
    dependencia: 'Registro y Control',
    fecha: '2026-08-05',
    descripcion: 'Solicitud de certificado de notas para proceso de homologación.',
    prioridad: 'Media',
    estado: 'EN_PROCESO',
    responsable: 'Oficina de Registro Académico',
  },
  {
    id: 'SOL-1002',
    tipoServicio: 'Reserva de laboratorio',
    dependencia: 'Facultad de Ingeniería',
    fecha: '2026-08-10',
    descripcion: 'Uso del laboratorio de redes para práctica de Sistemas Distribuidos.',
    prioridad: 'Alta',
    estado: 'ASIGNADA',
    responsable: 'Coordinación de Laboratorios',
  },
  {
    id: 'SOL-1003',
    tipoServicio: 'Constancia de matrícula',
    dependencia: 'Registro y Control',
    fecha: '2026-07-22',
    descripcion: 'Constancia para trámite de beca municipal.',
    prioridad: 'Baja',
    estado: 'CERRADA',
    responsable: 'Oficina de Registro Académico',
  },
  {
    id: 'SOL-1004',
    tipoServicio: 'PQRS - Sugerencia',
    dependencia: 'Bienestar Universitario',
    fecha: '2026-08-15',
    descripcion: 'Sugerencia de horario extendido en la biblioteca durante semana de parciales.',
    prioridad: 'Media',
    estado: 'REGISTRADA',
    responsable: 'Por asignar',
  },
]

export const reservasIniciales = [
  {
    id: 'RES-501',
    recurso: 'Laboratorio de Redes 2',
    tipo: 'Laboratorio',
    fecha: '2026-08-25',
    hora: '08:00 - 10:00',
    usuario: usuarioActual.nombre,
    estado: 'CONFIRMADA',
  },
  {
    id: 'RES-502',
    recurso: 'Sala de juntas Bloque C',
    tipo: 'Sala',
    fecha: '2026-08-27',
    hora: '14:00 - 15:30',
    usuario: usuarioActual.nombre,
    estado: 'PENDIENTE',
  },
]

export const recursos = [
  { id: 'REC-01', codigo: 'LAB-RED-02', nombre: 'Laboratorio de Redes 2', tipo: 'Laboratorio', ubicacion: 'Bloque B - Piso 3', estado: 'Disponible', disponible: true },
  { id: 'REC-02', codigo: 'SALA-C-01', nombre: 'Sala de juntas Bloque C', tipo: 'Sala', ubicacion: 'Bloque C - Piso 1', estado: 'Reservado', disponible: false },
  { id: 'REC-03', codigo: 'AUD-PRIN', nombre: 'Auditorio Principal', tipo: 'Espacio académico', ubicacion: 'Bloque A - Piso 1', estado: 'Disponible', disponible: true },
  { id: 'REC-04', codigo: 'VP-HD-04', nombre: 'Videobeam portátil HD', tipo: 'Equipo tecnológico', ubicacion: 'Almacén Bloque B', estado: 'Disponible', disponible: true },
  { id: 'REC-05', codigo: 'LAB-SIS-01', nombre: 'Laboratorio de Sistemas 1', tipo: 'Laboratorio', ubicacion: 'Bloque B - Piso 2', estado: 'Mantenimiento', disponible: false },
]

export const eventos = [
  { id: 'EVT-01', nombre: 'Semana de la Ingeniería 2026', fecha: '2026-09-02', hora: '09:00', lugar: 'Auditorio Principal', descripcion: 'Conferencias, talleres y muestra de proyectos de las facultades de ingeniería.', tipo: 'Conferencia' },
  { id: 'EVT-02', nombre: 'Taller de Arquitecturas Distribuidas', fecha: '2026-09-08', hora: '15:00', lugar: 'Laboratorio de Redes 2', descripcion: 'Taller práctico sobre microservicios, APIs REST y contenedores.', tipo: 'Taller' },
  { id: 'EVT-03', nombre: 'Feria de Bienestar Universitario', fecha: '2026-09-12', hora: '10:00', lugar: 'Plazoleta Central', descripcion: 'Actividades deportivas, culturales y de salud para toda la comunidad UAJS.', tipo: 'Actividad institucional' },
]

export const notificacionesIniciales = [
  { id: 'NOT-01', tipo: 'Solicitud', mensaje: 'Tu solicitud SOL-1002 cambió de estado a "Asignada".', fecha: '2026-08-18', leida: false },
  { id: 'NOT-02', tipo: 'Reserva', mensaje: 'Tu reserva RES-502 quedó pendiente de confirmación.', fecha: '2026-08-19', leida: false },
  { id: 'NOT-03', tipo: 'Evento', mensaje: 'Nuevo evento publicado: Semana de la Ingeniería 2026.', fecha: '2026-08-20', leida: true },
  { id: 'NOT-04', tipo: 'Solicitud', mensaje: 'Tu solicitud SOL-1003 fue cerrada exitosamente.', fecha: '2026-08-12', leida: true },
]

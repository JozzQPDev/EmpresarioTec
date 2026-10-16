// Define el estado actual del perímetro para la vista en tiempo real
export interface IntrusionState {
  estado: number;
  intrusiones_totales: number;
  dispositivo: string;
  timestamp?: string | Date;
  mensaje?: string;
}

// Códigos de estado del sistema y conexión
export enum EstadoPerimetro {
  SIN_CONEXION = 0,
  ZONA_SEGURA = 1,
  ADVERTENCIA = 2,
  ALERTA_CRITICA = 3
}

// Modelo correspondiente a la tabla historial_alertas_criticas
export interface AlertaCritica {
  id: number;
  dispositivo_id: number;
  codigo: number;
  mensaje: string;
  intrusiones: number;
  duracion_segundos: number;
  fecha_hora: string;
}

// Modelo correspondiente a la tabla historial_monitoreo_general
export interface MonitoreoGeneral {
  id: number;
  dispositivo_id: number;
  codigo: number;
  mensaje: string;
  fecha_hora: string;
}

// Modelo correspondiente a la tabla roles
export interface Rol {
  id?: number;
  nombre: string;
}

// Modelo correspondiente a la tabla usuarios
export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  password_hash?: string;
  rol_id: number;
  activo?: boolean;
  fecha_registro?: string;
  roles?: Rol;
}

// ==================== MODELOS DE AUTENTICACIÓN (LOGIN) ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SesionUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface LoginResponse {
  mensaje: string;
  usuario: SesionUsuario;
}

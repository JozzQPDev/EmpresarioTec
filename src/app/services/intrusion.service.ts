import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  AlertaCritica,
  Dispositivo,
  IntrusionState,
  EstadoPerimetro,
  MonitoreoGeneral,
  Usuario,
  Rol
} from '../models/intrusion.model';

export interface ApiResponse {
  codigo: number;
  mensaje: string;
  intrusiones: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class IntrusionService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  obtenerEstado(): Observable<IntrusionState> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/estado`).pipe(
      map(res => {
        const codigoNum = Number(res.codigo);
        const estadoValido = isNaN(codigoNum) ? EstadoPerimetro.SIN_CONEXION : codigoNum;

        return {
          estado: estadoValido,
          intrusiones_totales: Number(res.intrusiones) || 0,
          dispositivo: 'Dispositivo de perímetro',
          mensaje: res.mensaje
        };
      })
    );
  }

  obtenerHistorialMonitoreo(): Observable<MonitoreoGeneral[]> {
    return this.http.get<MonitoreoGeneral[]>(`${this.apiUrl}/historial/monitoreo`);
  }

  obtenerHistorialAlertas(): Observable<AlertaCritica[]> {
    return this.http.get<AlertaCritica[]>(`${this.apiUrl}/historial/alertas`);
  }

  obtenerDispositivos(): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(`${this.apiUrl}/dispositivos`);
  }

  // ==================== MÉTODOS DE USUARIOS ====================

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<any>(`${this.apiUrl}/usuarios`).pipe(
      map(response => {
        // Asegura que devuelva un arreglo ya sea que la API devuelva la lista directa o envuelta en .data
        return Array.isArray(response) ? response : (response?.data || []);
      })
    );
  }

  crearUsuario(usuario: Usuario): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }

  // ==================== MÉTODOS DE ROLES ====================

  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<any>(`${this.apiUrl}/roles`).pipe(
      map(response => {
        return Array.isArray(response) ? response : (response?.data || []);
      })
    );
  }
}

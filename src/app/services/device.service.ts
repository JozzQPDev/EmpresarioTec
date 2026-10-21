import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Dispositivo } from '../models/intrusion.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  // ==================== MÉTODOS DE DISPOSITIVOS ====================

  obtenerDispositivos(): Observable<Dispositivo[]> {
    return this.http.get<any>(`${this.apiUrl}/dispositivos`).pipe(
      map(response => {
        return Array.isArray(response) ? response : (response?.data || []);
      })
    );
  }

  obtenerDispositivoPorId(id: number): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${this.apiUrl}/dispositivos/${id}`);
  }

  crearDispositivo(dispositivo: Partial<Dispositivo>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dispositivos`, dispositivo);
  }

  actualizarDispositivo(id: number, dispositivo: Partial<Dispositivo>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/dispositivos/${id}`, dispositivo);
  }

  cambiarEstadoDispositivo(id: number, activo?: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/dispositivos/${id}/estado`, { activo });
  }

  eliminarDispositivo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/dispositivos/${id}`);
  }

  subirImagenDispositivo(id: number, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', archivo, archivo.name); // Asegúrate que Flask busque 'imagen'
    return this.http.post<any>(`${this.apiUrl}/dispositivos/${id}/imagen`, formData);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, SesionUsuario } from '../models/intrusion.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base de tu API Flask
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  /**
   * Envía la solicitud de inicio de sesión utilizando la interfaz LoginRequest
   * y recibe una respuesta del tipo LoginResponse.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.usuario) {
          // Guardamos los datos de SesionUsuario en localStorage
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
        }
      })
    );
  }

  /**
   * Cierra la sesión activa removiendo los datos del almacenamiento local.
   */
  logout(): void {
    localStorage.removeItem('usuario');
  }

  /**
   * Verifica si el usuario cuenta con una sesión activa.
   */
  estaAutenticado(): boolean {
    return !!localStorage.getItem('usuario');
  }

  /**
   * Obtiene la sesión actual tipada con la interfaz SesionUsuario.
   */
  obtenerUsuarioActual(): SesionUsuario | null {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) as SesionUsuario : null;
  }
}

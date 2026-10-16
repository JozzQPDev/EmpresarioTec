import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderService } from '../services/header.service';
import { AuthService } from '../services/auth.service';

interface SeccionMenu {
  titulo: string;
  ruta: string;
  icono: string;
  clave: string;
  categoria: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  // Lista centralizada de elementos del menú para evitar repetir código en el HTML
  menuItems: SeccionMenu[] = [
    { categoria: 'Menú Principal', titulo: 'Dashboard', ruta: '/dashboard', icono: 'fa-solid fa-shield-halved text-blue-400', clave: 'dashboard' },
    { categoria: 'Menú Principal', titulo: 'Dispositivos & Pines', ruta: '/dispositivos', icono: 'fa-solid fa-microchip text-slate-400', clave: 'dispositivos' },
    { categoria: 'Usuarios', titulo: 'Gestión de Accesos', ruta: '/usuarios', icono: 'fa-solid fa-users text-slate-400', clave: 'usuarios' },
    { categoria: 'Logs', titulo: 'Logs del Sistema', ruta: '/logs', icono: 'fa-solid fa-terminal text-slate-400', clave: 'logs' }
  ];

  constructor(
    private headerService: HeaderService,
    private authService: AuthService,
    private router: Router
  ) {}

  seleccionarSeccion(seccion: string): void {
    if (seccion === 'dashboard') {
      this.headerService.cambiarHeader('Panel De Control', 'Perímetro de Seguridad');
    } else if (seccion === 'usuarios') {
      this.headerService.cambiarHeader('Gestión De Usuarios', 'Administración de Accesos y Credenciales');
    } else if (seccion === 'dispositivos') {
      this.headerService.cambiarHeader('Dispositivos y Pines', 'Control de Hardware y Arduino');
    } else if (seccion === 'logs') {
      this.headerService.cambiarHeader('Logs del Sistema', 'Depuración y registros de actividad serial');
    }
  }
}

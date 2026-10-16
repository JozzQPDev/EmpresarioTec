import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { DashboardComponent } from './dashboard/dashboard';
import { UsersComponent } from './users/users';
import { Logs } from './logs/logs'; // <--- 1. Importa tu componente de logs
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // 1. Pantalla de login independiente (Sin Sidebar)
  {
    path: 'login',
    component: LoginComponent
  },

  // Redirección por defecto
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // 2. Vistas protegidas que SÍ llevan el Sidebar y Header mediante el layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { titulo: 'PANEL DE CONTROL', subtitulo: 'Perímetro de Seguridad' }
      },
      {
        path: 'usuarios',
        component: UsersComponent,
        data: { titulo: 'GESTIÓN DE USUARIOS', subtitulo: 'Administración de Accesos y Credenciales' }
      },
      {
        path: 'logs',
        component: Logs, // <--- 2. Agrega la ruta de logs aquí
        data: { titulo: 'LOGS DEL SISTEMA', subtitulo: 'Depuración y registros de actividad serial' }
      }
    ]
  },

  // Ruta comodín para URLs no encontradas
  {
    path: '**',
    redirectTo: 'login'
  }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { DashboardComponent } from './dashboard/dashboard';
import { UsersComponent } from './users/users';
import { Logs } from './logs/logs';
import { Devices } from './devices/devices'; // <--- Importa tu componente de dispositivos
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
        data: { titulo: 'Panel De Control', subtitulo: 'Perímetro de Seguridad' }
      },
      {
        path: 'devices',
        component: Devices, // <--- Ruta de Dispositivos y Pines
        data: { titulo: 'Dispositivos y Pines', subtitulo: 'Control de Hardware y Arduino' }
      },
      {
        path: 'usuarios',
        component: UsersComponent,
        data: { titulo: 'Gestión De Usuario', subtitulo: 'Administración de Accesos y Credenciales' }
      },
      {
        path: 'logs',
        component: Logs,
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../services/header.service';
// Importa tu servicio de logs o Supabase si ya lo tienes creado, por ejemplo:
// import { LogsService } from '../services/logs.service';

interface SystemLog {
  id: number;
  timestamp: string;
  nivel: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  modulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.html',
  styleUrls: ['./logs.css']
})
export class Logs implements OnInit {

  cargando: boolean = false;
  filtroNivel: string = 'TODOS';

  // Datos de ejemplo (puedes reemplazarlo por tu llamada a Supabase o Flask)
  logs: SystemLog[] = [
    { id: 1, timestamp: '2026-10-16 12:15:30', nivel: 'SUCCESS', modulo: 'AuthService', mensaje: 'Inicio de sesión exitoso - admin@empresariotec.com' },
    { id: 2, timestamp: '2026-10-16 12:10:05', nivel: 'WARNING', modulo: 'Arduino-Sensor', mensaje: 'Advertencia: Movimiento detectado en perímetro norte.' },
    { id: 3, timestamp: '2026-10-16 11:50:12', nivel: 'INFO', modulo: 'Flask-API', mensaje: 'Conexión establecida correctamente con la base de datos Supabase.' },
    { id: 4, timestamp: '2026-10-16 11:30:00', nivel: 'ERROR', modulo: 'Hardware', mensaje: 'Pérdida temporal de señal en el pin digital 7.' },
  ];

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    // Actualizamos el título del header al entrar a esta sección
    this.headerService.cambiarHeader('Logs del Sistema', 'Depuración y registros de actividad serial');
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando = true;
    // Aquí harías la llamada a tu servicio:
    // this.logsService.obtenerLogs().subscribe(data => { this.logs = data; this.cargando = false; });
    setTimeout(() => {
      this.cargando = false;
    }, 500);
  }

  filtrar(nivel: string): void {
    this.filtroNivel = nivel;
  }

  get logsFiltrados(): SystemLog[] {
    if (this.filtroNivel === 'TODOS') {
      return this.logs;
    }
    return this.logs.filter(log => log.nivel === this.filtroNivel);
  }

  limpiarLogs(): void {
    // Lógica para limpiar logs si lo requieres
    this.logs = [];
  }
}

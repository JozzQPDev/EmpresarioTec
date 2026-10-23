import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderService } from '../services/header.service';
import { IntrusionService } from '../services/intrusion.service';
import { AlertaCritica, MonitoreoGeneral } from '../models/intrusion.model';
import { forkJoin } from 'rxjs';
import { SkeletonComponent } from 'boneyard-js/angular';

interface SystemLog {
  id: string;
  timestamp: string;
  nivel: 'WARNING' | 'ERROR' | 'SUCCESS';
  modulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './logs.html',
  styleUrls: ['./logs.css']
})
export class Logs implements OnInit {
  cargando: boolean = true; // 👈 Estado para controlar el esqueleto de carga
  editando: boolean = false;
  filtroNivel = 'TODOS';
  busquedaTexto = '';
  error = '';
  logs: SystemLog[] = [];

  constructor(
    private headerService: HeaderService,
    private intrusionService: IntrusionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headerService.cambiarHeader('Logs del Sistema', 'Depuración y registros de actividad serial');
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    forkJoin({
      alertas: this.intrusionService.obtenerHistorialAlertas(),
      monitoreo: this.intrusionService.obtenerHistorialMonitoreo()
    }).subscribe({
      next: ({ alertas, monitoreo }) => {
        this.logs = this.crearLogs(alertas, monitoreo);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial de actividad:', err);
        this.error = 'No se pudieron cargar los registros. Verifica la conexión con la API.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private crearLogs(alertas: AlertaCritica[], monitoreo: MonitoreoGeneral[]): SystemLog[] {
    const logsAlertas = alertas.map((alerta): SystemLog => ({
      id: `alerta-${alerta.id}`,
      timestamp: alerta.fecha_hora,
      nivel: Number(alerta.codigo) >= 3 ? 'ERROR' : 'WARNING',
      modulo: alerta.dispositivos?.nombre || `Dispositivo #${alerta.dispositivo_id}`,
      mensaje: alerta.mensaje
    }));

    const logsMonitoreo = monitoreo.map((evento): SystemLog => ({
      id: `monitoreo-${evento.id}`,
      timestamp: evento.fecha_hora,
      nivel: 'SUCCESS',
      modulo: evento.dispositivos?.nombre || `Dispositivo #${evento.dispositivo_id}`,
      mensaje: evento.mensaje
    }));

    return [...logsAlertas, ...logsMonitoreo].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  filtrar(nivel: string): void {
    this.filtroNivel = nivel;
  }

  get logsFiltrados(): SystemLog[] {
    return this.logs.filter(log => {
      const cumpleNivel = this.filtroNivel === 'TODOS' || log.nivel === this.filtroNivel;
      const textoQuery = this.busquedaTexto.toLowerCase().trim();
      const cumpleTexto = !textoQuery || 
        log.mensaje.toLowerCase().includes(textoQuery) || 
        log.modulo.toLowerCase().includes(textoQuery);

      return cumpleNivel && cumpleTexto;
    });
  }

  limpiarLogsLocales(): void {
    this.logs = [];
    this.cdr.detectChanges();
  }
}
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderService } from '../services/header.service';
import { IntrusionService } from '../services/intrusion.service';
import { AlertaCritica, MonitoreoGeneral } from '../models/intrusion.model';
import { forkJoin } from 'rxjs';
import { SkeletonComponent } from 'boneyard-js/angular';
import { FeedbackAlertComponent } from '../shared/feedback-alert/feedback-alert';

interface SystemLog {
  id: string;
  timestamp: string;
  nivel: 'WARNING' | 'ERROR' | 'SUCCESS';
  modulo: string;
  ubicacion: string;
  zona: string;
  mensaje: string;
  duracionSegundos?: number;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent, FeedbackAlertComponent],
  templateUrl: './logs.html',
  styleUrls: ['./logs.css']
})
export class Logs implements OnInit {
  cargando: boolean = true; // 👈 Estado para controlar el esqueleto de carga
  editando: boolean = false;
  filtroNivel = 'TODOS';
  busquedaTexto = '';
  filtroZona = 'TODAS';
  filtroDispositivo = 'TODOS';
  fechaDesde = '';
  fechaHasta = '';
  paginaActual = 1;
  readonly tamanoPagina = 10;
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
      ubicacion: alerta.dispositivos?.ubicacion || '',
      zona: this.obtenerZona(Number(alerta.codigo), alerta.mensaje),
      mensaje: alerta.mensaje,
      duracionSegundos: alerta.duracion_segundos
    }));

    const logsMonitoreo = monitoreo.map((evento): SystemLog => ({
      id: `monitoreo-${evento.id}`,
      timestamp: evento.fecha_hora,
      nivel: 'SUCCESS',
      modulo: evento.dispositivos?.nombre || `Dispositivo #${evento.dispositivo_id}`,
      ubicacion: evento.dispositivos?.ubicacion || '',
      zona: this.obtenerZona(Number(evento.codigo), evento.mensaje),
      mensaje: evento.mensaje
    }));

    return [...logsAlertas, ...logsMonitoreo].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  filtrar(nivel: string): void {
    this.filtroNivel = nivel;
    this.paginaActual = 1;
  }

  get dispositivosDisponibles(): string[] {
    return [...new Set(this.logs.map(log => log.modulo))].sort((a, b) => a.localeCompare(b));
  }

  get zonasDisponibles(): string[] {
    return [...new Set(this.logs.map(log => log.zona).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  get logsFiltrados(): SystemLog[] {
    return this.logs.filter(log => {
      const cumpleNivel = this.filtroNivel === 'TODOS' || log.nivel === this.filtroNivel;
      const textoQuery = this.busquedaTexto.toLowerCase().trim();
      const cumpleTexto = !textoQuery || 
        log.mensaje.toLowerCase().includes(textoQuery) || 
        log.modulo.toLowerCase().includes(textoQuery) ||
        log.ubicacion.toLowerCase().includes(textoQuery) ||
        log.zona.toLowerCase().includes(textoQuery);
      const cumpleZona = this.filtroZona === 'TODAS' || log.zona === this.filtroZona;
      const cumpleDispositivo = this.filtroDispositivo === 'TODOS' || log.modulo === this.filtroDispositivo;
      const fechaEvento = this.fechaLocal(log.timestamp);
      const cumpleFechaDesde = !this.fechaDesde || fechaEvento >= this.fechaDesde;
      const cumpleFechaHasta = !this.fechaHasta || fechaEvento <= this.fechaHasta;

      return cumpleNivel && cumpleTexto && cumpleZona && cumpleDispositivo &&
        cumpleFechaDesde && cumpleFechaHasta;
    });
  }

  get logsPaginados(): SystemLog[] {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    return this.logsFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.logsFiltrados.length / this.tamanoPagina));
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = Math.min(Math.max(1, pagina), this.totalPaginas);
  }

  limpiarLogsLocales(): void {
    this.logs = [];
    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  private obtenerZona(codigo: number, mensaje: string): string {
    const zonaSerial = mensaje.match(/(?:^|\|)\s*ZONA\s*:\s*([^|]+)/i)?.[1]?.trim();
    if (zonaSerial) return zonaSerial;

    switch (codigo) {
      case 1: return 'GENERAL';
      case 2:
      case 3: return 'PERIMETRO_LASER';
      case 4: return 'PUERTA_PRINCIPAL';
      case 5: return 'VENTANA_PRINCIPAL';
      default: return '';
    }
  }

  private fechaLocal(timestamp: string): string {
    const fecha = new Date(timestamp);
    if (Number.isNaN(fecha.getTime())) return '';
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
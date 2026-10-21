import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntrusionService } from '../services/intrusion.service';
import { IntrusionState, EstadoPerimetro, AlertaCritica, MonitoreoGeneral } from '../models/intrusion.model';
import { Subscription, interval, of, forkJoin } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  cargando: boolean = true; // 👈 Estado para controlar la visibilidad del Skeleton Loader

  estadoActual: IntrusionState = {
    estado: EstadoPerimetro.SIN_CONEXION,
    intrusiones_totales: 0,
    dispositivo: 'Sensor FC-51 (Pin 2)'
  };

  historialEventos: IntrusionState[] = [];
  historialAlertasBD: AlertaCritica[] = [];
  historialMonitoreoBD: MonitoreoGeneral[] = [];

  totalDispositivos: number = 0;
  porcentajeSeguro: number = 70;
  porcentajeAdvertencia: number = 20;
  porcentajeCritico: number = 10;

  private subscripcionTimer?: Subscription;
  private ultimoEstadoRegistrado: any = null;
  private nombreDispositivo = 'Dispositivo de perímetro';

  constructor(
    private intrusionService: IntrusionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.iniciarMonitoreoTiempoReal();
  }

  ngOnDestroy(): void {
    this.subscripcionTimer?.unsubscribe();
  }

  private cargarDatosIniciales(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    // forkJoin espera a que carguen dispositivos y alertas antes de ocultar el esqueleto
    forkJoin({
      dispositivos: this.intrusionService.obtenerDispositivos().pipe(catchError(() => of([]))),
      alertas: this.intrusionService.obtenerHistorialAlertas().pipe(catchError(() => of([]))),
      monitoreo: this.intrusionService.obtenerHistorialMonitoreo().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ dispositivos, alertas, monitoreo }) => {
        // Dispositivos
        this.totalDispositivos = dispositivos.length;
        const dispositivo = dispositivos.find(item => item.id === 1) ?? dispositivos[0];
        if (dispositivo) {
          this.nombreDispositivo = dispositivo.nombre;
          this.estadoActual.dispositivo = this.nombreDispositivo;
        }

        // Historiales y Estadísticas
        this.historialAlertasBD = alertas;
        this.historialMonitoreoBD = monitoreo;
        this.calcularEstadisticas(alertas);

        // Desactivar Loader
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al inicializar datos del dashboard:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private iniciarMonitoreoTiempoReal(): void {
    this.subscripcionTimer = interval(1000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.intrusionService.obtenerEstado().pipe(
            catchError((err) => {
              console.warn('API Flask desconectada', err);
              return of({
                estado: EstadoPerimetro.SIN_CONEXION,
                intrusiones_totales: this.estadoActual.intrusiones_totales,
                dispositivo: this.nombreDispositivo,
                mensaje: 'Servidor desconectado'
              });
            })
          )
        )
      )
      .subscribe({
        next: (data) => {
          this.estadoActual = { ...data, dispositivo: this.nombreDispositivo };
          this.verificarYAgregarHistorialLocal(data);
          this.cdr.detectChanges();
        }
      });
  }

  private calcularEstadisticas(alertas: AlertaCritica[]): void {
    if (!alertas || alertas.length === 0) return;

    const total = alertas.length;
    const criticos = alertas.filter(a => a.codigo >= 3).length;
    const advertencias = alertas.filter(a => a.codigo === 2).length;

    this.porcentajeCritico = Math.round((criticos / total) * 100);
    this.porcentajeAdvertencia = Math.round((advertencias / total) * 100);
    this.porcentajeSeguro = Math.max(0, 100 - (this.porcentajeCritico + this.porcentajeAdvertencia));
  }

  private verificarYAgregarHistorialLocal(nuevoEstado: IntrusionState): void {
    if (nuevoEstado.estado !== EstadoPerimetro.SIN_CONEXION && nuevoEstado.estado !== this.ultimoEstadoRegistrado) {
      this.ultimoEstadoRegistrado = nuevoEstado.estado;

      this.historialEventos.unshift({
        ...nuevoEstado,
        timestamp: new Date()
      });

      if (this.historialEventos.length > 10) {
        this.historialEventos.pop();
      }
    }
  }

  getNombreEstado(codigo: number): string {
    switch (codigo) {
      case EstadoPerimetro.ZONA_SEGURA: return 'ZONA SEGURA';
      case EstadoPerimetro.ADVERTENCIA: return 'PRESENCIA DETECTADA';
      case EstadoPerimetro.ALERTA_CRITICA: return '¡INTRUSO DETECTADO!';
      case EstadoPerimetro.PUERTA_FORZADA: return '¡PUERTA FORZADA!';
      case EstadoPerimetro.IMPACTO: return '¡IMPACTO DETECTADO!';
      case EstadoPerimetro.SIN_CONEXION: return 'SIN CONEXIÓN';
      default: return 'DESCONOCIDO';
    }
  }

  getClaseEstado(codigo: number): string {
    switch (codigo) {
      case EstadoPerimetro.ZONA_SEGURA: return 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50';
      case EstadoPerimetro.ADVERTENCIA: return 'border-amber-500/30 text-amber-600 bg-amber-50/50';
      case EstadoPerimetro.ALERTA_CRITICA: return 'border-rose-500/50 text-rose-600 bg-rose-50/50';
      case EstadoPerimetro.PUERTA_FORZADA: return 'border-rose-500/50 text-rose-600 bg-rose-50/50';
      case EstadoPerimetro.IMPACTO: return 'border-rose-500/50 text-rose-600 bg-rose-50/50';
      case EstadoPerimetro.SIN_CONEXION: return 'border-slate-300 text-slate-500 bg-slate-100';
      default: return '';
    }
  }
}
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntrusionService } from '../services/intrusion.service';
import { IntrusionState, EstadoPerimetro, AlertaCritica, MonitoreoGeneral } from '../models/intrusion.model';
import { Subscription, interval, of } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  estadoActual: IntrusionState = {
    estado: EstadoPerimetro.SIN_CONEXION,
    intrusiones_totales: 0,
    dispositivo: 'Sensor FC-51 (Pin 2)'
  };

  historialEventos: IntrusionState[] = [];
  historialAlertasBD: AlertaCritica[] = [];
  historialMonitoreoBD: MonitoreoGeneral[] = [];

  private subscripcionTimer?: Subscription;
  private ultimoEstadoRegistrado: any = null;

  constructor(
    private intrusionService: IntrusionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.iniciarMonitoreoTiempoReal();
    this.cargarHistorialesBD();
  }

  ngOnDestroy(): void {
    this.subscripcionTimer?.unsubscribe();
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
                dispositivo: 'Sensor FC-51 (Pin 2)',
                mensaje: 'Servidor desconectado'
              });
            })
          )
        )
      )
      .subscribe({
        next: (data) => {
          this.estadoActual = data;
          this.verificarYAgregarHistorialLocal(data);
          this.cdr.detectChanges();
        }
      });
  }

  cargarHistorialesBD(): void {
    this.intrusionService.obtenerHistorialAlertas().subscribe({
      next: (data) => this.historialAlertasBD = data,
      error: (err) => console.error('Error al cargar alertas:', err)
    });

    this.intrusionService.obtenerHistorialMonitoreo().subscribe({
      next: (data) => this.historialMonitoreoBD = data,
      error: (err) => console.error('Error al cargar monitoreo:', err)
    });
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
      case EstadoPerimetro.SIN_CONEXION: return 'SIN CONEXIÓN';
      default: return 'DESCONOCIDO';
    }
  }

  getClaseEstado(codigo: number): string {
    switch (codigo) {
      case EstadoPerimetro.ZONA_SEGURA: return 'border-emerald-500/30';
      case EstadoPerimetro.ADVERTENCIA: return 'border-amber-500/30';
      case EstadoPerimetro.ALERTA_CRITICA: return 'border-rose-500/50 bg-rose-50/10';
      case EstadoPerimetro.SIN_CONEXION: return 'border-slate-300 bg-slate-100';
      default: return '';
    }
  }
}

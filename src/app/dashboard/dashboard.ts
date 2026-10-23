import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntrusionService } from '../services/intrusion.service';
import { IntrusionState, EstadoPerimetro, AlertaCritica, MonitoreoGeneral, Dispositivo } from '../models/intrusion.model';
import { Subscription, MonoTypeOperatorFunction, interval, of, forkJoin } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';
import { SkeletonComponent } from 'boneyard-js/angular';
import { DASHBOARD_BONES } from './dashboard-bones';

const FORMATO_HORA_PERU = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/Lima',
  hour: '2-digit',
  hourCycle: 'h23'
});

export type NivelPerimetro = 'desconectado' | 'seguro' | 'advertencia' | 'critico';
export type FiltroNivel = 'todos' | 'advertencia' | 'critico';

// ---- Datos precalculados para los gráficos ----
export interface PuntoDia {
  etiqueta: string;      // "lun", "mar"...
  fechaCompleta: string; // para el tooltip
  advertencias: number;
  criticos: number;
  total: number;
  advPct: number;        // altura del tramo ámbar (0-100)
  critPct: number;       // altura del tramo rojo (0-100)
}
export interface PuntoTipo {
  codigo: number;
  nombre: string;
  total: number;
  pct: number;           // ancho relativo al tipo más frecuente (0-100)
}
export interface PuntoHora {
  hora: number;
  total: number;
  pct: number;           // altura relativa a la hora más activa (0-100)
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  readonly bonesCarga = DASHBOARD_BONES;
  cargando = true;
  error = '';                       // NUEVO: mensaje de error de carga
  ultimaLectura: Date | null = null; // NUEVO: última respuesta válida del Arduino
  filtroNivel: FiltroNivel = 'todos'; // NUEVO: filtro del historial

  estadoActual: IntrusionState = {
    estado: EstadoPerimetro.SIN_CONEXION,
    intrusiones_totales: 0,
    dispositivo: 'Sensor FC-51 (Pin 2)'
  };

  historialEventos: IntrusionState[] = [];
  historialAlertasBD: AlertaCritica[] = [];
  historialMonitoreoBD: MonitoreoGeneral[] = [];

  // NUEVO: series para los gráficos (se calculan en calcularGraficos)
  alertasPorDia: PuntoDia[] = [];
  alertasPorTipo: PuntoTipo[] = [];
  alertasPorHora: PuntoHora[] = [];
  lineaTiempo: IntrusionState[] = [];   // cambios de estado de esta sesión, del más antiguo al más reciente
  alertas7Dias = 0;
  duracionMedia: number | null = null;  // segundos
  horaPico: number | null = null;

  totalDispositivos = 0;
  // CAMBIO: antes arrancaban en 70/20/10 (datos inventados). Ahora 0 hasta tener datos reales.
  porcentajeSeguro = 0;
  porcentajeAdvertencia = 0;
  porcentajeCritico = 0;
  eventosSeguros = 0;
  eventosAdvertencia = 0;
  eventosCriticos = 0;
  totalEventosClasificados = 0;
  nivelDistribucionHover: 'seguro' | 'advertencia' | 'critico' | null = null;

  private subscripcionTimer?: Subscription;
  private ultimoEstadoRegistrado: number | null = null;
  private nombreDispositivo = 'Dispositivo de perímetro';
  private fallosDeCarga = 0;

  constructor(
    private intrusionService: IntrusionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarMonitoreoTiempoReal();
  }

  ngOnDestroy(): void {
    this.subscripcionTimer?.unsubscribe();
  }

  // ---------- Propiedades derivadas para la plantilla ----------

  /** Nivel que dibuja el titular de estado. */
  get nivelActual(): NivelPerimetro {
    return this.nivelDeCodigo(this.estadoActual.estado);
  }

  /** Conectado = el último estado recibido no es SIN_CONEXION. */
  get conectado(): boolean {
    return this.estadoActual.estado !== EstadoPerimetro.SIN_CONEXION;
  }

  get zonaActual(): string {
    return this.obtenerCamposMensaje()['ZONA'] ?? '';
  }

  get descripcionActual(): string {
    return this.obtenerCamposMensaje()['DESCRIPCION'] ?? '';
  }

  /** El backend antepone el nombre del estado ("ZONA SEGURA: ..."); el titular ya lo dice, así que se quita. */
  get mensajeEstado(): string {
    const mensaje = (this.estadoActual.mensaje ?? '').trim();
    if (this.zonaActual || this.descripcionActual) return '';

    const i = mensaje.indexOf(':');
    if (i <= 0) return mensaje;

    const prefijo = mensaje.slice(0, i).trim().toLowerCase();
    const nombre = this.getNombreEstado(this.estadoActual.estado).toLowerCase();
    return prefijo === nombre ? mensaje.slice(i + 1).trim() : mensaje;
  }

  private obtenerCamposMensaje(): Record<string, string> {
    const mensaje = this.estadoActual.mensaje ?? '';
    return Object.fromEntries(
      mensaje.split('|').flatMap(segmento => {
        const separador = segmento.indexOf(':');
        if (separador < 0) return [];

        const campo = segmento.slice(0, separador).trim().toUpperCase();
        const valor = segmento.slice(separador + 1).trim();
        return campo && valor ? [[campo, valor]] : [];
      })
    );
  }

  get historialFiltrado(): AlertaCritica[] {
    if (this.filtroNivel === 'todos') return this.historialAlertasBD;
    return this.historialAlertasBD.filter(a => this.nivelDeCodigo(a.codigo) === this.filtroNivel);
  }

  trackById = (_: number, alerta: AlertaCritica): unknown =>
    (alerta as any).id ?? alerta.fecha_hora;

  formatearDuracion(seg: number | null | undefined): string {
    if (seg == null) return '—';
    const m = Math.floor(seg / 60);
    const s = Math.round(seg % 60);
    return m > 0 ? `${m} min ${s} s` : `${s} s`;
  }

  formatearHora(hora: number): string {
    const hora12 = hora % 12 || 12;
    const periodo = hora < 12 ? 'AM' : 'PM';
    return `${hora12.toString().padStart(2, '0')}:00 ${periodo}`;
  }

  private nivelDeCodigo(codigo: number): NivelPerimetro {
    switch (codigo) {
      case EstadoPerimetro.ZONA_SEGURA: return 'seguro';
      case EstadoPerimetro.ADVERTENCIA: return 'advertencia';
      case EstadoPerimetro.ALERTA_CRITICA:
      case EstadoPerimetro.PUERTA_FORZADA:
      case EstadoPerimetro.IMPACTO: return 'critico';
      default: return 'desconectado';
    }
  }

  // ---------- Carga ----------

  /** Carga (o recarga) dispositivos, alertas y monitoreo. Lo usa también el botón "Reintentar". */
  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.fallosDeCarga = 0;
    this.cdr.detectChanges();

    forkJoin({
      dispositivos: this.intrusionService.obtenerDispositivos().pipe(this.conFallback([] as Dispositivo[])),
      alertas: this.intrusionService.obtenerHistorialAlertas().pipe(this.conFallback([] as AlertaCritica[])),
      monitoreo: this.intrusionService.obtenerHistorialMonitoreo().pipe(this.conFallback([] as MonitoreoGeneral[]))
    }).subscribe({
      next: ({ dispositivos, alertas, monitoreo }) => {
        this.totalDispositivos = dispositivos.length;
        const dispositivo = dispositivos.find(item => item.id === 1) ?? dispositivos[0];
        if (dispositivo) {
          this.nombreDispositivo = dispositivo.nombre;
          this.estadoActual.dispositivo = this.nombreDispositivo;
        }

        this.historialAlertasBD = alertas;
        this.historialMonitoreoBD = monitoreo;
        this.calcularEstadisticas(alertas, monitoreo);

        if (this.fallosDeCarga > 0) {
          this.error = this.fallosDeCarga >= 3
            ? 'No se pudieron cargar los datos. Verifica la conexión con la API.'
            : 'Algunos datos no se pudieron cargar.';
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al inicializar datos del dashboard:', err);
        this.error = 'No se pudieron cargar los datos. Verifica la conexión con la API.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Si la petición falla, devuelve `valor` y cuenta el fallo para mostrar el aviso de error. */
  private conFallback<T>(valor: T): MonoTypeOperatorFunction<T> {
    return catchError(() => {
      this.fallosDeCarga++;
      return of(valor);
    });
  }

  /** Refresca ambos historiales sin skeleton al detectar una intrusión nueva. */
  private recargarAlertas(): void {
    forkJoin({
      alertas: this.intrusionService.obtenerHistorialAlertas(),
      monitoreo: this.intrusionService.obtenerHistorialMonitoreo()
    })
      .pipe(catchError(() => of(null)))
      .subscribe(historial => {
        if (!historial) return;
        this.historialAlertasBD = historial.alertas;
        this.historialMonitoreoBD = historial.monitoreo;
        this.calcularEstadisticas(historial.alertas, historial.monitoreo);
        this.cdr.detectChanges();
      });
  }

  // ---------- Tiempo real ----------

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
          if (data.estado !== EstadoPerimetro.SIN_CONEXION) {
            this.ultimaLectura = new Date();
          }
          this.verificarYAgregarHistorialLocal(data);
          this.cdr.detectChanges();
        }
      });
  }

  private calcularEstadisticas(alertas: AlertaCritica[], monitoreo: MonitoreoGeneral[]): void {
    this.calcularGraficos(alertas ?? []);
    const conteos = { seguro: 0, advertencia: 0, critico: 0 };
    for (const evento of monitoreo ?? []) {
      if (this.nivelDeCodigo(Number(evento.codigo)) === 'seguro') conteos.seguro++;
    }
    for (const alerta of alertas ?? []) {
      const nivel = this.nivelDeCodigo(Number(alerta.codigo));
      if (nivel === 'advertencia' || nivel === 'critico') conteos[nivel]++;
    }

    this.totalEventosClasificados = conteos.seguro + conteos.advertencia + conteos.critico;
    this.eventosSeguros = conteos.seguro;
    this.eventosAdvertencia = conteos.advertencia;
    this.eventosCriticos = conteos.critico;
    if (this.totalEventosClasificados === 0) {
      this.porcentajeSeguro = this.porcentajeAdvertencia = this.porcentajeCritico = 0;
      this.nivelDistribucionHover = null;
      return;
    }

    const niveles = ['seguro', 'advertencia', 'critico'] as const;
    const porcentajes: {
      nivel: keyof typeof conteos;
      porcentaje: number;
      resto: number;
    }[] = niveles.map(nivel => {
      const exacto = (conteos[nivel] / this.totalEventosClasificados) * 100;
      const porcentaje = Math.floor(exacto);
      return { nivel, porcentaje, resto: exacto - porcentaje };
    });

    let puntosRestantes = 100 - porcentajes.reduce((suma, item) => suma + item.porcentaje, 0);
    const porcentajesOrdenados = [...porcentajes].sort((a, b) => b.resto - a.resto);
    for (let i = 0; i < puntosRestantes; i++) {
      porcentajesOrdenados[i].porcentaje++;
    }

    const porcentajesPorNivel = { seguro: 0, advertencia: 0, critico: 0 };
    for (const item of porcentajes) {
      porcentajesPorNivel[item.nivel] = item.porcentaje;
    }

    this.porcentajeSeguro = porcentajesPorNivel.seguro;
    this.porcentajeAdvertencia = porcentajesPorNivel.advertencia;
    this.porcentajeCritico = porcentajesPorNivel.critico;
  }

  private verificarYAgregarHistorialLocal(nuevoEstado: IntrusionState): void {
    if (nuevoEstado.estado === EstadoPerimetro.SIN_CONEXION || nuevoEstado.estado === this.ultimoEstadoRegistrado) {
      return;
    }
    this.ultimoEstadoRegistrado = nuevoEstado.estado;

    this.historialEventos.unshift({ ...nuevoEstado, timestamp: new Date() });
    if (this.historialEventos.length > 10) this.historialEventos.pop();
    this.lineaTiempo = [...this.historialEventos].reverse();

    // Entró en estado crítico: trae el historial actualizado de la BD
    if (this.nivelDeCodigo(nuevoEstado.estado) === 'critico') {
      this.recargarAlertas();
    }
  }

  // ---------- Series para los gráficos ----------

  private calcularGraficos(alertas: AlertaCritica[]): void {
    // 1) Últimos 7 días, apilado por advertencia / crítico
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dias: { fecha: Date; adv: number; crit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const f = new Date(hoy);
      f.setDate(hoy.getDate() - i);
      dias.push({ fecha: f, adv: 0, crit: 0 });
    }
    const claveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const indicePorDia = new Map(dias.map((d, i) => [claveDia(d.fecha), i]));

    // 2) Por hora del día y 3) por tipo
    const horas = new Array(24).fill(0);
    const tipos = [
      EstadoPerimetro.ADVERTENCIA,
      EstadoPerimetro.ALERTA_CRITICA,
      EstadoPerimetro.PUERTA_FORZADA,
      EstadoPerimetro.IMPACTO
    ];
    const porTipo = new Map<number, number>(tipos.map(t => [t, 0]));

    let sumaDuracion = 0;
    let conDuracion = 0;

    for (const a of alertas) {
      const nivel = this.nivelDeCodigo(a.codigo);
      const fecha = new Date(a.fecha_hora);
      if (!isNaN(fecha.getTime())) {
        const horaPeru = Number(FORMATO_HORA_PERU.format(fecha));
        horas[horaPeru]++;
        const i = indicePorDia.get(claveDia(fecha));
        if (i !== undefined) {
          if (nivel === 'critico') dias[i].crit++;
          else if (nivel === 'advertencia') dias[i].adv++;
        }
      }
      if (porTipo.has(a.codigo)) porTipo.set(a.codigo, (porTipo.get(a.codigo) ?? 0) + 1);
      if (typeof a.duracion_segundos === 'number') {
        sumaDuracion += a.duracion_segundos;
        conDuracion++;
      }
    }

    const maxDia = Math.max(1, ...dias.map(d => d.adv + d.crit));
    this.alertasPorDia = dias.map(d => ({
      etiqueta: d.fecha.toLocaleDateString('es', { weekday: 'short' }).replace('.', ''),
      fechaCompleta: d.fecha.toLocaleDateString('es', { day: 'numeric', month: 'long' }),
      advertencias: d.adv,
      criticos: d.crit,
      total: d.adv + d.crit,
      advPct: (d.adv / maxDia) * 100,
      critPct: (d.crit / maxDia) * 100
    }));
    this.alertas7Dias = this.alertasPorDia.reduce((acc, d) => acc + d.total, 0);

    const maxHora = Math.max(1, ...horas);
    this.alertasPorHora = horas.map((total, hora) => ({ hora, total, pct: (total / maxHora) * 100 }));
    const maxTotalHora = Math.max(...horas);
    this.horaPico = maxTotalHora > 0 ? horas.indexOf(maxTotalHora) : null;

    const maxTipo = Math.max(1, ...Array.from(porTipo.values()));
    this.alertasPorTipo = tipos.map(codigo => {
      const total = porTipo.get(codigo) ?? 0;
      return { codigo, nombre: this.getNombreEstado(codigo), total, pct: (total / maxTipo) * 100 };
    });

    this.duracionMedia = conDuracion > 0 ? Math.round(sumaDuracion / conDuracion) : null;
  }

  // ---------- Etiquetas de la tabla ----------

  getNombreEstado(codigo: number): string {
    switch (codigo) {
      case EstadoPerimetro.ZONA_SEGURA: return 'Zona segura';
      case EstadoPerimetro.ADVERTENCIA: return 'Presencia detectada';
      case EstadoPerimetro.ALERTA_CRITICA: return 'Intruso detectado';
      case EstadoPerimetro.PUERTA_FORZADA: return 'Puerta forzada';
      case EstadoPerimetro.IMPACTO: return 'Impacto detectado';
      case EstadoPerimetro.SIN_CONEXION: return 'Sin conexión';
      default: return 'Desconocido';
    }
  }

  /** Color sólido para barras y segmentos de los gráficos. */
  getColorBarra(codigo: number): string {
    switch (this.nivelDeCodigo(codigo)) {
      case 'seguro': return 'bg-emerald-500';
      case 'advertencia': return 'bg-amber-500';
      case 'critico': return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  }

  getClaseEstado(codigo: number): string {
    switch (this.nivelDeCodigo(codigo)) {
      case 'seguro': return 'bg-emerald-50 text-emerald-700';
      case 'advertencia': return 'bg-amber-50 text-amber-700';
      case 'critico': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  }
}
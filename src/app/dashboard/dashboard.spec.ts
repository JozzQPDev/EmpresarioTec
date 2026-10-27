import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { IntrusionService } from '../services/intrusion.service';
import { EstadoPerimetro } from '../models/intrusion.model';
import { of } from 'rxjs';

describe('Dashboard', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{
        provide: IntrusionService,
        useValue: {
          obtenerDispositivos: () => of([{ id: 1, nombre: 'Arduino Perímetro' }]),
          obtenerEstado: () => of({
            estado: EstadoPerimetro.ZONA_SEGURA,
            intrusiones_totales: 0,
            dispositivo: 'Dispositivo de perímetro',
            zona: 'GENERAL',
            descripcion: 'Monitoreando.',
            serial_conectado: true,
            telemetria_vigente: true,
            ultima_telemetria: '2026-10-27T08:30:00-05:00',
            sensores: {
              luz: 400,
              luz_base: 500,
              puerta_abierta: false,
              impacto_detectado: false
            },
            configuracion_aplicada: true
          }),
          obtenerConfiguracionUmbrales: () => of({
            margen_cambio: 40,
            tiempo_escalamiento_ms: 3000,
            aplicada: true,
            pendiente: false
          }),
          actualizarConfiguracionUmbrales: (configuracion: {
            margen_cambio: number;
            tiempo_escalamiento_ms: number;
          }) => of({
            ...configuracion,
            aplicada: true,
            pendiente: false,
            mensaje: 'Configuración aplicada'
          }),
          obtenerHistorialAlertas: () => of([
            { id: 1, codigo: EstadoPerimetro.ADVERTENCIA },
            { id: 2, codigo: EstadoPerimetro.ALERTA_CRITICA },
            { id: 3, codigo: EstadoPerimetro.SIN_CONEXION },
            { id: 4, codigo: 99 }
          ]),
          obtenerHistorialMonitoreo: () => of([
            { id: 1, codigo: EstadoPerimetro.ZONA_SEGURA },
            { id: 2, codigo: EstadoPerimetro.ZONA_SEGURA },
            { id: 3, codigo: EstadoPerimetro.ADVERTENCIA }
          ])
        }
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the zone and description from a structured status message', () => {
    component.estadoActual.mensaje =
      'ESTADO:1 | ZONA:GENERAL | DESCRIPCION: Zonas seguras. Sistema monitoreando activamente.';
    component.estadoActual.zona = '';
    component.estadoActual.descripcion = '';

    expect(component.zonaActual).toBe('GENERAL');
    expect(component.descripcionActual).toBe('Zonas seguras. Sistema monitoreando activamente.');
    expect(component.mensajeEstado).toBe('');
  });

  it('uses the specific label for each critical perimeter state', () => {
    component.estadoActual.estado = EstadoPerimetro.ALERTA_CRITICA;
    expect(component.tituloEstadoActual).toBe('Intruso detectado');

    component.estadoActual.estado = EstadoPerimetro.PUERTA_FORZADA;
    expect(component.tituloEstadoActual).toBe('Puerta forzada');

    component.estadoActual.estado = EstadoPerimetro.IMPACTO;
    expect(component.tituloEstadoActual).toBe('Impacto detectado');
  });

  it('shows the Arduino as disconnected when the API reports a serial failure', () => {
    component.estadoActual.estado = EstadoPerimetro.ZONA_SEGURA;
    component.estadoActual.serial_conectado = false;

    expect(component.conectado).toBe(false);
    expect(component.nivelActual).toBe('desconectado');
    expect(component.tituloEstadoActual).toBe('Sin conexión con el Arduino');
  });

  it('distinguishes an unavailable API from a disconnected Arduino', () => {
    component.apiDisponible = false;
    expect(component.mensajeDiagnostico).toBe('No se puede comunicar con la API.');

    component.apiDisponible = true;
    component.estadoActual.serial_conectado = false;
    expect(component.mensajeDiagnostico)
      .toBe('La API responde, pero la telemetría del Arduino no llegó en los últimos 3 segundos.');

    component.estadoActual.serial_conectado = true;
    expect(component.mensajeDiagnostico).toBe('API y Arduino conectados.');
  });

  it('lists the hardware pins declared in the Arduino firmware', () => {
    expect(component.componentesHardware.map(componente => componente.pin))
      .toEqual(['A0', '9', '10', '3', '4', '5', '7', '8']);
  });

  it('displays the sensor readings and telemetry timestamp returned by the API', () => {
    expect(component.estadoActual.sensores?.luz).toBe(400);
    expect(component.fechaUltimaTelemetria?.toISOString())
      .toBe('2026-10-27T13:30:00.000Z');
  });

  it('uses safe default thresholds when the API response omits them', () => {
    expect(component.estadoActual.umbrales).toEqual({
      margen_cambio: 40,
      tiempo_escalamiento_ms: 3000
    });
  });

  it('calculates level percentages only from classified events', () => {
    expect(component.totalEventosClasificados).toBe(4);
    expect(component.porcentajeSeguro).toBe(50);
    expect(component.porcentajeAdvertencia).toBe(25);
    expect(component.porcentajeCritico).toBe(25);
  });

  it('shows a level tooltip when hovering its donut segment', () => {
    const segmentoReposo = fixture.nativeElement.querySelector(
      'circle[aria-label^="Reposo"]'
    ) as SVGCircleElement;

    segmentoReposo.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="tooltip"]')?.textContent)
      .toContain('2 eventos · 50%');
  });
});

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
            dispositivo: 'Dispositivo de perímetro'
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

    expect(component.zonaActual).toBe('GENERAL');
    expect(component.descripcionActual).toBe('Zonas seguras. Sistema monitoreando activamente.');
    expect(component.mensajeEstado).toBe('');
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

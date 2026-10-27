import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Logs } from './logs';
import { IntrusionService } from '../services/intrusion.service';
import { of } from 'rxjs';

describe('Logs', () => {
  let component: Logs;
  let fixture: ComponentFixture<Logs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logs],
      providers: [{
        provide: IntrusionService,
        useValue: {
          obtenerHistorialAlertas: () => of([]),
          obtenerHistorialMonitoreo: () => of([])
        }
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(Logs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters by zone, device and inclusive date range', () => {
    component.logs = [
      {
        id: 'alerta-1',
        timestamp: '2026-10-25T10:00:00',
        nivel: 'ERROR',
        modulo: 'Arduino',
        ubicacion: 'Entrada',
        zona: 'PUERTA_PRINCIPAL',
        mensaje: 'Puerta abierta'
      },
      {
        id: 'alerta-2',
        timestamp: '2026-10-26T10:00:00',
        nivel: 'ERROR',
        modulo: 'Arduino',
        ubicacion: 'Ventana',
        zona: 'VENTANA_PRINCIPAL',
        mensaje: 'Impacto detectado'
      }
    ];
    component.filtroZona = 'PUERTA_PRINCIPAL';
    component.filtroDispositivo = 'Arduino';
    component.fechaDesde = '2026-10-25';
    component.fechaHasta = '2026-10-25';

    expect(component.logsFiltrados.map(log => log.id)).toEqual(['alerta-1']);
  });

  it('paginates filtered events by ten records', () => {
    component.logs = Array.from({ length: 25 }, (_, index) => ({
      id: `monitoreo-${index}`,
      timestamp: '2026-10-25T10:00:00',
      nivel: 'SUCCESS' as const,
      modulo: 'Arduino',
      ubicacion: 'Entrada',
      zona: 'GENERAL',
      mensaje: 'Monitoreando'
    }));

    expect(component.logsPaginados).toHaveLength(10);
    component.cambiarPagina(3);
    expect(component.logsPaginados).toHaveLength(5);
    expect(component.totalPaginas).toBe(3);
  });
});

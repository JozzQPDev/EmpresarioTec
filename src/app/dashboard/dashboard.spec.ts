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
          obtenerHistorialAlertas: () => of([]),
          obtenerHistorialMonitoreo: () => of([])
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
});

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
});

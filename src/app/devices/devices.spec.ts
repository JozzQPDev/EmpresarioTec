import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Devices } from './devices';
import { DeviceService } from '../services/device.service';
import { HeaderService } from '../services/header.service';
import { Dispositivo } from '../models/intrusion.model';
import { of } from 'rxjs';

describe('Devices', () => {
  let component: Devices;
  let fixture: ComponentFixture<Devices>;
  let dispositivosCreados: Partial<Dispositivo>[];
  let dispositivosActualizados: number[];
  let dispositivosEliminados: number[];
  const dispositivo: Dispositivo = {
    id: 7,
    nombre: 'Sensor de acceso',
    activo: true
  };

  beforeEach(async () => {
    dispositivosCreados = [];
    dispositivosActualizados = [];
    dispositivosEliminados = [];

    await TestBed.configureTestingModule({
      imports: [Devices],
      providers: [
        {
          provide: DeviceService,
          useValue: {
            obtenerDispositivos: () => of([dispositivo]),
            crearDispositivo: (nuevo: Partial<Dispositivo>) => {
              dispositivosCreados.push(nuevo);
              return of({});
            },
            actualizarDispositivo: (id: number) => {
              dispositivosActualizados.push(id);
              return of({});
            },
            eliminarDispositivo: (id: number) => {
              dispositivosEliminados.push(id);
              return of({});
            }
          }
        },
        { provide: HeaderService, useValue: { cambiarHeader: () => {} } }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Devices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires confirmation before creating a device', () => {
    component.abrirModalCrear();
    component.dispositivoForm.nombre = 'Sensor nuevo';
    component.guardarDispositivo();

    expect(component.accionConfirmacion).toBe('create');
    expect(dispositivosCreados).toEqual([]);

    component.confirmarAccion();

    expect(dispositivosCreados).toHaveLength(1);
    expect(dispositivosCreados[0].nombre).toBe('Sensor nuevo');
  });

  it('requires confirmation before updating a device', () => {
    component.editarDispositivo(dispositivo);
    component.dispositivoForm.nombre = 'Sensor actualizado';
    component.guardarDispositivo();

    expect(dispositivosActualizados).toEqual([]);

    component.confirmarAccion();

    expect(dispositivosActualizados).toEqual([7]);
  });

  it('only deletes a device after its exact name is confirmed', () => {
    component.abrirConfirmacionEliminar(dispositivo);
    component.confirmarAccion();

    expect(dispositivosEliminados).toEqual([]);

    component.nombreConfirmacionEliminacion = 'sensor de acceso';
    component.confirmarAccion();

    expect(dispositivosEliminados).toEqual([7]);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersComponent } from './users';
import { IntrusionService } from '../services/intrusion.service';
import { Usuario } from '../models/intrusion.model';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let usuariosEliminados: number[];
  let usuariosActualizados: number[];
  const usuario: Usuario = {
    id: 7,
    nombre: 'Ana Pérez',
    email: 'ana@example.com',
    rol_id: 1,
    activo: true,
  };

  beforeEach(async () => {
    usuariosEliminados = [];
    usuariosActualizados = [];
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [{
        provide: IntrusionService,
        useValue: {
          obtenerUsuarios: () => of([usuario]),
          obtenerRoles: () => of([]),
          eliminarUsuario: (id: number) => {
            usuariosEliminados.push(id);
            return of({});
          },
          actualizarUsuario: (id: number) => {
            usuariosActualizados.push(id);
            return of({});
          },
        },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not delete until the selected user name is confirmed', () => {
    component.abrirModalEliminar(usuario);
    component.nombreConfirmacionEliminacion = 'Ana';
    component.confirmarEliminacion();

    expect(usuariosEliminados).toEqual([]);
    expect(component.usuarioAEliminar).toBe(usuario);
  });

  it('deletes only after the exact name is entered, ignoring case and surrounding spaces', () => {
    component.abrirModalEliminar(usuario);
    component.nombreConfirmacionEliminacion = '  ana pérez  ';
    component.confirmarEliminacion();

    expect(usuariosEliminados).toEqual([7]);
    expect(component.usuarioAEliminar).toBeNull();
  });

  it('asks for confirmation before saving user edits', () => {
    component.editarUsuarioModal(usuario);
    component.guardarUsuario();

    expect(component.confirmacionEdicion).toBe(true);
    expect(usuariosActualizados).toEqual([]);

    component.confirmarAccion();

    expect(usuariosActualizados).toEqual([7]);
    expect(component.confirmacionEdicion).toBe(false);
  });
});

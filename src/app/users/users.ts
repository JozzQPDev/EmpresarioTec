import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntrusionService } from '../services/intrusion.service';
import { HeaderService } from '../services/header.service';
import { Usuario, Rol } from '../models/intrusion.model';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent],
  styleUrl: './users.css',
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  usuarioForm: Usuario = {
    nombre: '',
    email: '',
    password: '',
    rol_id: 1,
    activo: true
  };

  cargando: boolean = true; // 👈 Estado para controlar el esqueleto de carga
  editando: boolean = false;
  usuarioIdEditando?: number;
  mostrarModal: boolean = false;
  usuarioAEliminar: Usuario | null = null;
  nombreConfirmacionEliminacion = '';
  eliminandoUsuario = false;
  confirmacionEdicion = false;
  actualizandoUsuario = false;

  mensajeAlerta: string = '';
  tipoAlerta: 'success' | 'error' = 'success';
  private alertaTimer: any;

  constructor(
    private intrusionService: IntrusionService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headerService.cambiarHeader(
      'Gestión De Usuario',
      'Administración de Accesos y Credenciales'
    );

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    // Cargamos usuarios y roles de forma paralela
    this.intrusionService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.intrusionService.obtenerRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar roles:', err)
    });
  }

  abrirModalCrear(): void {
    this.resetForm();
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  editarUsuarioModal(usuario: Usuario): void {
    this.editando = true;
    this.usuarioIdEditando = usuario.id;
    this.usuarioForm = {
      nombre: usuario.nombre,
      email: usuario.email,
      rol_id: usuario.rol_id,
      activo: usuario.activo ?? true
    };
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.confirmacionEdicion = false;
    this.resetForm();
    this.cdr.detectChanges();
  }

  guardarUsuario(): void {
    if (this.editando && this.usuarioIdEditando !== undefined) {
      this.confirmacionEdicion = true;
    } else {
      this.intrusionService.crearUsuario(this.usuarioForm).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarDatos();
          this.mostrarAlerta('Usuario creado exitosamente', 'success');
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.mostrarAlerta('Error al crear el usuario. Verifica los datos.', 'error');
        }
      });
    }
  }

  confirmarAccion(): void {
    if (this.usuarioAEliminar) {
      this.confirmarEliminacion();
      return;
    }

    if (this.confirmacionEdicion) {
      this.ejecutarActualizacion();
    }
  }

  cerrarConfirmacion(): void {
    if (this.eliminandoUsuario || this.actualizandoUsuario) return;

    if (this.usuarioAEliminar) {
      this.cerrarModalEliminar();
    } else {
      this.confirmacionEdicion = false;
    }
  }

  private ejecutarActualizacion(): void {
    if (!this.editando || this.usuarioIdEditando === undefined || this.actualizandoUsuario) return;

    this.actualizandoUsuario = true;
    this.intrusionService.actualizarUsuario(this.usuarioIdEditando, this.usuarioForm).subscribe({
      next: () => {
        this.actualizandoUsuario = false;
        this.confirmacionEdicion = false;
        this.cerrarModal();
        this.cargarDatos();
        this.mostrarAlerta('Usuario actualizado correctamente', 'success');
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        this.actualizandoUsuario = false;
        this.mostrarAlerta('Error al actualizar el usuario', 'error');
      }
    });
  }

  abrirModalEliminar(usuario: Usuario): void {
    if (usuario.id === undefined) {
      console.error('No se puede eliminar un usuario sin identificador.');
      this.mostrarAlerta('No se puede eliminar este usuario porque no tiene identificador.', 'error');
      return;
    }

    this.usuarioAEliminar = usuario;
    this.nombreConfirmacionEliminacion = '';
    this.cdr.detectChanges();
  }

  cerrarModalEliminar(): void {
    if (this.eliminandoUsuario) return;

    this.usuarioAEliminar = null;
    this.nombreConfirmacionEliminacion = '';
    this.cdr.detectChanges();
  }

  confirmarEliminacion(): void {
    if (!this.usuarioAEliminar?.id || this.eliminandoUsuario) return;

    const usuarioId = this.usuarioAEliminar.id;
    this.eliminandoUsuario = true;

    this.intrusionService.eliminarUsuario(usuarioId).subscribe({
      next: () => {
        this.eliminandoUsuario = false;
        this.cerrarModalEliminar();
        this.cargarDatos();
        this.mostrarAlerta('Usuario eliminado correctamente', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.eliminandoUsuario = false;
        this.mostrarAlerta('No se pudo eliminar el usuario', 'error');
      }
    });
  }

  resetForm(): void {
    this.editando = false;
    this.usuarioIdEditando = undefined;
    this.usuarioForm = {
      nombre: '',
      email: '',
      password: '',
      rol_id: 1,
      activo: true
    };
  }

  mostrarAlerta(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;

    if (this.alertaTimer) clearTimeout(this.alertaTimer);

    this.alertaTimer = setTimeout(() => {
      this.mensajeAlerta = '';
      this.cdr.detectChanges();
    }, 3500);
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntrusionService } from '../services/intrusion.service';
import { HeaderService } from '../services/header.service';
import { Usuario, Rol } from '../models/intrusion.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  editando: boolean = false;
  usuarioIdEditando?: number;
  mostrarModal: boolean = false;

  mensajeAlerta: string = '';
  tipoAlerta: 'success' | 'error' = 'success';
  private alertaTimer: any;

  constructor(
    private intrusionService: IntrusionService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef // 👈 Inyección del detector de cambios
  ) {}

  ngOnInit(): void {
    this.headerService.cambiarHeader(
      'GESTIÓN DE USUARIOS',
      'Administración de Accesos y Credenciales'
    );

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.intrusionService.obtenerUsuarios().subscribe({
      next: (data) => {
        console.log('DATOS ASIGNADOS A LA TABLA:', data);
        this.usuarios = data;
        this.cdr.detectChanges(); // 👈 Fuerza el pintado inmediato en la vista
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
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
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.resetForm();
  }

  guardarUsuario(): void {
    if (this.editando && this.usuarioIdEditando !== undefined) {
      this.intrusionService.actualizarUsuario(this.usuarioIdEditando, this.usuarioForm).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarDatos();
          this.mostrarAlerta('Usuario actualizado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.mostrarAlerta('Error al actualizar el usuario', 'error');
        }
      });
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

  eliminarUsuario(id?: number): void {
    if (id === undefined) return;
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.intrusionService.eliminarUsuario(id).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarAlerta('Usuario eliminado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          this.mostrarAlerta('No se pudo eliminar el usuario', 'error');
        }
      });
    }
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
    }, 3500);
  }
}

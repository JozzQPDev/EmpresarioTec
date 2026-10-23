import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../services/device.service';
import { Dispositivo } from '../models/intrusion.model';
import { HeaderService } from '../services/header.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog';

type DeviceAction = 'create' | 'edit' | 'delete';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent],
  selector: 'app-devices',
  styleUrl: './devices.css',
  templateUrl: './devices.html',
})
export class Devices implements OnInit {
  dispositivos: Dispositivo[] = [];
  dispositivoForm: Partial<Dispositivo> = this.nuevoDispositivo();

  // Gestión de imágenes y archivo físico
  archivoSeleccionado: File | null = null;
  previewImagenUrl: string | null = null;

  cargando = false;
  error = '';
  mensajeAlerta = '';
  tipoAlerta: 'success' | 'error' = 'success';
  mostrarModal = false;
  editando = false;
  accionConfirmacion: DeviceAction | null = null;
  dispositivoAEliminar: Dispositivo | null = null;
  nombreConfirmacionEliminacion = '';
  procesando = false;
  private alertaTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private deviceService: DeviceService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headerService.cambiarHeader(
      'Dispositivos y Hardware',
      'Mapeo de componentes físicos conectados al Arduino'
    );
    this.cargarDispositivos();
  }

  cargarDispositivos(silencioso = false): void {
    if (!silencioso) {
      this.cargando = true;
    }
    this.error = '';
    this.cdr.detectChanges(); // Fuerza a Angular a renderizar el esqueleto de inmediato

    this.deviceService.obtenerDispositivos().subscribe({
      next: (dispositivos) => {
        this.dispositivos = dispositivos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar dispositivos:', err);
        this.error = 'No se pudieron cargar los dispositivos. Verifica la conexión con la API.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalCrear(): void {
    this.editando = false;
    this.archivoSeleccionado = null;
    this.liberarPreviewImagen();
    this.dispositivoForm = this.nuevoDispositivo();
    this.mostrarModal = true;
  }

  editarDispositivo(dispositivo: Dispositivo): void {
    this.editando = true;
    this.archivoSeleccionado = null;
    this.liberarPreviewImagen();
    this.dispositivoForm = {
      ...dispositivo,
      activo: dispositivo.activo ?? true
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    if (this.procesando) return;

    this.mostrarModal = false;
    this.accionConfirmacion = null;
    this.nombreConfirmacionEliminacion = '';
    this.archivoSeleccionado = null;
    this.liberarPreviewImagen();
    this.dispositivoForm = this.nuevoDispositivo();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.liberarPreviewImagen();
    this.archivoSeleccionado = file;
    this.previewImagenUrl = URL.createObjectURL(file);
  }

  esDispositivoPrincipal(dispositivo: Dispositivo): boolean {
    return dispositivo.es_principal ?? dispositivo.id === 1;
  }

  guardarDispositivo(): void {
    const nombre = this.dispositivoForm.nombre?.trim();
    if (!nombre) {
      this.mostrarAlerta('El nombre del dispositivo es obligatorio.', 'error');
      return;
    }

    this.dispositivoForm.nombre = nombre;
    this.accionConfirmacion = this.editando ? 'edit' : 'create';
  }

  abrirConfirmacionEliminar(dispositivo: Dispositivo): void {
    this.dispositivoAEliminar = dispositivo;
    this.nombreConfirmacionEliminacion = '';
    this.accionConfirmacion = 'delete';
  }

  cerrarConfirmacion(): void {
    if (this.procesando) return;

    this.accionConfirmacion = null;
    this.dispositivoAEliminar = null;
    this.nombreConfirmacionEliminacion = '';
  }

  confirmarAccion(): void {
    if (this.procesando) return;

    switch (this.accionConfirmacion) {
      case 'create':
        this.crearDispositivo();
        break;
      case 'edit':
        this.actualizarDispositivo();
        break;
      case 'delete':
        this.eliminarDispositivo();
        break;
    }
  }

  get puedeConfirmarEliminacion(): boolean {
    const nombreEsperado = this.dispositivoAEliminar?.nombre.trim().toLocaleLowerCase();
    const nombreIngresado = this.nombreConfirmacionEliminacion.trim().toLocaleLowerCase();

    return !!nombreEsperado && nombreEsperado === nombreIngresado && !this.procesando;
  }

  mostrarAlerta(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;

    if (this.alertaTimer) clearTimeout(this.alertaTimer);
    this.alertaTimer = setTimeout(() => {
      this.mensajeAlerta = '';
    }, 3500);
  }

  private crearDispositivo(): void {
    this.procesando = true;
    delete this.dispositivoForm.imagen_url;

    this.deviceService.crearDispositivo(this.dispositivoForm).subscribe({
      next: (res) => {
        const dispositivoCreado = res.dispositivo || res;
        const dispositivoId = dispositivoCreado?.id;

        if (this.archivoSeleccionado && dispositivoId) {
          this.deviceService.subirImagenDispositivo(dispositivoId, this.archivoSeleccionado).subscribe({
            next: () => {
              this.finalizarProcesoExitoso('Dispositivo creado e imagen cargada correctamente.');
            },
            error: (errImg) => {
              console.error('Error al subir la imagen:', errImg);
              this.finalizarProcesoExitoso('Dispositivo creado, pero ocurrió un error al subir la imagen.');
            }
          });
        } else {
          this.finalizarProcesoExitoso('Dispositivo creado correctamente.');
        }
      },
      error: (err) => {
        console.error('Error al crear dispositivo:', err);
        this.procesando = false;
        this.mostrarAlerta('No se pudo crear el dispositivo. Verifica los datos.', 'error');
      }
    });
  }

  private actualizarDispositivo(): void {
    const id = this.dispositivoForm.id;
    if (id === undefined) {
      this.mostrarAlerta('No se puede actualizar el dispositivo porque no tiene identificador.', 'error');
      this.cerrarConfirmacion();
      return;
    }

    this.procesando = true;

    this.deviceService.actualizarDispositivo(id, this.dispositivoForm).subscribe({
      next: () => {
        if (this.archivoSeleccionado) {
          this.deviceService.subirImagenDispositivo(id, this.archivoSeleccionado).subscribe({
            next: () => {
              this.finalizarProcesoExitoso('Dispositivo actualizado correctamente.');
            },
            error: (errImg) => {
              console.error('Error al subir la imagen:', errImg);
              this.finalizarProcesoExitoso('Dispositivo actualizado, pero falló la subida de la imagen.');
            }
          });
        } else {
          this.finalizarProcesoExitoso('Dispositivo actualizado correctamente.');
        }
      },
      error: (err) => {
        console.error('Error al actualizar dispositivo:', err);
        this.procesando = false;
        this.mostrarAlerta('No se pudo actualizar el dispositivo. Inténtalo de nuevo.', 'error');
      }
    });
  }

  private finalizarProcesoExitoso(mensaje: string): void {
    this.procesando = false;
    this.cerrarModal();
    this.cargarDispositivos(true);
    this.mostrarAlerta(mensaje, 'success');
  }

  private eliminarDispositivo(): void {
    if (!this.puedeConfirmarEliminacion || this.dispositivoAEliminar?.id === undefined) return;

    this.procesando = true;
    this.deviceService.eliminarDispositivo(this.dispositivoAEliminar.id).subscribe({
      next: () => {
        this.procesando = false;
        this.cerrarConfirmacion();
        this.cargarDispositivos(true);
        this.mostrarAlerta('Dispositivo eliminado correctamente.', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar dispositivo:', err);
        this.procesando = false;
        this.mostrarAlerta('No se pudo eliminar el dispositivo. Inténtalo de nuevo.', 'error');
      }
    });
  }

  private nuevoDispositivo(): Partial<Dispositivo> {
    return {
      nombre: '',
      ubicacion: '',
      puerto_com: 'COM4',
      tipo: '',
      pin_conexion: '',
      descripcion_tecnica: '',
      imagen_url: '',
      activo: true
    };
  }

  private liberarPreviewImagen(): void {
    if (this.previewImagenUrl) {
      URL.revokeObjectURL(this.previewImagenUrl);
      this.previewImagenUrl = null;
    }
  }
}
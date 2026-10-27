import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConfiguracionUmbrales,
  PerfilActualizacionRequest,
  SesionUsuario
} from '../models/intrusion.model';
import { AppPreferencesService, AppTheme } from '../services/app-preferences.service';
import { HeaderService } from '../services/header.service';
import { IntrusionService } from '../services/intrusion.service';
import { FeedbackAlertComponent } from '../shared/feedback-alert/feedback-alert';
import { AuthService } from '../services/auth.service';
import { SkeletonComponent } from 'boneyard-js/angular';
import { SETTINGS_BONES } from './settings-bones';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, FeedbackAlertComponent, SkeletonComponent],
  templateUrl: './settings.html'
})
export class SettingsComponent implements OnInit {
  readonly bonesCarga = SETTINGS_BONES;
  seccionActiva: 'perfil' | 'apariencia' | 'sistema' = 'perfil';
  umbrales: ConfiguracionUmbrales = {
    margen_cambio: 40,
    tiempo_escalamiento_ms: 3000
  };
  intervaloActualizacion = 1;
  intervalosDisponibles = [1, 2, 5, 10];
  temaActual: AppTheme = 'light';
  usuarioActual: SesionUsuario | null = null;
  nombrePerfil = '';
  emailPerfil = '';
  passwordActual = '';
  passwordNueva = '';
  confirmarPasswordNueva = '';
  guardandoPerfil = false;
  notificacionesHabilitadas = false;
  permisoNotificaciones: NotificationPermission | 'unsupported' = 'unsupported';
  configuracionAplicada = false;
  cargandoUmbrales = true;
  guardandoUmbrales = false;
  guardandoPreferencias = false;
  mensajeExito = '';
  error = '';

  constructor(
    private intrusionService: IntrusionService,
    private preferences: AppPreferencesService,
    private authService: AuthService,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.headerService.cambiarHeader('Configuración del sistema', 'Administra tu cuenta y personaliza el comportamiento del sistema.');
    this.intervaloActualizacion = this.preferences.getRefreshIntervalSeconds();
    this.temaActual = this.preferences.getTheme();
    this.usuarioActual = this.authService.obtenerUsuarioActual();
    this.nombrePerfil = this.usuarioActual?.nombre ?? '';
    this.emailPerfil = this.usuarioActual?.email ?? '';
    this.notificacionesHabilitadas = this.preferences.notificationsEnabled();
    this.permisoNotificaciones = this.preferences.notificationPermission();
    this.cargarUmbrales();
  }

  seleccionarSeccion(seccion: SettingsComponent['seccionActiva']): void {
    this.seccionActiva = seccion;
  }

  guardarPerfil(): void {
    if (this.guardandoPerfil) return;
    if (this.passwordNueva && this.passwordNueva !== this.confirmarPasswordNueva) {
      this.error = 'La nueva contraseña y su confirmación no coinciden.';
      return;
    }

    const datos: PerfilActualizacionRequest = {
      nombre: this.nombrePerfil.trim(),
      email: this.emailPerfil.trim(),
      current_password: this.passwordActual
    };
    if (this.passwordNueva) datos.new_password = this.passwordNueva;

    this.guardandoPerfil = true;
    this.error = '';
    this.mensajeExito = '';
    this.authService.actualizarMiPerfil(datos).subscribe({
      next: respuesta => {
        this.usuarioActual = respuesta.usuario;
        this.nombrePerfil = respuesta.usuario.nombre;
        this.emailPerfil = respuesta.usuario.email;
        this.passwordActual = '';
        this.passwordNueva = '';
        this.confirmarPasswordNueva = '';
        this.mensajeExito = respuesta.mensaje;
        this.guardandoPerfil = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('No se pudo actualizar el perfil:', error);
        this.error = error.status === 401
          ? 'Tu sesión expiró o no tiene un token actualizado. Cierra sesión e inicia nuevamente.'
          : error.error?.error || 'No se pudo actualizar el perfil.';
        this.guardandoPerfil = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarUmbrales(): void {
    this.cargandoUmbrales = true;
    this.error = '';
    this.intrusionService.obtenerConfiguracionUmbrales().subscribe({
      next: configuracion => {
        this.umbrales = {
          margen_cambio: configuracion.margen_cambio,
          tiempo_escalamiento_ms: configuracion.tiempo_escalamiento_ms
        };
        this.configuracionAplicada = configuracion.aplicada;
        this.cargandoUmbrales = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('No se pudo cargar la configuración del perímetro:', error);
        this.error = error.error?.error || 'No se pudo cargar la configuración desde la API.';
        this.cargandoUmbrales = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarUmbrales(): void {
    if (!this.esConfiguracionValida()) {
      this.error = 'Revisa los valores permitidos antes de guardar.';
      return;
    }

    this.guardandoUmbrales = true;
    this.error = '';
    this.mensajeExito = '';
    this.intrusionService.actualizarConfiguracionUmbrales(this.umbrales).subscribe({
      next: respuesta => {
        this.umbrales = {
          margen_cambio: respuesta.margen_cambio,
          tiempo_escalamiento_ms: respuesta.tiempo_escalamiento_ms
        };
        this.configuracionAplicada = respuesta.aplicada;
        this.mensajeExito = respuesta.aplicada
          ? 'Los umbrales se guardaron y aplicaron en el Arduino.'
          : 'Los umbrales se guardaron. Se aplicarán al conectar el Arduino.';
        this.guardandoUmbrales = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('No se pudieron guardar los umbrales:', error);
        this.error = error.error?.error || 'No se pudieron guardar los umbrales.';
        this.guardandoUmbrales = false;
        this.cdr.detectChanges();
      }
    });
  }

  async cambiarNotificaciones(habilitadas: boolean): Promise<void> {
    this.error = '';
    this.mensajeExito = '';

    if (!habilitadas) {
      try {
        this.preferences.setNotificationsEnabled(false);
        this.notificacionesHabilitadas = false;
        this.mensajeExito = 'Los avisos críticos del navegador están desactivados.';
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'No se pudo guardar la preferencia.';
      }
      return;
    }

    this.guardandoPreferencias = true;
    try {
      this.permisoNotificaciones = await this.preferences.requestNotificationPermission();
      if (this.permisoNotificaciones !== 'granted') {
        this.notificacionesHabilitadas = false;
        this.preferences.setNotificationsEnabled(false);
        this.error = this.permisoNotificaciones === 'denied'
          ? 'El navegador bloqueó los avisos. Habilítalos en la configuración del sitio.'
          : 'No se concedió permiso para mostrar avisos.';
        return;
      }

      this.preferences.setNotificationsEnabled(true);
      this.notificacionesHabilitadas = true;
      this.mensajeExito = 'Recibirás avisos del navegador para nuevas alertas críticas.';
    } catch (error) {
      console.error('No se pudieron activar los avisos críticos:', error);
      this.notificacionesHabilitadas = false;
      this.error = error instanceof Error ? error.message : 'No se pudieron activar los avisos.';
    } finally {
      this.guardandoPreferencias = false;
      this.cdr.detectChanges();
    }
  }

  guardarIntervaloActualizacion(): void {
    try {
      this.preferences.setRefreshIntervalSeconds(this.intervaloActualizacion);
      this.mensajeExito = `El panel consultará la API cada ${this.intervaloActualizacion} s.`;
      this.error = '';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo guardar la preferencia.';
      this.intervaloActualizacion = this.preferences.getRefreshIntervalSeconds();
    }
  }

  guardarTema(): void {
    try {
      this.preferences.setTheme(this.temaActual);
      this.mensajeExito = `Tema ${this.temaActual === 'dark' ? 'oscuro' : 'claro'} aplicado.`;
      this.error = '';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo guardar el tema.';
      this.temaActual = this.preferences.getTheme();
    }
  }

  private esConfiguracionValida(): boolean {
    return Number.isInteger(this.umbrales.margen_cambio) &&
      this.umbrales.margen_cambio >= 1 &&
      this.umbrales.margen_cambio <= 500 &&
      Number.isInteger(this.umbrales.tiempo_escalamiento_ms) &&
      this.umbrales.tiempo_escalamiento_ms >= 500 &&
      this.umbrales.tiempo_escalamiento_ms <= 60000;
  }
}

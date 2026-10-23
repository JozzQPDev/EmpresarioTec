import { Component, ElementRef, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderService } from '../services/header.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { SesionUsuario } from '../models/intrusion.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  tituloPagina: string = 'Panel de Control';
  subtituloPagina: string = 'Perímetro de Seguridad';
  usuarioActual: SesionUsuario | null = null;
  menuUsuarioAbierto = false;

  private timerId: any;
  private sub?: Subscription;

  constructor(
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();

    this.timerId = setInterval(() => {
      this.currentTime = new Date();
      this.cdr.detectChanges();
    }, 1000);

    this.sub = this.headerService.header$.subscribe(data => {
      this.tituloPagina = data.titulo;
      this.subtituloPagina = data.subtitulo;
      this.cdr.detectChanges();
    });
  }

  get inicialesUsuario(): string {
    const nombre = this.usuarioActual?.nombre?.trim();
    if (!nombre) return this.usuarioActual?.email?.charAt(0).toUpperCase() ?? 'U';

    return nombre
      .split(/\s+/)
      .slice(0, 2)
      .map(parte => parte.charAt(0).toUpperCase())
      .join('');
  }

  alternarMenuUsuario(): void {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  cerrarMenuUsuario(): void {
    this.menuUsuarioAbierto = false;
  }

  @HostListener('document:click', ['$event'])
  cerrarMenuAlHacerClickFuera(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.cerrarMenuUsuario();
    }
  }

  @HostListener('document:keydown.escape')
  cerrarMenuConEscape(): void {
    this.cerrarMenuUsuario();
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.sub?.unsubscribe();
  }

  cerrarSesion(): void {
    this.cerrarMenuUsuario();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderService } from '../services/header.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

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

  private timerId: any;
  private sub?: Subscription;

  constructor(
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    this.sub = this.headerService.header$.subscribe(data => {
      this.tituloPagina = data.titulo;
      this.subtituloPagina = data.subtitulo;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.sub?.unsubscribe();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private headerState = new BehaviorSubject<{ titulo: string; subtitulo: string }>({
    titulo: 'Panel De Control',
    subtitulo: 'Perímetro de Seguridad'
  });

  header$ = this.headerState.asObservable();

  cambiarHeader(titulo: string, subtitulo: string): void {
    this.headerState.next({ titulo, subtitulo });
  }
}

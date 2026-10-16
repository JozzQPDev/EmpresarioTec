import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar'; // Ajusta la ruta a tu sidebar
import { HeaderComponent } from '../../header/header';     // Ajusta la ruta a tu header

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.html'
})
export class MainLayoutComponent {}

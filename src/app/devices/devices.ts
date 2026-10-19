import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-devices',
  styleUrl: './devices.css',
  templateUrl: './devices.html',
})
export class Devices {
  // Aquí puedes agregar lógica si la necesitas en el futuro,
  // como obtener los estados reales de los pines desde tu API de Flask.
}

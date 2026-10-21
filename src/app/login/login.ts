import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // Ajusta los puntos según la ubicación de tu carpeta services
import { LoginResponse } from '../models/intrusion.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMensaje: string = '';
  cargando: boolean = false;
  passwordVisible: boolean = false; // Variable para alternar el estado de la contraseña

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inyección para forzar la actualización inmediata de la vista
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  // Función que se ejecuta al hacer clic en el icono del ojo
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';
    this.cdr.detectChanges(); // Forzar estado de carga inicial en la vista

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: LoginResponse) => {
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        
        // Tipado seguro para capturar el error del backend Flask
        const errorData = err.error as { error?: string };
        this.errorMensaje = errorData?.error || 'Ocurrió un error al iniciar sesión.';
        
        // 👈 FUNDAMENTAL: Fuerza a Angular a pintar el mensaje de error de inmediato en pantalla
        this.cdr.detectChanges();
      }
    });
  }
}
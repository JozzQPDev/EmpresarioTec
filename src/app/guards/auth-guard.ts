import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario está autenticado, permite el paso
  if (authService.estaAutenticado()) {
    return true;
  }

  // Si no está autenticado, lo patea al login
  router.navigate(['/login']);
  return false;
};

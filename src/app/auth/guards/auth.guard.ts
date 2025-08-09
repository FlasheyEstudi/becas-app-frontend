import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() >= exp; // Comparar con la fecha actual
    } catch (e) {
      console.error('Error decodificando token:', e);
      return true; // Si falla, considerarlo expirado
    }
  }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    console.log('Token en guard:', token);

    if (token && !this.isTokenExpired(token)) {
      return true;
    } else {
      console.log('Token inválido o expirado, redirigiendo a /login');
      localStorage.removeItem('token'); // Eliminar token inválido
      this.router.navigate(['/login']);
      return false;
    }
  }
}
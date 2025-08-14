// Guardia de autenticación para proteger rutas
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  // Método para decodificar el token JWT
  private decodeToken(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Método para verificar si el usuario está autenticado
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    const decoded = this.decodeToken(token);
    if (!decoded) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
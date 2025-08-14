// Guardia de roles para proteger rutas
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  // Método para verificar si el usuario tiene permisos para acceder a la ruta
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const tokenRole = localStorage.getItem('role');
    if (!tokenRole || !expectedRoles.includes(tokenRole)) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
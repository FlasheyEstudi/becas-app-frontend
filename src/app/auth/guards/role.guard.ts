import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = localStorage.getItem('role')?.toLowerCase();
    const allowedRoles = (route.data['roles'] as string[]).map(r => r.toLowerCase());

    if (role && allowedRoles.includes(role)) return true;

    // Redirigir según si hay token
    if (localStorage.getItem('token')) this.router.navigate(['/dashboard']);
    else this.router.navigate(['/login']);
    return false;
  }
}

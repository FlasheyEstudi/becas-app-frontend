// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Interfaz para respuesta de login
interface LoginResponse {
  access_token: string;
  role: string;
}

// Interfaz para respuesta de cambio de contraseña
interface ChangePasswordResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base para la API
  private apiUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión
  login(credentials: { identifier: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('role', response.role);
      })
    );
  }

  // Método para registrar un nuevo usuario
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  // Método para verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  // Método para obtener el rol del usuario
  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // Método para cambiar contraseña
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`${this.apiUrl}/auth/change-password`, data);
  }
}
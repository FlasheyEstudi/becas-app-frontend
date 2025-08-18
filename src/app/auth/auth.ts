import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  access_token: string;
  role: string;
}

interface ChangePasswordResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient) {}

  login(credentials: { identifier: string; password: string }): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('Enviando login con:', credentials);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      tap(res => {
        console.log('Login exitoso:', res);
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('role', res.role.toLowerCase());
      })
    );
  }

  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/register`, userData, { headers }).pipe(
      tap(res => console.log('Usuario registrado:', res))
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    console.log('Sesión cerrada');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<ChangePasswordResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ChangePasswordResponse>(`${this.apiUrl}/auth/change-password`, data, { headers });
  }
}

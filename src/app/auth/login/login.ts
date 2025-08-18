import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  correo: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  isAdmin: boolean = false;
  showPassword: boolean = false;

  private authUrl = 'http://localhost:3000/api-beca/auth';

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  setRole(role: 'estudiante' | 'admin'): void {
    this.isAdmin = role === 'admin';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(form: NgForm): void {
    if (form.invalid) {
      this.error = 'Por favor, completa todos los campos';
      return;
    }

    this.error = '';
    this.loading = true;

    const roleToSend = this.isAdmin ? 'admin' : 'estudiante';

    this.http
      .post<{ access_token: string; role: string; username?: string }>(
        `${this.authUrl}/login`,
        { identifier: this.correo, password: this.password, role: roleToSend },
        { headers: this.getHeaders() }
      )
      .subscribe({
        next: (res) => {
          const role = res.role?.toLowerCase() || 'estudiante';
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('role', role);
          if (res.username) localStorage.setItem('username', res.username);

          console.log('Usuario logueado:', res);

          // Redirigir al dashboard general (RoleGuard manejará contenido)
          this.router.navigate(['/dashboard']).then((success) => {
            if (!success) {
              console.error('No se pudo redirigir al dashboard');
              this.error = 'Error al redirigir. Intenta de nuevo.';
            }
            this.loading = false;
          });
        },
        error: (err) => {
          console.error('Error login:', err);
          this.error = err.error?.message || 'Correo, contraseña o rol incorrectos';
          this.loading = false;
        }
      });
  }
}

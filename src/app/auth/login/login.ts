import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  role: 'student' | 'admin' = 'student';
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  changeRole(newRole: 'student' | 'admin') {
    this.role = newRole;
    this.error = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.username.trim()) {
      this.error = 'El usuario es requerido';
      return;
    }
    if (!this.password.trim()) {
      this.error = 'La contraseña es requerida';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.access_token) localStorage.setItem('token', res.access_token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Credenciales incorrectas';
      }
    });
  }
}
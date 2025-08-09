import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  username = '';
  firstName = '';
  lastName = '';
  email = '';
  role = 'estudiante';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';

  roles = [
    { value: 'rector', label: 'Rector' },
    { value: 'secretario', label: 'Secretario' },
    { value: 'profesor', label: 'Profesor' },
    { value: 'estudiante', label: 'Estudiante' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    if (!this.username.trim()) {
      this.error = 'El nombre de usuario es requerido';
      return;
    }
    if (!this.firstName.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    if (!this.lastName.trim()) {
      this.error = 'El apellido es requerido';
      return;
    }
    if (!this.email.trim()) {
      this.error = 'El email es requerido';
      return;
    }
    if (!this.password.trim()) {
      this.error = 'La contraseña es requerida';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';

    const userData = {
      username: this.username,
      password: this.password,
      nombre: `${this.firstName} ${this.lastName}`,
      email: this.email,
      role: this.role
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        alert('Usuario registrado exitosamente');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al registrar usuario';
      }
    });
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  identifier = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.identifier.trim()) {
      this.error = 'El usuario o correo es requerido';
      return;
    }
    if (!this.password.trim()) {
      this.error = 'La contraseña es requerida';
      return;
    }
    const credentials = {
      identifier: this.identifier,
      password: this.password
    };
    
    // Asegúrate de que el servicio de autenticación esté correctamente implementado
    this.authService.login(credentials).subscribe({
      next: (response) => {
        // Asegúrate de que el token se guarda correctamente
        console.log('Respuesta del login:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.error = 'Credenciales inválidas';
      }
    });
  }
}
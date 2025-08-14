// src/app/perfil/perfil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {
  estudiante: any = null;
  loading = false;
  error = '';
  // Campos para cambiar contraseña
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordChangeMessage = '';
  passwordChangeError = '';
  changingPassword = false;
  
  // URL base para la API
  private apiUrl = 'http://localhost:3000/api-beca/estudiante';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarPerfil();
  }

  // Método para cargar el perfil del estudiante desde el backend
  cargarPerfil(): void {
    this.loading = true;
    this.error = '';
    
    // Obtener el ID del estudiante desde el token
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'No se ha iniciado sesión';
      this.loading = false;
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const estudianteId = payload.sub || payload.id;
      
      this.http.get(`${this.apiUrl}/${estudianteId}`).subscribe({
        next: (data) => {
          this.estudiante = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al cargar el perfil';
          this.loading = false;
        }
      });
    } catch (err) {
      this.error = 'Error al decodificar token';
      this.loading = false;
    }
  }

  // Método para cambiar la contraseña del usuario
  cambiarContrasena(): void {
    this.passwordChangeMessage = '';
    this.passwordChangeError = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordChangeError = 'Por favor completa todos los campos';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordChangeError = 'La nueva contraseña y la confirmación no coinciden';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordChangeError = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }
    this.changingPassword = true;
    
    // Obtener el ID del estudiante desde el token
    const token = localStorage.getItem('token');
    if (!token) {
      this.passwordChangeError = 'No se ha iniciado sesión';
      this.changingPassword = false;
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const estudianteId = payload.sub || payload.id;
      
      this.authService.changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      }).subscribe({
        next: () => {
          this.passwordChangeMessage = 'Contraseña cambiada exitosamente';
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.changingPassword = false;
        },
        error: (err) => {
          this.passwordChangeError = err.error?.message || 'Error al cambiar la contraseña';
          this.changingPassword = false;
        }
      });
    } catch (err) {
      this.passwordChangeError = 'Error al procesar la solicitud';
      this.changingPassword = false;
    }
  }
}
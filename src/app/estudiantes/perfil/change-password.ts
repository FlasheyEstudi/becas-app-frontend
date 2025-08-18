import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.scss'],
})
export class ChangePasswordComponent {
  // Formulario reactivo para cambio de contraseña
  form: FormGroup;
  // Indicador de carga
  loading = false;
  // Mensaje de error
  error = '';
  // Mensaje de éxito
  success = '';
  
  // URL base para la API - Corregida para usar auth
  private apiUrl = 'http://localhost:3000/api-beca/auth';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Inicializar formulario con validaciones
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]],
    }, { validator: this.passwordsMatch });
  }

  // Validador personalizado para comparar nuevas contraseñas
  passwordsMatch(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { notMatching: true };
  }

  // Método para manejar el envío del formulario de cambio de contraseña
  submit() {
    this.error = '';
    this.success = '';
    if (this.form.invalid) {
      this.error = 'Por favor, corrige los errores del formulario.';
      return;
    }
    
    const { currentPassword, newPassword } = this.form.value;
    this.loading = true;
    
    // Obtener el token y construir headers
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    this.http.post(`${this.apiUrl}/change-password`, { 
      currentPassword, 
      newPassword 
    }, { headers }).subscribe({
      next: () => {
        this.success = 'Contraseña cambiada exitosamente.';
        this.form.reset();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cambiar la contraseña.';
        this.loading = false;
      }
    });
  }
}
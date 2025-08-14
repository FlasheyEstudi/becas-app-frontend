// Componente para registro de usuarios
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  // Formulario reactivo para registro
  registerForm: FormGroup;
  // Opciones de roles
  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'estudiante', label: 'Estudiante' },
    { value: 'profesor', label: 'Profesor' },
    { value: 'secretario', label: 'Secretario' },
    { value: 'rector', label: 'Rector' }
  ];
  // Indicador de carga
  loading = false;
  // Mensaje de error
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Inicializar formulario con validaciones
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['estudiante', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  // Método para manejar el envío del formulario de registro
  onSubmit() {
    if (this.registerForm.invalid) {
      this.error = 'Por favor complete todos los campos correctamente';
      return;
    }
    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    this.loading = true;
    this.error = '';
    const userData = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      nombre: `${this.registerForm.value.firstName} ${this.registerForm.value.lastName}`,
      email: this.registerForm.value.email,
      role: this.registerForm.value.role
    };
    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        alert('Usuario registrado exitosamente');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al registrar usuario';
      }
    });
  }
}
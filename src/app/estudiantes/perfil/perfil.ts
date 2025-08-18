// src/app/estudiantes/perfil/perfil.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Estudiante {
  id: number;
  nombre: string;
  apellidos: string;
  carnet?: string;
  carreraId?: number;
  anioAcademico?: string;
  correo: string;
  telefono?: string;
  role?: string;
  estadoId?: number;
  username?: string;
  becas?: { tipo: string; anio: string; estado: string }[];
}

interface InfoItem {
  icon: string;
  label: string;
  value: string;
}

interface Estado {
  id: number;
  nombre: string;
}

interface Carrera {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilComponent implements OnInit {
  estudiante: Estudiante | null = null;
  loading = false;
  error = '';

  estadosDisponibles: Estado[] = [];
  carrerasDisponibles: Carrera[] = [];

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordChangeMessage = '';
  passwordChangeError = '';
  changingPassword = false;

  estudianteId: number | null = null;

  private baseUrl = 'http://localhost:3000/api-beca/estudiantes';
  private authUrl = 'http://localhost:3000/api-beca/auth';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerEstudianteId();
    this.cargarEstadosYCarreras();
    if (this.estudianteId) {
      this.cargarPerfil();
    } else {
      this.error = 'No se pudo obtener el ID del estudiante desde el token.';
    }
  }

  private obtenerEstudianteId(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'No hay token de sesión. Inicia sesión nuevamente.';
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.estudianteId = payload.sub || payload.id || payload.userId || null;

      if (!this.estudianteId) {
        this.error = 'Token inválido: no se pudo obtener ID del estudiante.';
      }
    } catch (err) {
      this.error = 'Error decodificando token JWT.';
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  cargarPerfil(): void {
    if (!this.estudianteId) return;

    this.loading = true;
    this.http.get<Estudiante>(`${this.baseUrl}/${this.estudianteId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.estudiante = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar perfil:', err);
          this.error = err.status === 403 ? 
            'Acceso denegado. Tu sesión puede haber expirado.' : 
            'Error al cargar el perfil.';
          this.loading = false;
        }
      });
  }

  // Carga estados y carreras, si falla usa valores por defecto
  cargarEstadosYCarreras(): void {
    this.http.get<Estado[]>(`${this.baseUrl}/estados`, { headers: this.getHeaders() })
      .subscribe({
        next: data => this.estadosDisponibles = data,
        error: err => {
          console.error('Error al cargar estados', err);
          // Valores por defecto
          this.estadosDisponibles = [
            { id: 1, nombre: 'Activo' },
            { id: 2, nombre: 'Inactivo' }
          ];
        }
      });

    this.http.get<Carrera[]>(`${this.baseUrl}/carreras`, { headers: this.getHeaders() })
      .subscribe({
        next: data => this.carrerasDisponibles = data,
        error: err => {
          console.error('Error al cargar carreras', err);
          // Valores por defecto
          this.carrerasDisponibles = [
            { id: 1, nombre: 'Ingeniería' },
            { id: 2, nombre: 'Administración' }
          ];
        }
      });
  }

  getEstadoNombre(estadoId?: number): string {
    return this.estadosDisponibles.find(e => e.id === estadoId)?.nombre || '-';
  }

  getCarreraNombre(carreraId?: number): string {
    return this.carrerasDisponibles.find(c => c.id === carreraId)?.nombre || '-';
  }

  get personalInfo(): InfoItem[] {
    return this.estudiante ? [
      { icon: '👤', label: 'Nombre', value: `${this.estudiante.nombre} ${this.estudiante.apellidos}` },
      { icon: '📝', label: 'Número de Carnet', value: this.estudiante.carnet || 'No disponible' },
      { icon: '🎓', label: 'Carrera', value: this.getCarreraNombre(this.estudiante.carreraId) },
      { icon: '📅', label: 'Año Académico', value: this.estudiante.anioAcademico || 'No disponible' },
      { icon: '📧', label: 'Correo Electrónico', value: this.estudiante.correo }
    ] : [];
  }

  get contactInfo(): InfoItem[] {
    return this.estudiante ? [
      { icon: '📧', label: 'Email', value: this.estudiante.correo },
      { icon: '📞', label: 'Teléfono', value: this.estudiante.telefono || 'No disponible' }
    ] : [];
  }

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

    this.http.post(`${this.authUrl}/change-password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          this.passwordChangeMessage = res?.message || 'Contraseña cambiada exitosamente';
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.changingPassword = false;
        },
        error: (err: any) => {
          this.passwordChangeError = err.error?.message || 'Error al cambiar la contraseña';
          this.changingPassword = false;
        }
      });
  }
}

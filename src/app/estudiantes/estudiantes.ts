// src/app/estudiantes/estudiantes.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces necesarias
interface Estudiante {
  id: number;
  nombre: string;
  apellidos: string | null;
  email: string;
  username: string;
  password: string;
  role: string;
  estadoId?: number | null;
  carreraId?: number | null;
}

interface Carrera {
  id: number;
  nombre: string;
}

interface Estado {
  id: number;
  nombre: string;
}

interface CreateEstudianteDto {
  nombre: string;
  apellidos: string | null;
  email: string;
  role?: string;
  estadoId?: number | null;
  carreraId?: number | null;
}

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estudiantes.html',
  styleUrls: ['./estudiantes.scss']
})
export class EstudiantesComponent implements OnInit {
  estudiantes: Estudiante[] = [];
  filteredEstudiantes: Estudiante[] = [];
  error: string = '';
  loading: boolean = false;

  totalEstudiantes: number = 0;
  estudiantesActivos: number = 0;
  administradores: number = 0;
  edadPromedio: number = 0;

  newStudent: CreateEstudianteDto = {
    nombre: '',
    apellidos: '',
    email: '',
    role: 'estudiante',
    estadoId: null,
    carreraId: null
  };

  searchTerm: string = '';
  filtroEstado: string = '';
  filtroCarrera: string = '';
  filtroRol: string = '';

  carrerasDisponibles: Carrera[] = [];
  estadosDisponibles: Estado[] = [];

  showSuccessMessage: boolean = false;
  credencialesEstudiante: { username: string, email: string, password: string } = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        this.router.navigate(['/dashboard']);
        return;
      }
    } catch {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    this.loading = true;
    Promise.all([
      this.cargarEstados(),
      this.cargarCarreras(),
      this.cargarEstudiantes()
    ]).finally(() => this.loading = false);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  cargarEstados() {
    return new Promise<void>((resolve) => {
      this.http.get<Estado[]>('http://localhost:3000/api-beca/estado', {
        headers: this.getHeaders()
      }).subscribe({
        next: (data) => this.estadosDisponibles = data,
        error: (err) => console.error('Error cargando estados:', err),
        complete: () => resolve()
      });
    });
  }

  cargarCarreras() {
    return new Promise<void>((resolve) => {
      this.http.get<Carrera[]>('http://localhost:3000/api-beca/carrera', {
        headers: this.getHeaders()
      }).subscribe({
        next: (data) => this.carrerasDisponibles = data,
        error: (err) => console.error('Error cargando carreras:', err),
        complete: () => resolve()
      });
    });
  }

  cargarEstudiantes() {
    return new Promise<void>((resolve) => {
      this.http.get<Estudiante[]>('http://localhost:3000/api-beca/users', {
        headers: this.getHeaders()
      }).subscribe({
        next: (data) => {
          this.estudiantes = data;
          this.filteredEstudiantes = [...data];
          this.calcularKPIs();
        },
        error: (err) => this.error = 'Error cargando estudiantes: ' + err.message,
        complete: () => resolve()
      });
    });
  }

  calcularKPIs() {
    this.totalEstudiantes = this.estudiantes.length;
    this.estudiantesActivos = this.estudiantes.filter(e => e.estadoId === 1).length;
    this.administradores = this.estudiantes.filter(e => e.role === 'admin').length;
    this.edadPromedio = 0; // Ajusta según tus datos
  }

  private validarEstudiante(): boolean {
    if (!this.newStudent.nombre?.trim()) {
      this.error = 'Nombre es requerido';
      return false;
    }
    if (!this.newStudent.apellidos?.trim()) {
      this.error = 'Apellidos son requeridos';
      return false;
    }
    if (!this.newStudent.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.error = 'Correo inválido';
      return false;
    }
    return true;
  }

  private generarUsername(): string {
    const baseUsername = this.newStudent.nombre.toLowerCase().replace(/\s+/g, '') +
                        (this.newStudent.apellidos || '').toLowerCase().replace(/\s+/g, '');
    return baseUsername + Math.floor(Math.random() * 1000);
  }

  private generarPasswordAleatoria(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  onSubmitNewStudent() {
    this.error = '';
    this.showSuccessMessage = false;

    if (!this.validarEstudiante()) return;

    this.loading = true;
    console.log('Enviando datos al servidor:', this.newStudent);

    // Generar username y password automáticamente
    const generatedUsername = this.generarUsername();
    const generatedPassword = this.generarPasswordAleatoria();

    // Agregar username y password al objeto enviado
    const studentData = {
      ...this.newStudent,
      username: generatedUsername,
      password: generatedPassword
    };

    this.http.post<Estudiante>('http://localhost:3000/api-beca/users', studentData, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        // Usar las credenciales generadas
        this.credencialesEstudiante = {
          username: generatedUsername,
          email: this.newStudent.email,
          password: generatedPassword
        };
        console.log('Credenciales guardadas:', this.credencialesEstudiante);
        
        this.showSuccessMessage = true;
        
        this.resetFormulario();
        this.cargarEstudiantes();
      },
      error: (err) => {
        console.error('Error en la solicitud:', err);
        this.error = 'Error creando estudiante: ' + (err.error?.message || err.message);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        console.log('Solicitud completada');
      }
    });
  }

  filtrarEstudiantes() {
    let filtered = [...this.estudiantes];
    const term = this.searchTerm.toLowerCase();

    if (term) {
      filtered = filtered.filter(e =>
        e.nombre.toLowerCase().includes(term) ||
        (e.apellidos?.toLowerCase() ?? '').includes(term) || // Manejo de null/undefined
        e.email.toLowerCase().includes(term)
      );
    }

    if (this.filtroEstado) {
      filtered = filtered.filter(e => e.estadoId?.toString() === this.filtroEstado);
    }

    if (this.filtroCarrera) {
      filtered = filtered.filter(e => e.carreraId?.toString() === this.filtroCarrera);
    }

    if (this.filtroRol) {
      filtered = filtered.filter(e => e.role === this.filtroRol);
    }

    this.filteredEstudiantes = filtered;
  }

  deleteEstudiante(id: number) {
    if (!confirm('¿Eliminar este estudiante?')) return;

    this.loading = true;

    this.http.delete(`http://localhost:3000/api-becausers/${id}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => this.cargarEstudiantes(),
      error: (err) => this.error = 'Error eliminando estudiante: ' + err.message,
      complete: () => this.loading = false
    });
  }

  resetFormulario() {
    this.newStudent = {
      nombre: '',
      apellidos: '',
      email: '',
      role: 'estudiante',
      estadoId: null,
      carreraId: null
    };
    this.error = '';
  }

  getEstadoNombre(id?: number | null): string {
    if (!id) return '-';
    const estado = this.estadosDisponibles.find(e => e.id === id);
    return estado ? estado.nombre : '-';
  }

  getCarreraNombre(id?: number | null): string {
    if (!id) return '-';
    const carrera = this.carrerasDisponibles.find(c => c.id === id);
    return carrera ? carrera.nombre : '-';
  }
}
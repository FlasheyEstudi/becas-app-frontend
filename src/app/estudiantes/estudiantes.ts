import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

interface Estudiante {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  username?: string;
  role?: string;
  estadoId?: number;
  carreraId?: number;
  estadoNombre?: string;
  carreraNombre?: string;
}

interface Carrera {
  id: number;
  nombre: string;
}

interface Estado {
  id: number;
  nombre: string;
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
  
  // Nuevo: Modal de registro
  showModal: boolean = false;
  
  newStudent = {
    nombre: '',
    apellidos: '',
    correo: '',
    estadoId: undefined as number | undefined,
    carreraId: undefined as number | undefined,
    role: 'estudiante'
  };

  searchTerm: string = '';
  filtroEstado: string = '';
  filtroCarrera: string = '';
  filtroRol: string = '';
  carrerasDisponibles: Carrera[] = [];
  estadosDisponibles: Estado[] = [];
  showSuccessMessage: boolean = false;
  credencialesEstudiante = {
    username: '',
    correo: '',
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.verifyAdminRole();
    this.cargarDatosIniciales();
  }

  private verifyAdminRole() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        this.router.navigate(['/dashboard']);
      }
    } catch {
      this.router.navigate(['/login']);
    }
  }

  private cargarDatosIniciales() {
    this.loading = true;
    forkJoin({
      estados: this.http.get<Estado[]>('http://localhost:3000/api-beca/estado', { headers: this.getHeaders() }),
      carreras: this.http.get<Carrera[]>('http://localhost:3000/api-beca/carrera', { headers: this.getHeaders() }),
      estudiantes: this.http.get<any[]>('http://localhost:3000/api-beca/estudiantes', { headers: this.getHeaders() })
    }).subscribe({
      next: ({ estados, carreras, estudiantes }) => {
        this.estadosDisponibles = estados || [];
        this.carrerasDisponibles = carreras || [];
        this.estudiantes = this.mapEstudiantes(estudiantes);
        this.filteredEstudiantes = [...this.estudiantes];
        this.calcularKPIs();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error cargando datos iniciales: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  private mapEstudiantes(data: any[]): Estudiante[] {
    return data.map(item => ({
      id: item.id,
      nombre: item.nombre,
      apellidos: item.apellidos,
      correo: item.correo,
      username: item.user?.username || '-', // Corregido: usar item.user.username
      role: item.user?.role || 'estudiante',
      estadoId: item.estadoId,
      carreraId: item.carreraId,
      estadoNombre: this.getEstadoNombre(item.estadoId),
      carreraNombre: this.getCarreraNombre(item.carreraId)
    }));
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  getEstadoNombre(id?: number): string {
    if (id == null) return 'No asignado';
    const estado = this.estadosDisponibles.find(e => e.id === id);
    return estado ? estado.nombre : 'No encontrado';
  }

  getCarreraNombre(id?: number): string {
    if (id == null) return 'No asignada';
    const carrera = this.carrerasDisponibles.find(c => c.id === id);
    return carrera ? carrera.nombre : 'No encontrada';
  }

  calcularKPIs() {
    this.totalEstudiantes = this.estudiantes.length;
    this.estudiantesActivos = this.estudiantes.filter(e => e.estadoId === 1).length;
    this.administradores = this.estudiantes.filter(e => e.role === 'admin').length;
  }

  private validarEstudiante(): boolean {
    this.error = '';
    if (!this.newStudent.nombre?.trim()) {
      this.error = 'Nombre es requerido';
      return false;
    }
    if (!this.newStudent.apellidos?.trim()) {
      this.error = 'Apellidos son requeridos';
      return false;
    }
    if (!this.newStudent.correo?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.error = 'Correo electrónico inválido';
      return false;
    }
    return true;
  }

  // Abrir modal de registro
  abrirModalRegistro() {
    this.showModal = true;
    this.error = '';
  }

  // Cerrar modal de registro
  cerrarModalRegistro() {
    this.showModal = false;
    this.resetFormulario();
  }

  // Corregido: Ruta correcta sin "/completo"
  onSubmitNewStudent() {
    if (!this.validarEstudiante()) return;
    this.loading = true;
    this.showSuccessMessage = false;
    
    // Corregido: Usar ruta correcta sin "/completo"
    this.http.post<any>('http://localhost:3000/api-beca/estudiantes', this.newStudent, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.credencialesEstudiante = {
          username: response.credenciales.username,
          correo: response.credenciales.correo, // Corregido: usar correo en lugar de email
          password: response.credenciales.password
        };
        this.showSuccessMessage = true;
        this.resetFormulario();
        this.cargarDatosIniciales();
        this.cerrarModalRegistro(); // Cerrar modal después de crear
      },
      error: (err) => {
        this.error = 'Error al crear estudiante: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  filtrarEstudiantes() {
    let filtered = [...this.estudiantes];
    const term = this.searchTerm.toLowerCase();
    if (term) {
      filtered = filtered.filter(e =>
        e.nombre.toLowerCase().includes(term) ||
        e.apellidos.toLowerCase().includes(term) ||
        e.correo.toLowerCase().includes(term)
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
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;
    this.loading = true;
    this.http.delete(`http://localhost:3000/api-beca/estudiantes/${id}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => this.cargarDatosIniciales(),
      error: (err) => {
        this.error = 'Error eliminando estudiante: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  resetFormulario() {
    this.newStudent = {
      nombre: '',
      apellidos: '',
      correo: '',
      estadoId: undefined,
      carreraId: undefined,
      role: 'estudiante'
    };
    this.error = '';
  }
}
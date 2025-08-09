import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definición de la interfaz Estudiante
interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  correo: string;
  estadoId?: number;
  carreraId?: number;
  estadoNombre?: string;
  carreraNombre?: string;
}

// Definición de la interfaz Carrera
interface Carrera {
  id: number;
  nombre: string;
}

// Definición de la interfaz Estado
interface Estado {
  id: number;
  nombre: string;
}

// DTO para crear estudiante
interface CreateEstudianteDto {
  nombre: string;
  apellidos: string;
  edad: number;
  correo: string;
  estadoId?: number;
  carreraId?: number;
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
  
  newStudent: CreateEstudianteDto = {
    nombre: '',
    apellidos: '',
    edad: 0,
    correo: '',
    estadoId: undefined,
    carreraId: undefined
  };
  
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroCarrera: string = '';
  
  totalEstudiantes: number = 0;
  activos: number = 0;
  carreras: number = 0;
  edadPromedio: number = 0;
  
  carrerasDisponibles: Carrera[] = [];
  estadosDisponibles: Estado[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarEstados();
    this.cargarCarreras();
    this.cargarEstudiantes();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  cargarEstados() {
    this.http.get<Estado[]>('http://localhost:3000/api-beca/Estado', { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (data) => {
        this.estadosDisponibles = data;
      },
      error: (err) => {
        console.error('Error al cargar estados:', err);
      }
    });
  }

  cargarCarreras() {
    this.http.get<Carrera[]>('http://localhost:3000/api-beca/Carrera', { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (data) => {
        this.carrerasDisponibles = data;
      },
      error: (err) => {
        console.error('Error al cargar carreras:', err);
      }
    });
  }

  cargarEstudiantes() {
    this.loading = true;
    this.error = '';
    
    this.http.get<Estudiante[]>('http://localhost:3000/api-beca/estudiantes', { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.estudiantes = data;
        this.filteredEstudiantes = [...this.estudiantes];
        this.calcularKPIs();
        this.filtrarEstudiantes();
      },
      error: (err) => {
        this.error = 'Error al cargar estudiantes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  calcularKPIs() {
    this.totalEstudiantes = this.estudiantes.length;
    
    // Estudiantes activos (suponiendo que estadoId=1 significa activo)
    this.activos = this.estudiantes.filter(e => e.estadoId === 1).length;
    
    // Carreras representadas
    const carrerasUnicas = new Set(this.estudiantes
      .filter(e => e.carreraId)
      .map(e => e.carreraId)
    );
    this.carreras = carrerasUnicas.size;
    
    // Edad promedio
    if (this.estudiantes.length > 0) {
      const sumaEdades = this.estudiantes.reduce((sum, e) => sum + (e.edad || 0), 0);
      this.edadPromedio = Math.round(sumaEdades / this.estudiantes.length);
    } else {
      this.edadPromedio = 0;
    }
  }

  // Método para obtener el nombre de la carrera por ID
  getCarreraNombre(carreraId: number | undefined): string {
    if (!carreraId) return '-';
    const carrera = this.carrerasDisponibles.find(c => c.id === carreraId);
    return carrera ? carrera.nombre : '-';
  }

  // Método para obtener el nombre del estado por ID
  getEstadoNombre(estadoId: number | undefined): string {
    if (!estadoId) return '-';
    const estado = this.estadosDisponibles.find(e => e.id === estadoId);
    return estado ? estado.nombre : '-';
  }

  onSubmitNewStudent() {
    // Validaciones
    if (!this.newStudent.nombre?.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    
    if (!this.newStudent.apellidos?.trim()) {
      this.error = 'Los apellidos son requeridos';
      return;
    }
    
    if (!this.newStudent.edad || this.newStudent.edad < 16 || this.newStudent.edad > 100) {
      this.error = 'La edad debe ser válida (entre 16 y 100 años)';
      return;
    }
    
    if (!this.newStudent.correo?.trim()) {
      this.error = 'El correo es requerido';
      return;
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newStudent.correo)) {
      this.error = 'Formato de correo inválido';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.http.post<Estudiante>('http://localhost:3000/api-beca/estudiantes/add', this.newStudent, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newStudent = {
          nombre: '',
          apellidos: '',
          edad: 0,
          correo: '',
          estadoId: undefined,
          carreraId: undefined
        };
        // Recargar lista
        this.cargarEstudiantes();
        alert('Estudiante creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir estudiante';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel() {
    this.newStudent = {
      nombre: '',
      apellidos: '',
      edad: 0,
      correo: '',
      estadoId: undefined,
      carreraId: undefined
    };
    this.error = '';
  }

  filtrarEstudiantes() {
    let filtered = [...this.estudiantes];
    
    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(estudiante => 
        estudiante.nombre.toLowerCase().includes(term) ||
        estudiante.apellido.toLowerCase().includes(term) ||
        estudiante.correo.toLowerCase().includes(term) ||
        (estudiante.carreraNombre?.toLowerCase().includes(term)) ||
        (estudiante.estadoNombre?.toLowerCase().includes(term))
      );
    }
    
    // Filtrar por estado
    if (this.filtroEstado) {
      filtered = filtered.filter(estudiante => 
        estudiante.estadoId?.toString() === this.filtroEstado
      );
    }
    
    // Filtrar por carrera
    if (this.filtroCarrera) {
      filtered = filtered.filter(estudiante => 
        estudiante.carreraId?.toString() === this.filtroCarrera
      );
    }
    
    this.filteredEstudiantes = filtered;
  }

  onSearch() {
    this.filtrarEstudiantes();
  }

  onFilterChange() {
    this.filtrarEstudiantes();
  }

  deleteEstudiante(id: number) {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      this.loading = true;
      
      this.http.delete(`http://localhost:3000/api-beca/estudiantes/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarEstudiantes();
          alert('Estudiante eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar estudiante';
          console.error(err);
        }
      });
    }
  }
}
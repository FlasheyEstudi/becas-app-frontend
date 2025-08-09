import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definición de la interfaz PeriodoAcademico
interface PeriodoAcademico {
  id: number;
  nombre: string;
  anioAcademico: string;
  fechaInicio: string; // ISO string
  fechaFin: string;     // ISO string
  estadoId: number;
  // estadoNombre?: string; // Eliminado según decisión anterior
}

// DTO para crear periodo académico
interface CreatePeriodoAcademicoDto {
  nombre: string;
  anioAcademico: string;
  fechaInicio: string; // ISO string
  fechaFin: string;     // ISO string
  estadoId: number;
}

@Component({
  selector: 'app-periodo-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periodo-academico.html',
  styleUrls: ['./periodo-academico.scss']
})
export class PeriodoAcademicoComponent implements OnInit {
  periodos: PeriodoAcademico[] = [];
  filteredPeriodos: PeriodoAcademico[] = [];
  error: string = '';
  loading: boolean = false;
  
  newPeriodo: CreatePeriodoAcademicoDto = {
    nombre: '',
    anioAcademico: '',
    fechaInicio: '',
    fechaFin: '',
    estadoId: 0
  };
  
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarPeriodos();
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

  cargarPeriodos() {
    this.loading = true;
    this.error = '';
    
    this.http.get<PeriodoAcademico[]>('http://localhost:3000/api-beca/PeriodoAcademico', { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.periodos = data;
        this.filteredPeriodos = [...this.periodos];
      },
      error: (err) => {
        this.error = 'Error al cargar períodos académicos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmitNewPeriodo() {
    // Validaciones
    if (!this.newPeriodo.nombre?.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    
    if (!this.newPeriodo.anioAcademico?.trim()) {
      this.error = 'El año académico es requerido';
      return;
    }
    
    if (!this.newPeriodo.fechaInicio) {
      this.error = 'La fecha de inicio es requerida';
      return;
    }
    
    if (!this.newPeriodo.fechaFin) {
      this.error = 'La fecha de fin es requerida';
      return;
    }
    
    // Verificar que fechaFin sea posterior a fechaInicio
    const inicio = new Date(this.newPeriodo.fechaInicio);
    const fin = new Date(this.newPeriodo.fechaFin);
    if (fin < inicio) {
      this.error = 'La fecha de fin debe ser posterior a la fecha de inicio';
      return;
    }
    
    if (!this.newPeriodo.estadoId || this.newPeriodo.estadoId < 1) {
      this.error = 'El ID del estado es requerido y debe ser válido';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.http.post<PeriodoAcademico>('http://localhost:3000/api-beca/PeriodoAcademico/add', this.newPeriodo, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newPeriodo = {
          nombre: '',
          anioAcademico: '',
          fechaInicio: '',
          fechaFin: '',
          estadoId: 0
        };
        // Recargar lista
        this.cargarPeriodos();
        alert('Período académico creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir período académico: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel() {
    this.newPeriodo = {
      nombre: '',
      anioAcademico: '',
      fechaInicio: '',
      fechaFin: '',
      estadoId: 0
    };
    this.error = '';
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredPeriodos = [...this.periodos];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredPeriodos = this.periodos.filter(periodo => 
      periodo.nombre.toLowerCase().includes(term) ||
      periodo.anioAcademico.toLowerCase().includes(term)
      // periodo.estadoNombre?.toLowerCase().includes(term) // Eliminado
    );
  }

  deletePeriodo(id: number) {
    if (confirm('¿Estás seguro de eliminar este período académico?')) {
      this.loading = true;
      
      this.http.delete(`http://localhost:3000/api-beca/PeriodoAcademico/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarPeriodos();
          alert('Período académico eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar período académico';
          console.error(err);
        }
      });
    }
  }
}
// Componente para gestionar criterios de evaluación
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar un criterio de evaluación
interface CriterioEvaluacion {
  id: number;
  nombre: string;
  descripcion?: string;
  peso: number;
  tipoBecaId?: number;
}

// DTO para crear criterio de evaluación
interface CreateCriterioEvaluacionDto {
  nombre: string;
  descripcion?: string;
  peso: number;
  tipoBecaId?: number;
}

@Component({
  selector: 'app-criterio-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './criterio-evaluacion.html',
  styleUrls: ['./criterio-evaluacion.scss']
})
export class CriterioEvaluacionComponent implements OnInit {
  // Array para almacenar los criterios de evaluación
  criterios: CriterioEvaluacion[] = [];
  // Array para almacenar criterios filtrados
  filteredCriterios: CriterioEvaluacion[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para el nuevo criterio de evaluación
  newCriterio: CreateCriterioEvaluacionDto = {
    nombre: '',
    descripcion: '',
    peso: 0,
    tipoBecaId: 0
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarCriterios();
  }

  // Método privado para obtener los encabezados HTTP con token de autenticación
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

  // Método para cargar todos los criterios de evaluación desde el backend
  cargarCriterios() {
    this.loading = true;
    this.error = '';
    this.http.get<CriterioEvaluacion[]>('http://localhost:3000/api-beca/CriterioEvaluacion', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.criterios = data;
        this.filteredCriterios = [...this.criterios];
      },
      error: (err) => {
        this.error = 'Error al cargar criterios de evaluación';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nuevo criterio
  onSubmitNewCriterio() {
    // Validaciones
    if (!this.newCriterio.nombre) {
      this.error = 'El nombre del criterio es requerido';
      return;
    }
    if (!this.newCriterio.peso || this.newCriterio.peso <= 0) {
      this.error = 'El peso es requerido y debe ser mayor a 0';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<CriterioEvaluacion>('http://localhost:3000/api-beca/CriterioEvaluacion/add', this.newCriterio, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newCriterio = {
          nombre: '',
          descripcion: '',
          peso: 0,
          tipoBecaId: 0
        };
        // Recargar lista
        this.cargarCriterios();
        alert('Criterio de evaluación creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir criterio de evaluación: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nuevo criterio
  onCancel() {
    this.newCriterio = {
      nombre: '',
      descripcion: '',
      peso: 0,
      tipoBecaId: 0
    };
    this.error = '';
  }

  // Método para filtrar criterios según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredCriterios = [...this.criterios];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCriterios = this.criterios.filter(criterio =>
      criterio.nombre.toLowerCase().includes(term) ||
      criterio.descripcion?.toLowerCase().includes(term)
    );
  }

  // Método para eliminar un criterio de evaluación
  deleteCriterio(id: number) {
    if (confirm('¿Estás seguro de eliminar este criterio de evaluación?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/CriterioEvaluacion/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarCriterios();
          alert('Criterio de evaluación eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar criterio de evaluación';
          console.error(err);
        }
      });
    }
  }
}
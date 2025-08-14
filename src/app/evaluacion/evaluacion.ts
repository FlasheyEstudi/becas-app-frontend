// Componente para gestionar evaluaciones
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar una evaluación
interface Evaluacion {
  id: number;
  solicitudId: number;
  evaluadorId: number;
  puntuacionTotal: number;
  comentarios?: string;
  recomendacion?: string;
  fechaEvaluacion?: string;
}

// DTO para crear evaluación
interface CreateEvaluacionDto {
  solicitudId: number;
  evaluadorId: number;
  puntuacionTotal: number;
  comentarios?: string;
  recomendacion?: string;
}

@Component({
  selector: 'app-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluacion.html',
  styleUrls: ['./evaluacion.scss']
})
export class EvaluacionComponent implements OnInit {
  // Array para almacenar las evaluaciones
  evaluaciones: Evaluacion[] = [];
  // Array para almacenar evaluaciones filtradas
  filteredEvaluaciones: Evaluacion[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para la nueva evaluación
  newEvaluacion: CreateEvaluacionDto = {
    solicitudId: 0,
    evaluadorId: 0,
    puntuacionTotal: 0,
    recomendacion: 'pendiente'
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarEvaluaciones();
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

  // Método para cargar todas las evaluaciones desde el backend
  cargarEvaluaciones() {
    this.loading = true;
    this.error = '';
    this.http.get<Evaluacion[]>('http://localhost:3000/api-beca/Evaluacion', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.evaluaciones = data;
        this.filteredEvaluaciones = [...this.evaluaciones];
      },
      error: (err) => {
        this.error = 'Error al cargar evaluaciones';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nueva evaluación
  onSubmitNewEvaluacion() {
    // Validaciones
    if (!this.newEvaluacion.solicitudId || this.newEvaluacion.solicitudId <= 0) {
      this.error = 'El ID de la solicitud es requerido y debe ser válido';
      return;
    }
    if (!this.newEvaluacion.evaluadorId || this.newEvaluacion.evaluadorId <= 0) {
      this.error = 'El ID del evaluador es requerido y debe ser válido';
      return;
    }
    if (!this.newEvaluacion.puntuacionTotal || this.newEvaluacion.puntuacionTotal < 0) {
      this.error = 'La puntuación total es requerida y debe ser mayor o igual a 0';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<Evaluacion>('http://localhost:3000/api-beca/Evaluacion/add', this.newEvaluacion, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newEvaluacion = {
          solicitudId: 0,
          evaluadorId: 0,
          puntuacionTotal: 0,
          recomendacion: 'pendiente'
        };
        // Recargar lista
        this.cargarEvaluaciones();
        alert('Evaluación creada correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir evaluación: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nueva evaluación
  onCancel() {
    this.newEvaluacion = {
      solicitudId: 0,
      evaluadorId: 0,
      puntuacionTotal: 0,
      recomendacion: 'pendiente'
    };
    this.error = '';
  }

  // Método para filtrar evaluaciones según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredEvaluaciones = [...this.evaluaciones];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredEvaluaciones = this.evaluaciones.filter(evaluacion =>
      evaluacion.solicitudId.toString().includes(term) ||
      evaluacion.evaluadorId.toString().includes(term)
    );
  }

  // Método para eliminar una evaluación
  deleteEvaluacion(id: number) {
    if (confirm('¿Estás seguro de eliminar esta evaluación?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/Evaluacion/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarEvaluaciones();
          alert('Evaluación eliminada correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar evaluación';
          console.error(err);
        }
      });
    }
  }
}
// Componente para gestionar detalles de evaluación
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar un detalle de evaluación
interface DetalleEvaluacion {
  id: number;
  evaluacionId: number;
  criterioId: number;
  puntuacion: number;
  comentarios?: string;
}

// DTO para crear detalle de evaluación
interface CreateDetalleEvaluacionDto {
  evaluacionId: number;
  criterioId: number;
  puntuacion: number;
  comentarios?: string;
}

@Component({
  selector: 'app-detalle-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-evaluacion.html',
  styleUrls: ['./detalle-evaluacion.scss']
})
export class DetalleEvaluacionComponent implements OnInit {
  // Array para almacenar los detalles de evaluación
  detalles: DetalleEvaluacion[] = [];
  // Array para almacenar detalles filtrados
  filteredDetalles: DetalleEvaluacion[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para el nuevo detalle de evaluación
  newDetalle: CreateDetalleEvaluacionDto = {
    evaluacionId: 0,
    criterioId: 0,
    puntuacion: 0,
    comentarios: ''
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarDetalles();
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

  // Método para cargar todos los detalles de evaluación desde el backend
  cargarDetalles() {
    this.loading = true;
    this.error = '';
    this.http.get<DetalleEvaluacion[]>('http://localhost:3000/api-beca/DetalleEvaluacion', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.detalles = data;
        this.filteredDetalles = [...this.detalles];
      },
      error: (err) => {
        this.error = 'Error al cargar detalles de evaluación';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nuevo detalle
  onSubmitNewDetalle() {
    // Validaciones
    if (!this.newDetalle.evaluacionId || this.newDetalle.evaluacionId <= 0) {
      this.error = 'El ID de la evaluación es requerido y debe ser válido';
      return;
    }
    if (!this.newDetalle.criterioId || this.newDetalle.criterioId <= 0) {
      this.error = 'El ID del criterio es requerido y debe ser válido';
      return;
    }
    if (!this.newDetalle.puntuacion || this.newDetalle.puntuacion < 0) {
      this.error = 'La puntuación es requerida y debe ser mayor o igual a 0';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<DetalleEvaluacion>('http://localhost:3000/api-beca/DetalleEvaluacion/add', this.newDetalle, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newDetalle = {
          evaluacionId: 0,
          criterioId: 0,
          puntuacion: 0,
          comentarios: ''
        };
        // Recargar lista
        this.cargarDetalles();
        alert('Detalle de evaluación creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir detalle de evaluación: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nuevo detalle
  onCancel() {
    this.newDetalle = {
      evaluacionId: 0,
      criterioId: 0,
      puntuacion: 0,
      comentarios: ''
    };
    this.error = '';
  }

  // Método para filtrar detalles según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredDetalles = [...this.detalles];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredDetalles = this.detalles.filter(detalle =>
      detalle.evaluacionId.toString().includes(term) ||
      detalle.criterioId.toString().includes(term)
    );
  }

  // Método para eliminar un detalle de evaluación
  deleteDetalle(id: number) {
    if (confirm('¿Estás seguro de eliminar este detalle de evaluación?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/DetalleEvaluacion/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarDetalles();
          alert('Detalle de evaluación eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar detalle de evaluación';
          console.error(err);
        }
      });
    }
  }
}
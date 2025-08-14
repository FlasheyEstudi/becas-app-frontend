// src/app/solicitud-beca/solicitud-beca.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

// Interfaz para representar un estudiante
interface Estudiante {
  nombre: string;
  apellido: string;
}

// Interfaz para representar un tipo de beca
interface TipoBeca {
  nombre: string;
}

// Interfaz para representar un estado
interface Estado {
  nombre: string;
}

// Interfaz para representar un período académico
interface PeriodoAcademico {
  nombre: string;
}

// Interfaz para representar una solicitud de beca
interface SolicitudBeca {
  id: number;
  estudianteId: number;
  estudiante?: Estudiante;
  tipoBecaId: number;
  tipoBeca?: TipoBeca;
  estadoId: number;
  estado?: Estado;
  fechaSolicitud: string;
  periodoAcademicoId: number;
  periodoAcademico?: PeriodoAcademico;
  observaciones: string | null;
  fechaResultado: string | null;
}

// DTO para crear solicitud de beca
interface CreateSolicitudBecaDto {
  estudianteId: number;
  tipoBecaId: number;
  estadoId: number;
  fechaSolicitud: string;
  periodoAcademicoId: number;
  observaciones?: string | null;
  fechaResultado?: string | null;
}

@Component({
  selector: 'app-solicitud-beca',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './solicitud-beca.html',
  styleUrls: ['./solicitud-beca.scss']
})
export class SolicitudBecaComponent implements OnInit {
  // Array para almacenar las solicitudes
  solicitudes: SolicitudBeca[] = [];
  // Array para almacenar solicitudes filtradas
  filteredSolicitudes: SolicitudBeca[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Término de búsqueda
  searchTerm: string = '';
  // Objeto para la nueva solicitud
  newSolicitud: CreateSolicitudBecaDto = {
    estudianteId: 0,
    tipoBecaId: 0,
    estadoId: 0,
    fechaSolicitud: new Date().toISOString().split('T')[0],
    periodoAcademicoId: 0,
    observaciones: null,
    fechaResultado: null
  };
  
  // URL base para la API
  private baseUrl = 'http://localhost:3000/api-beca/solicitudes-beca';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  // Método para cargar todas las solicitudes desde el backend
  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';
    this.http.get<SolicitudBeca[]>(this.baseUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.solicitudes = data || [];
          this.filteredSolicitudes = [...this.solicitudes];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar solicitudes de beca: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
  }

  // Método para manejar el envío del formulario de nueva solicitud
  onSubmitNewSolicitud(form: NgForm): void {
    if (!this.validateNewSolicitud()) return;
    this.loading = true;
    this.error = '';
    const payload = {
      ...this.newSolicitud,
      observaciones: this.newSolicitud.observaciones || null,
      fechaResultado: this.newSolicitud.fechaResultado || null
    };
    this.http.post<SolicitudBeca>(this.baseUrl, payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.loading = false;
          this.resetNewSolicitud();
          form.resetForm();
          this.cargarSolicitudes();
        },
        error: (err) => {
          this.error = 'Error al añadir solicitud de beca: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
  }

  // Método para validar el formulario de nueva solicitud
  private validateNewSolicitud(): boolean {
    if (!this.newSolicitud.estudianteId || this.newSolicitud.estudianteId <= 0) {
      this.error = 'El ID del estudiante es requerido y debe ser válido';
      return false;
    }
    if (!this.newSolicitud.tipoBecaId || this.newSolicitud.tipoBecaId <= 0) {
      this.error = 'El ID del tipo de beca es requerido y debe ser válido';
      return false;
    }
    if (!this.newSolicitud.estadoId || this.newSolicitud.estadoId <= 0) {
      this.error = 'El ID del estado es requerido y debe ser válido';
      return false;
    }
    if (!this.newSolicitud.fechaSolicitud) {
      this.error = 'La fecha de solicitud es requerida';
      return false;
    }
    if (!this.newSolicitud.periodoAcademicoId || this.newSolicitud.periodoAcademicoId <= 0) {
      this.error = 'El ID del período académico es requerido y debe ser válido';
      return false;
    }
    return true;
  }

  // Método para resetear el formulario de nueva solicitud
  private resetNewSolicitud(): void {
    this.newSolicitud = {
      estudianteId: 0,
      tipoBecaId: 0,
      estadoId: 0,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      periodoAcademicoId: 0,
      observaciones: null,
      fechaResultado: null
    };
  }

  // Método para cancelar la creación de nueva solicitud
  onCancel(form: NgForm): void {
    this.resetNewSolicitud();
    form.resetForm();
    this.error = '';
  }

  // Método para filtrar solicitudes según término de búsqueda
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSolicitudes = [...this.solicitudes];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredSolicitudes = this.solicitudes.filter(solicitud =>
      (solicitud.observaciones?.toLowerCase()?.includes(term) || false) ||
      (solicitud.estudiante?.nombre?.toLowerCase()?.includes(term) || false) ||
      (solicitud.estudiante?.apellido?.toLowerCase()?.includes(term) || false) ||
      (solicitud.tipoBeca?.nombre?.toLowerCase()?.includes(term) || false) ||
      (solicitud.estado?.nombre?.toLowerCase()?.includes(term) || false) ||
      (solicitud.periodoAcademico?.nombre?.toLowerCase()?.includes(term) || false)
    );
  }

  // Método para eliminar una solicitud
  deleteSolicitud(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta solicitud de beca?')) {
      this.loading = true;
      this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.cargarSolicitudes();
          },
          error: (err) => {
            this.error = 'Error al eliminar solicitud de beca: ' + (err.error?.message || err.message);
            this.loading = false;
          }
        });
    }
  }

  // Método privado para obtener los encabezados HTTP con token de autenticación
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}
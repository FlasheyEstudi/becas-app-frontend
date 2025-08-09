import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces
interface SolicitudBeca {
  id: number;
  estudianteId: number;
  estudiante?: { nombre: string; apellido: string };
  tipoBecaId: number;
  tipoBeca?: { nombre: string };
  estadoId: number;
  estado?: { nombre: string };
  fechaSolicitud: string;
  periodoAcademicoId: number;
  periodoAcademico?: { nombre: string };
  observaciones: string | null;
  fechaResultado: string | null;
}

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
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitud-beca.html',
  styleUrls: ['./solicitud-beca.scss']
})
export class SolicitudBecaComponent implements OnInit {
  solicitudes: SolicitudBeca[] = [];
  filteredSolicitudes: SolicitudBeca[] = [];
  error: string = '';
  loading: boolean = false;

  newSolicitud: CreateSolicitudBecaDto = {
    estudianteId: 0,
    tipoBecaId: 0,
    estadoId: 0,
    fechaSolicitud: new Date().toISOString().split('T')[0],
    periodoAcademicoId: 0,
    observaciones: null,
    fechaResultado: null
  };

  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  cargarSolicitudes() {
    this.loading = true;
    this.error = '';

    this.http.get<SolicitudBeca[]>('http://localhost:3000/api-beca/SolicitudBeca', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.filteredSolicitudes = [...this.solicitudes];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar solicitudes de beca: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmitNewSolicitud() {
    if (!this.newSolicitud.estudianteId || this.newSolicitud.estudianteId <= 0) {
      this.error = 'El ID del estudiante es requerido y debe ser válido';
      return;
    }

    if (!this.newSolicitud.tipoBecaId || this.newSolicitud.tipoBecaId <= 0) {
      this.error = 'El ID del tipo de beca es requerido y debe ser válido';
      return;
    }

    if (!this.newSolicitud.estadoId || this.newSolicitud.estadoId <= 0) {
      this.error = 'El ID del estado es requerido y debe ser válido';
      return;
    }

    if (!this.newSolicitud.fechaSolicitud) {
      this.error = 'La fecha de solicitud es requerida';
      return;
    }

    if (!this.newSolicitud.periodoAcademicoId || this.newSolicitud.periodoAcademicoId <= 0) {
      this.error = 'El ID del período académico es requerido y debe ser válido';
      return;
    }

    this.loading = true;
    this.error = '';

    const payload = {
      ...this.newSolicitud,
      observaciones: this.newSolicitud.observaciones || null,
      fechaResultado: this.newSolicitud.fechaResultado || null
    };

    this.http.post<SolicitudBeca>('http://localhost:3000/api-beca/SolicitudBeca/add', payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.loading = false;
        this.newSolicitud = {
          estudianteId: 0,
          tipoBecaId: 0,
          estadoId: 0,
          fechaSolicitud: new Date().toISOString().split('T')[0],
          periodoAcademicoId: 0,
          observaciones: null,
          fechaResultado: null
        };
        this.cargarSolicitudes();
        alert('Solicitud de beca creada correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir solicitud de beca: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel() {
    this.newSolicitud = {
      estudianteId: 0,
      tipoBecaId: 0,
      estadoId: 0,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      periodoAcademicoId: 0,
      observaciones: null,
      fechaResultado: null
    };
    this.error = '';
  }

  onSearch() {
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

  deleteSolicitud(id: number) {
    if (confirm('¿Estás seguro de eliminar esta solicitud de beca?')) {
      this.loading = true;

      this.http.delete(`http://localhost:3000/api-beca/SolicitudBeca/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarSolicitudes();
          alert('Solicitud de beca eliminada correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar solicitud de beca: ' + (err.error?.message || err.message);
          console.error(err);
        }
      });
    }
  }
}

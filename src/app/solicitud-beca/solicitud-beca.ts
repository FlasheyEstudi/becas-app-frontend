import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

interface Estudiante { nombre: string; apellido: string; }
interface TipoBeca { nombre: string; id: number; }
interface Estado { nombre: string; id: number; }
interface PeriodoAcademico { nombre: string; id: number; }
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
  imports: [CommonModule, NgIf, NgFor, FormsModule, DatePipe],
  templateUrl: './solicitud-beca.html',
  styleUrls: ['./solicitud-beca.scss']
})
export class SolicitudBecaComponent implements OnInit {
  solicitudes: SolicitudBeca[] = [];
  filteredSolicitudes: SolicitudBeca[] = [];
  solicitudesPendientes: SolicitudBeca[] = [];
  error: string = '';
  loading: boolean = false;
  searchTerm: string = '';
  estudianteId: number | null = null;
  tiposBeca: TipoBeca[] = [];
  periodosAcademicos: PeriodoAcademico[] = [];
  estados: Estado[] = [];

  newSolicitud: CreateSolicitudBecaDto = {
    estudianteId: 0,
    tipoBecaId: 0,
    estadoId: 1,
    fechaSolicitud: new Date().toISOString().split('T')[0],
    periodoAcademicoId: 0,
    observaciones: null,
    fechaResultado: null
  };

  private baseUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.obtenerEstudianteId();
    if (this.estudianteId) {
      this.cargarDatosIniciales();
      this.cargarPendientes();
    }
  }

  private obtenerEstudianteId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.estudianteId = payload.sub || payload.id;
      } catch (err) {
        console.error('Error al decodificar token:', err);
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  private cargarDatosIniciales() {
    this.loading = true;
    Promise.all([
      this.cargarTiposBeca(),
      this.cargarPeriodosAcademicos(),
      this.cargarEstados(),
      this.cargarSolicitudes()
    ]).finally(() => this.loading = false);
  }

  private cargarTiposBeca() {
    return new Promise<void>((resolve) => {
      this.http.get<TipoBeca[]>(`${this.baseUrl}/tipo-beca`, { headers: this.getHeaders() })
        .subscribe({ next: data => { this.tiposBeca = data; }, error: err => console.error(err), complete: () => resolve() });
    });
  }

  private cargarPeriodosAcademicos() {
    return new Promise<void>((resolve) => {
      this.http.get<PeriodoAcademico[]>(`${this.baseUrl}/periodo-academico`, { headers: this.getHeaders() })
        .subscribe({ next: data => { this.periodosAcademicos = data; }, error: err => console.error(err), complete: () => resolve() });
    });
  }

  private cargarEstados() {
    return new Promise<void>((resolve) => {
      this.http.get<Estado[]>(`${this.baseUrl}/Estado`, { headers: this.getHeaders() })
        .subscribe({ next: data => { this.estados = data; }, error: err => console.error(err), complete: () => resolve() });
    });
  }

  cargarSolicitudes(): void {
    if (!this.estudianteId) return;
    this.loading = true;
    this.http.get<SolicitudBeca[]>(`${this.baseUrl}/solicitudes-beca/estudiante/${this.estudianteId}`, { headers: this.getHeaders() })
      .subscribe({
        next: data => { 
          this.solicitudes = data || []; 
          this.filteredSolicitudes = [...this.solicitudes]; 
          this.loading = false; 
        },
        error: err => { 
          this.error = 'Error al cargar solicitudes'; 
          this.loading = false; 
          console.error(err); 
        }
      });
  }

  private cargarPendientes(): void {
    this.loading = true;
    this.http.get<SolicitudBeca[]>(`${this.baseUrl}/solicitudes-beca/pendientes`, { headers: this.getHeaders() })
      .subscribe({
        next: data => { this.solicitudesPendientes = data || []; this.loading = false; },
        error: err => { console.error('Error cargando pendientes:', err); this.loading = false; }
      });
  }

  onSubmitNewSolicitud(form: NgForm): void {
    if (!this.validarSolicitud()) return;
    this.loading = true;
    const payload = { ...this.newSolicitud, estudianteId: this.estudianteId || 0 };
    this.http.post<SolicitudBeca>(`${this.baseUrl}/solicitudes-beca`, payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => { 
          this.resetNewSolicitud(); 
          form.resetForm(); 
          this.cargarSolicitudes(); 
          this.cargarPendientes(); 
          this.loading = false; 
        },
        error: err => { 
          this.error = 'Error al añadir solicitud: ' + (err.error?.message || err.message); 
          this.loading = false; 
        }
      });
  }

  private validarSolicitud(): boolean {
    if (!this.estudianteId || this.estudianteId <= 0) { this.error = 'ID inválido'; return false; }
    if (!this.newSolicitud.tipoBecaId || this.newSolicitud.tipoBecaId <= 0) { this.error = 'Seleccione tipo de beca'; return false; }
    if (!this.newSolicitud.estadoId || this.newSolicitud.estadoId <= 0) { this.error = 'Estado inválido'; return false; }
    if (!this.newSolicitud.fechaSolicitud) { this.error = 'Fecha de solicitud requerida'; return false; }
    if (!this.newSolicitud.periodoAcademicoId || this.newSolicitud.periodoAcademicoId <= 0) { this.error = 'Seleccione período académico'; return false; }
    return true;
  }

  private resetNewSolicitud(): void {
    this.newSolicitud = {
      estudianteId: this.estudianteId || 0,
      tipoBecaId: 0,
      estadoId: 1,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      periodoAcademicoId: 0,
      observaciones: null,
      fechaResultado: null
    };
    this.error = '';
  }

  onCancel(form: NgForm): void {
    this.resetNewSolicitud();
    form.resetForm();
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) { this.filteredSolicitudes = [...this.solicitudes]; return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredSolicitudes = this.solicitudes.filter(s =>
      (s.observaciones?.toLowerCase().includes(term) || false) ||
      (s.estudiante?.nombre?.toLowerCase().includes(term) || false) ||
      (s.estudiante?.apellido?.toLowerCase().includes(term) || false) ||
      (s.tipoBeca?.nombre?.toLowerCase().includes(term) || false) ||
      (s.estado?.nombre?.toLowerCase().includes(term) || false) ||
      (s.periodoAcademico?.nombre?.toLowerCase().includes(term) || false)
    );
  }

  deleteSolicitud(id: number): void {
    if (!confirm('¿Eliminar solicitud?')) return;
    this.loading = true;
    this.http.delete(`${this.baseUrl}/solicitudes-beca/${id}`, { headers: this.getHeaders() })
      .subscribe({ 
        next: () => { this.cargarSolicitudes(); this.cargarPendientes(); this.loading = false; },
        error: err => { this.error = 'Error al eliminar solicitud'; this.loading = false; } 
      });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getTipoBecaNombre(id: number): string { return this.tiposBeca.find(t => t.id === id)?.nombre || 'Desconocido'; }
  getPeriodoNombre(id: number): string { return this.periodosAcademicos.find(p => p.id === id)?.nombre || 'Desconocido'; }
  getEstadoNombre(id: number): string { return this.estados.find(e => e.id === id)?.nombre || 'Desconocido'; }
}

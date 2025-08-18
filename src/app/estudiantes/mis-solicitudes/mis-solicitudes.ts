import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

// Tipos auxiliares
interface Estado {
  id: number;
  nombre: string;
}

interface Estudiante {
  id: number;
  nombre: string;
  apellidos: string | null;
  estado: Estado;
  nombreCompleto?: string;
}

interface SolicitudBeca {
  id: number;
  fechaSolicitud: string;
  estado: Estado;
  tipoBeca: { id: number; nombre: string };
  estudiante: Estudiante;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './mis-solicitudes.html',
  styleUrls: ['./mis-solicitudes.scss']
})
export class MisSolicitudesComponent implements OnInit {
  solicitudes: SolicitudBeca[] = [];
  loading = false;
  error = '';
  estudianteId: number | null = null;

  private baseUrl = 'http://localhost:3000/api-beca/solicitudes-beca';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerEstudianteId();
    if (this.estudianteId) {
      this.cargarSolicitudes();
    }
  }

  private obtenerEstudianteId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.estudianteId = payload.sub || payload.id;
        console.log('ID del estudiante obtenido:', this.estudianteId);
      } catch (err) {
        console.error('Error al decodificar token:', err);
        this.estudianteId = null;
      }
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';

    if (!this.estudianteId) {
      this.error = 'No se pudo obtener el ID del estudiante';
      this.loading = false;
      return;
    }

    console.log('Buscando solicitudes para estudiante ID:', this.estudianteId);

    // Eliminar el parámetro limit para traer todas las solicitudes
    this.http.get<SolicitudBeca[]>(`${this.baseUrl}/estudiante/${this.estudianteId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          console.log('Solicitudes cargadas:', data);
          
          this.solicitudes = data.map(solicitud => {
            const estudianteData = solicitud.estudiante || {
              id: 0,
              nombre: 'Desconocido',
              apellidos: null,
              estado: { id: 0, nombre: 'Desconocido' }
            };
            return {
              ...solicitud,
              estudiante: {
                ...estudianteData,
                nombreCompleto: `${estudianteData.nombre} ${estudianteData.apellidos || ''}`.trim()
              }
            };
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar solicitudes:', err);
          this.error = 'Error al cargar solicitudes: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
  }
}
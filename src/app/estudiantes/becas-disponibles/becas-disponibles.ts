import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BecaModalComponent } from './beca-modal';
import { BecaSolicitudModalComponent } from './beca-solicitud-modal';

// Interfaz para representar una beca
interface Beca {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  estadoId: number;
  cobertura: number;
  requisitos: string[];
  fechaLimite: string;
  beneficiarios: string;
  disponible: boolean;
  tipo?: string;
  valor?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-becas-disponibles',
  standalone: true,
  imports: [CommonModule, FormsModule, BecaModalComponent, BecaSolicitudModalComponent],
  templateUrl: './becas-disponibles.html',
  styleUrls: ['./becas-disponibles.scss']
})
export class BecasDisponiblesComponent implements OnInit {
  becas: Beca[] = [];
  filteredBecas: Beca[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filtroCategoria = 'all';
  showModal = false;
  showSolicitudModal = false;
  becaSeleccionada: Beca | null = null;
  estudianteId: number | null = null;
  
  private baseUrl = 'http://localhost:3000/api-beca/tipo-beca';
  private solicitudUrl = 'http://localhost:3000/api-beca/solicitudes-beca';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerEstudianteId();
    this.cargarBecas();
  }

  private obtenerEstudianteId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.estudianteId = payload.sub || payload.id;
      } catch (err) {
        console.error('Error al decodificar token:', err);
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

  cargarBecas(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Beca[]>(this.baseUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.becas = data.map(tipoBeca => ({
            id: tipoBeca.id,
            nombre: tipoBeca.nombre,
            descripcion: tipoBeca.descripcion,
            monto: tipoBeca.monto,
            estadoId: tipoBeca.estadoId,
            cobertura: Math.min(100, Math.max(0, tipoBeca.monto > 0 ? Math.round(tipoBeca.monto / 100) : 100)),
            requisitos: this.generarRequisitos(tipoBeca),
            fechaLimite: this.generarFechaLimite(),
            beneficiarios: this.generarBeneficiarios(tipoBeca),
            disponible: true,
            tipo: this.generarTipo(tipoBeca),
            valor: tipoBeca.monto ? `$${tipoBeca.monto.toLocaleString()}` : '$0',
            createdAt: tipoBeca.createdAt,
            updatedAt: tipoBeca.updatedAt
          }));
          this.filteredBecas = [...this.becas];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar becas: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
  }

  private generarRequisitos(tipoBeca: Beca): string[] {
    const baseRequisitos = [
      'Cumplir con los requisitos académicos mínimos',
      'No tener materias reprobadas'
    ];
    if (tipoBeca.monto > 5000) baseRequisitos.push('Promedio mínimo de 9.0');
    else if (tipoBeca.monto > 2000) baseRequisitos.push('Promedio mínimo de 8.0');
    return baseRequisitos;
  }

  private generarFechaLimite(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    return fecha.toISOString().split('T')[0];
  }

  private generarBeneficiarios(tipoBeca: Beca): string {
    if (tipoBeca.monto > 5000) return 'Top 10% de estudiantes';
    else if (tipoBeca.monto > 2000) return 'Top 25% de estudiantes';
    return 'Todos los estudiantes';
  }

  private generarTipo(tipoBeca: Beca): string {
    if (tipoBeca.monto > 5000) return 'Beca de Excelencia';
    else if (tipoBeca.monto > 2000) return 'Beca Completa';
    return 'Beca General';
  }

  onSearch() {
    let filtered = [...this.becas];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(beca =>
        beca.nombre.toLowerCase().includes(term) ||
        beca.descripcion.toLowerCase().includes(term) ||
        beca.requisitos.some(req => req.toLowerCase().includes(term))
      );
    }
    if (this.filtroCategoria !== 'all') {
      filtered = filtered.filter(beca => {
        if (this.filtroCategoria === 'excelencia' && beca.monto > 5000) return true;
        if (this.filtroCategoria === 'completa' && beca.monto > 2000 && beca.monto <= 5000) return true;
        if (this.filtroCategoria === 'generales' && beca.monto <= 2000) return true;
        return false;
      });
    }
    this.filteredBecas = filtered;
  }

  solicitudGeneral() {
    this.router.navigate(['/mis-solicitudes']);
  }

  verDetalles(beca: Beca) {
    this.becaSeleccionada = beca;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.becaSeleccionada = null;
  }

  abrirSolicitudModal(beca: Beca) {
    this.becaSeleccionada = beca;
    this.showSolicitudModal = true;
  }

  cerrarSolicitudModal() {
    this.showSolicitudModal = false;
    this.becaSeleccionada = null;
  }

  solicitarBecaDesdeModal(datosSolicitud: any) {
    if (!this.estudianteId) {
      alert('No se pudo identificar el estudiante logueado');
      return;
    }
    const payload = {
      ...datosSolicitud.datos,
      estudianteId: this.estudianteId,
      tipoBecaId: this.becaSeleccionada?.id,
      estadoId: 1, // Estado "Pendiente" (ajusta según tu backend)
      periodoAcademicoId: 1, // Ajusta según tu lógica de periodo académico
      fechaSolicitud: new Date().toISOString(),
      observaciones: datosSolicitud.datos.observaciones || ''
    };
    console.log('Solicitud enviada:', payload);

    this.http.post(`${this.solicitudUrl}`, payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          console.log('Solicitud creada exitosamente');
          this.cerrarSolicitudModal();
          this.router.navigate(['/mis-solicitudes']);
        },
        error: (err) => {
          this.error = 'Error al crear la solicitud: ' + (err.error?.message || err.message);
          console.error('Error detallado:', err);
        }
      });
  }
}
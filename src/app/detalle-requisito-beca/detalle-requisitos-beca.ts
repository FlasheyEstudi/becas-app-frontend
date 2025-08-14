// Componente para gestionar detalles de requisitos de beca
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar un detalle de requisitos de beca
interface DetalleRequisitosBeca {
  id_detalle: number;
  tipoBeca: { id: number; /* puedes añadir más campos si quieres */ };
  requisito: { id: number; /* idem */ };
}

// DTO para crear detalle de requisitos de beca
interface CreateDetalleRequisitosBecaDto {
  tipoBecaId: number;
  requisitoId: number;
}

@Component({
  selector: 'app-detalle-requisitos-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-requisitos-beca.html',
  styleUrls: ['./detalle-requisitos-beca.scss']
})
export class DetalleRequisitosBecaComponent implements OnInit {
  // Array para almacenar los detalles de requisitos de beca
  detalles: DetalleRequisitosBeca[] = [];
  // Array para almacenar detalles filtrados
  filteredDetalles: DetalleRequisitosBeca[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para el nuevo detalle de requisitos de beca
  newDetalle: CreateDetalleRequisitosBecaDto = {
    tipoBecaId: 0,
    requisitoId: 0
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit() {
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

  // Método para cargar todos los detalles de requisitos de beca desde el backend
  cargarDetalles() {
    this.loading = true;
    this.error = '';
    this.http.get<DetalleRequisitosBeca[]>('http://localhost:3000/api-beca/detalle-requisitos-beca', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.detalles = data;
        this.filteredDetalles = [...this.detalles];
      },
      error: (err) => {
        this.error = 'Error al cargar detalles de requisitos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nuevo detalle
  onSubmitNewDetalle() {
    // Validaciones
    if (!this.newDetalle.tipoBecaId || this.newDetalle.tipoBecaId <= 0) {
      this.error = 'El ID del tipo de beca es requerido y debe ser válido';
      return;
    }
    if (!this.newDetalle.requisitoId || this.newDetalle.requisitoId <= 0) {
      this.error = 'El ID del requisito es requerido y debe ser válido';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<DetalleRequisitosBeca>('http://localhost:3000/api-beca/detalle-requisitos-beca/add', this.newDetalle, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.loading = false;
        // Resetear formulario
        this.newDetalle = { tipoBecaId: 0, requisitoId: 0 };
        // Recargar lista
        this.cargarDetalles();
        alert('Detalle de requisitos creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir detalle de requisitos: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nuevo detalle
  onCancel() {
    this.newDetalle = { tipoBecaId: 0, requisitoId: 0 };
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
      detalle.tipoBeca.id.toString().includes(term) ||
      detalle.requisito.id.toString().includes(term)
    );
  }

  // Método para eliminar un detalle de requisitos de beca
  deleteDetalle(id: number) {
    if (confirm('¿Estás seguro de eliminar este detalle de requisitos?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/detalle-requisitos-beca/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarDetalles();
          alert('Detalle de requisitos eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar detalle de requisitos';
          console.error(err);
        }
      });
    }
  }
}
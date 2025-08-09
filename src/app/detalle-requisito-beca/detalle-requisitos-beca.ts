// src/app/detalle-requisitos-beca/detalle-requisitos-beca.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definición de la interfaz DetalleRequisitosBeca
interface DetalleRequisitosBeca {
  id: number;
  TipoBecaId: number;
  RequisitoId: number;
}

// DTO para crear detalle de requisitos de beca
interface CreateDetalleRequisitosBecaDto {
  TipoBecaId: number;
  RequisitoId: number;
}

@Component({
  selector: 'app-detalle-requisitos-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-requisitos-beca.html',
  styleUrls: ['./detalle-requisitos-beca.scss']
})
export class DetalleRequisitosBecaComponent implements OnInit {
  detalles: DetalleRequisitosBeca[] = [];
  filteredDetalles: DetalleRequisitosBeca[] = [];
  error: string = '';
  loading: boolean = false;
  
  newDetalle: CreateDetalleRequisitosBecaDto = {
    TipoBecaId: 0,
    RequisitoId: 0
  };
  
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarDetalles();
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

  cargarDetalles() {
    this.loading = true;
    this.error = '';
    
    this.http.get<DetalleRequisitosBeca[]>('http://localhost:3000/api-beca/Detalle_requisitos_beca', { 
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

  onSubmitNewDetalle() {
    // Validaciones
    if (!this.newDetalle.TipoBecaId || this.newDetalle.TipoBecaId <= 0) {
      this.error = 'El ID del tipo de beca es requerido y debe ser válido';
      return;
    }
    
    if (!this.newDetalle.RequisitoId || this.newDetalle.RequisitoId <= 0) {
      this.error = 'El ID del requisito es requerido y debe ser válido';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.http.post<DetalleRequisitosBeca>('http://localhost:3000/api-beca/Detalle_requisitos_beca/add', this.newDetalle, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newDetalle = {
          TipoBecaId: 0,
          RequisitoId: 0
        };
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

  onCancel() {
    this.newDetalle = {
      TipoBecaId: 0,
      RequisitoId: 0
    };
    this.error = '';
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredDetalles = [...this.detalles];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredDetalles = this.detalles.filter(detalle => 
      detalle.TipoBecaId.toString().includes(term) ||
      detalle.RequisitoId.toString().includes(term)
    );
  }

  deleteDetalle(id: number) {
    if (confirm('¿Estás seguro de eliminar este detalle de requisitos?')) {
      this.loading = true;
      
      this.http.delete(`http://localhost:3000/api-beca/Detalle_requisitos_beca/${id}`, {
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

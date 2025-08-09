import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definición de la interfaz Estado
interface Estado {
  id: number;
  nombre: string;
  fechaRegistro: string; // ISO string
}

// DTO para crear estado
interface CreateEstadoDto {
  nombre: string;
  fechaRegistro: string; // ISO string
}

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estado.html',
  styleUrls: ['./estado.scss']
})
export class EstadoComponent implements OnInit {
  estados: Estado[] = [];
  filteredEstados: Estado[] = [];
  error: string = '';
  loading: boolean = false;
  
  newEstado: CreateEstadoDto = {
    nombre: '',
    fechaRegistro: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  };
  
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarEstados();
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

  cargarEstados() {
    this.loading = true;
    this.error = '';
    
    this.http.get<Estado[]>('http://localhost:3000/api-beca/Estado', { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.estados = data;
        this.filteredEstados = [...this.estados];
      },
      error: (err) => {
        this.error = 'Error al cargar estados';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmitNewEstado() {
    // Validaciones
    if (!this.newEstado.nombre?.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    
    if (!this.newEstado.fechaRegistro) {
      this.error = 'La fecha de registro es requerida';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.http.post<Estado>('http://localhost:3000/api-beca/Estado/add', this.newEstado, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newEstado = {
          nombre: '',
          fechaRegistro: new Date().toISOString().split('T')[0]
        };
        // Recargar lista
        this.cargarEstados();
        alert('Estado creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir estado: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  onCancel() {
    this.newEstado = {
      nombre: '',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    this.error = '';
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredEstados = [...this.estados];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredEstados = this.estados.filter(estado => 
      estado.nombre.toLowerCase().includes(term)
    );
  }

  deleteEstado(id: number) {
    if (confirm('¿Estás seguro de eliminar este estado?')) {
      this.loading = true;
      
      this.http.delete(`http://localhost:3000/api-beca/Estado/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarEstados();
          alert('Estado eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar estado';
          console.error(err);
        }
      });
    }
  }
}
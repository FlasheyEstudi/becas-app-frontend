// Componente para gestionar requisitos
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar un requisito
interface Requisito {
  id: number;
  descripcion: string;
  estadoId: number;
}

// DTO para crear requisito
interface CreateRequisitoDto {
  descripcion: string;
  estadoId: number;
}

@Component({
  selector: 'app-requisitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requisitos.html',
  styleUrls: ['./requisitos.scss']
})
export class RequisitosComponent implements OnInit {
  // Array para almacenar los requisitos
  requisitos: Requisito[] = [];
  // Array para almacenar requisitos filtrados
  filteredRequisitos: Requisito[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para el nuevo requisito
  newRequisito: CreateRequisitoDto = {
    descripcion: '',
    estadoId: 0
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit() {
    this.cargarRequisitos();
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

  // Método para cargar todos los requisitos desde el backend
  cargarRequisitos() {
    this.loading = true;
    this.error = '';
    this.http.get<Requisito[]>('http://localhost:3000/api-beca/Requisito', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.requisitos = data;
        this.filteredRequisitos = [...this.requisitos];
      },
      error: (err) => {
        this.error = 'Error al cargar requisitos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nuevo requisito
  onSubmitNewRequisito() {
    // Validaciones
    if (!this.newRequisito.descripcion?.trim()) {
      this.error = 'La descripción es requerida';
      return;
    }
    if (!this.newRequisito.estadoId || this.newRequisito.estadoId < 1) {
      this.error = 'El ID del estado es requerido y debe ser válido';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<Requisito>('http://localhost:3000/api-beca/Requisito/add', this.newRequisito, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newRequisito = {
          descripcion: '',
          estadoId: 0
        };
        // Recargar lista
        this.cargarRequisitos();
        alert('Requisito creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir requisito: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nuevo requisito
  onCancel() {
    this.newRequisito = {
      descripcion: '',
      estadoId: 0
    };
    this.error = '';
  }

  // Método para filtrar requisitos según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredRequisitos = [...this.requisitos];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredRequisitos = this.requisitos.filter(requisito =>
      requisito.descripcion.toLowerCase().includes(term)
    );
  }

  // Método para eliminar un requisito
  deleteRequisito(id: number) {
    if (confirm('¿Estás seguro de eliminar este requisito?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/Requisito/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarRequisitos();
          alert('Requisito eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar requisito';
          console.error(err);
        }
      });
    }
  }
}
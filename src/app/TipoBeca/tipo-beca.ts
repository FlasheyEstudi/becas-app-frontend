// Componente para gestionar tipos de beca
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar un tipo de beca
interface TipoBeca {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  estadoId: number;
}

// DTO para crear tipo de beca
interface NewTipoBecaForm {
  nombre: string;
  descripcion: string;
  monto: number | null;
  estadoId: number | null;
}

@Component({
  selector: 'app-tipo-beca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-beca.html',
  styleUrls: ['./tipo-beca.scss']
})
export class TipoBecaComponent implements OnInit {
  // Array para almacenar los tipos de beca
  tiposBeca: TipoBeca[] = [];
  // Array para almacenar tipos de beca filtrados
  filteredTiposBeca: TipoBeca[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para el nuevo tipo de beca
  newTipoBeca: NewTipoBecaForm = {
    nombre: '',
    descripcion: '',
    monto: 0,
    estadoId: 0
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit() {
    this.cargarTiposBeca();
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

  // Método para cargar todos los tipos de beca desde el backend
  cargarTiposBeca() {
    this.loading = true;
    this.error = '';
    this.http.get<TipoBeca[]>('http://localhost:3000/api-beca/tipo-beca', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.tiposBeca = data;
        this.filteredTiposBeca = [...this.tiposBeca];
      },
      error: (err) => {
        this.error = 'Error al cargar tipos de beca: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nuevo tipo de beca
  onSubmitNewTipoBeca() {
    // Validaciones
    if (!this.newTipoBeca.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    if (!this.newTipoBeca.descripcion.trim()) {
      this.error = 'La descripción es requerida';
      return;
    }
    if (this.newTipoBeca.monto === null || this.newTipoBeca.monto === undefined || this.newTipoBeca.monto < 0) {
      this.error = 'El monto debe ser un número mayor o igual a 0';
      return;
    }
    if (this.newTipoBeca.estadoId === null || this.newTipoBeca.estadoId === undefined || this.newTipoBeca.estadoId < 1) {
      this.error = 'El ID del estado es requerido y debe ser mayor a 0';
      return;
    }
    this.loading = true;
    this.error = '';
    const payload = {
      nombre: this.newTipoBeca.nombre.trim(),
      descripcion: this.newTipoBeca.descripcion.trim(),
      monto: this.newTipoBeca.monto,
      estadoId: this.newTipoBeca.estadoId
    };
    this.http.post<TipoBeca>('http://localhost:3000/api-beca/tipo-beca', payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.loading = false;
        this.resetForm();
        this.cargarTiposBeca();
        alert('Tipo de beca creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir tipo de beca: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para resetear el formulario de nuevo tipo de beca
  resetForm() {
    this.newTipoBeca = {
      nombre: '',
      descripcion: '',
      monto: 0,
      estadoId: 0
    };
    this.error = '';
  }

  // Método para cancelar la creación de nuevo tipo de beca
  onCancel() {
    this.resetForm();
  }

  // Método para filtrar tipos de beca según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredTiposBeca = [...this.tiposBeca];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredTiposBeca = this.tiposBeca.filter(tipo =>
      tipo.nombre.toLowerCase().includes(term) ||
      tipo.descripcion.toLowerCase().includes(term)
    );
  }

  // Método para eliminar un tipo de beca
  deleteTipoBeca(id: number) {
    if (!confirm('¿Estás seguro de eliminar este tipo de beca?')) return;
    this.loading = true;
    this.error = '';
    this.http.delete(`http://localhost:3000/api-beca/tipo-beca/${id}`, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.loading = false;
        this.cargarTiposBeca();
        alert('Tipo de beca eliminado correctamente');
      },
      error: (err) => {
        this.error = 'Error al eliminar tipo de beca: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
        console.error(err);
      }
    });
  }
}
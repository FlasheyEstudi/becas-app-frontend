import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definición de la interfaz TipoBeca
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
  tiposBeca: TipoBeca[] = [];
  filteredTiposBeca: TipoBeca[] = [];
  error: string = '';
  loading: boolean = false;

  // Inicialización explícita con valores seguros
  newTipoBeca: NewTipoBecaForm = {
    nombre: '',
    descripcion: '',
    monto: 0,
    estadoId: 0
  };

  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarTiposBeca();
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

  cargarTiposBeca() {
    this.loading = true;
    this.error = '';

    this.http.get<TipoBeca[]>('http://localhost:3000/api-beca/TipoBeca', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.tiposBeca = data;
        this.filteredTiposBeca = [...this.tiposBeca];
      },
      error: (err) => {
        this.error = 'Error al cargar tipos de beca';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmitNewTipoBeca() {
    // Validaciones más robustas
    if (!this.newTipoBeca.nombre || !this.newTipoBeca.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    if (!this.newTipoBeca.descripcion || !this.newTipoBeca.descripcion.trim()) {
      this.error = 'La descripción es requerida';
      return;
    }

    // Verificación explícita de que monto sea un número válido y no negativo
    if (this.newTipoBeca.monto === null || this.newTipoBeca.monto === undefined || this.newTipoBeca.monto < 0) {
      this.error = 'El monto debe ser un número mayor o igual a 0';
      return;
    }

    // Verificación explícita de que estadoId sea un número válido y positivo
    if (this.newTipoBeca.estadoId === null || this.newTipoBeca.estadoId === undefined || this.newTipoBeca.estadoId < 1) {
      this.error = 'El ID del estado es requerido y debe ser un número válido mayor a 0';
      return;
    }

    this.loading = true;
    this.error = '';

    // Preparamos los datos para enviar, asegurando tipos correctos
    const requestData = {
      nombre: this.newTipoBeca.nombre.trim(),
      descripcion: this.newTipoBeca.descripcion.trim(),
      monto: this.newTipoBeca.monto,
      estadoId: this.newTipoBeca.estadoId
    };

    this.http.post<TipoBeca>('http://localhost:3000/api-beca/TipoBeca/add', requestData, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario a valores iniciales seguros
        this.newTipoBeca = {
          nombre: '',
          descripcion: '',
          monto: 0,
          estadoId: 0
        };
        // Recargar lista
        this.cargarTiposBeca();
        alert('Tipo de beca creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir tipo de beca: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
        console.error('Error al crear tipo de beca:', err);
      }
    });
  }

  onCancel() {
    // Resetear formulario a valores iniciales seguros
    this.newTipoBeca = {
      nombre: '',
      descripcion: '',
      monto: 0,
      estadoId: 0
    };
    this.error = '';
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredTiposBeca = [...this.tiposBeca];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredTiposBeca = this.tiposBeca.filter(tipoBeca =>
      tipoBeca.nombre.toLowerCase().includes(term) ||
      tipoBeca.descripcion.toLowerCase().includes(term)
      // Eliminamos la referencia a estadoNombre que no existe
    );
  }

  deleteTipoBeca(id: number) {
    if (confirm('¿Estás seguro de eliminar este tipo de beca?')) {
      this.loading = true;
      this.error = '';

      this.http.delete(`http://localhost:3000/api-beca/TipoBeca/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarTiposBeca();
          alert('Tipo de beca eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar tipo de beca: ' + (err.error?.message || err.message || 'Error desconocido');
          console.error('Error al eliminar tipo de beca:', err);
        }
      });
    }
  }
}
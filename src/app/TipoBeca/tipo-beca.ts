import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TipoBeca {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  estadoId: number;
}

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
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';

  newTipoBeca: NewTipoBecaForm = {
    nombre: '',
    descripcion: '',
    monto: 0,
    estadoId: 0
  };
  searchTerm: string = '';

  selectedTipoBeca: TipoBeca | null = null;

  // Métricas
  totalBeneficiarios: number = 0;
  presupuestoTotal: number = 0;
  activasCount: number = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarTiposBeca();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

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
        this.calculateMetrics();
      },
      error: (err) => {
        this.error = 'Error al cargar tipos de beca: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  private calculateMetrics() {
    this.presupuestoTotal = this.tiposBeca.reduce((sum, tipo) => sum + tipo.monto, 0);
    this.totalBeneficiarios = this.tiposBeca.length; // Contar tipos de beca como "beneficiarios"
    this.activasCount = this.tiposBeca.filter(tipo => tipo.estadoId === 1).length;
  }

  onSubmitNewTipoBeca() {
    if (!this.newTipoBeca.nombre.trim() || !this.newTipoBeca.descripcion.trim() || this.newTipoBeca.monto === null || this.newTipoBeca.monto < 0 || this.newTipoBeca.estadoId === null || this.newTipoBeca.estadoId < 1) {
      this.error = 'Todos los campos son requeridos y deben ser válidos.';
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
        this.successMessage = 'Tipo de beca creado correctamente';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = 'Error al añadir tipo de beca: ' + (err.error?.message || err.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  resetForm() {
    this.newTipoBeca = { nombre: '', descripcion: '', monto: 0, estadoId: 0 };
    this.error = '';
  }

  onCancel() {
    this.resetForm();
  }

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

  deleteTipoBeca(id: number) {
    if (!confirm('¿Estás seguro de eliminar este tipo de beca?')) return;
    this.loading = true;
    this.error = '';
    this.http.delete(`http://localhost:3000/api-beca/tipo-beca/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.loading = false;
          this.cargarTiposBeca();
          this.successMessage = 'Tipo de beca eliminado correctamente';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.error = 'Error al eliminar tipo de beca: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
  }

  openEditModal(tipoBeca: TipoBeca) {
    this.selectedTipoBeca = { ...tipoBeca };
  }

  closeEditModal() {
    this.selectedTipoBeca = null;
  }

  saveEditedTipoBeca() {
    if (!this.selectedTipoBeca) return;
    if (!this.selectedTipoBeca.nombre.trim() || !this.selectedTipoBeca.descripcion.trim() || this.selectedTipoBeca.monto < 0 || this.selectedTipoBeca.estadoId < 1) {
      this.error = 'Todos los campos son requeridos y deben ser válidos.';
      return;
    }

    this.loading = true;
    this.error = '';
    const payload = {
      nombre: this.selectedTipoBeca.nombre.trim(),
      descripcion: this.selectedTipoBeca.descripcion.trim(),
      monto: this.selectedTipoBeca.monto,
      estadoId: this.selectedTipoBeca.estadoId
    };

    this.http.put<TipoBeca>(`http://localhost:3000/api-beca/tipo-beca/${this.selectedTipoBeca.id}`, payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.loading = false;
          this.closeEditModal();
          this.cargarTiposBeca();
          this.successMessage = 'Tipo de beca actualizado correctamente';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.error = 'Error al actualizar tipo de beca: ' + (err.error?.message || err.message || 'Error desconocido');
          this.loading = false;
        }
      });
  }
}

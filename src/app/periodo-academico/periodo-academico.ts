import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces
interface PeriodoAcademico {
  id: number;
  nombre: string;
  anioAcademico: string;
  fechainicio: string;
  fechafin: string;
  estadoId: number;
}

interface CreatePeriodoAcademicoDto {
  nombre: string;
  anioAcademico: string;
  fechainicio: string;
  fechafin: string;
  estadoId: number;
}

@Component({
  selector: 'app-periodo-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periodo-academico.html',
  styleUrls: ['./periodo-academico.scss']
})
export class PeriodoAcademicoComponent implements OnInit {
  periodos: PeriodoAcademico[] = [];
  filteredPeriodos: PeriodoAcademico[] = [];
  error: string = '';
  loading: boolean = false;
  searchTerm: string = '';

  newPeriodo: CreatePeriodoAcademicoDto = {
    nombre: '',
    anioAcademico: '',
    fechainicio: '',
    fechafin: '',
    estadoId: 1
  };

  editingPeriodo: PeriodoAcademico | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarPeriodos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  cargarPeriodos() {
    this.loading = true;
    this.error = '';
    this.http.get<PeriodoAcademico[]>('http://localhost:3000/api-beca/periodo-academico', {
      headers: this.getHeaders()
    }).subscribe({
      next: data => {
        this.periodos = data;
        this.filteredPeriodos = [...this.periodos];
        this.loading = false;
      },
      error: err => {
        this.error = 'Error al cargar períodos académicos';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSubmitNewPeriodo() {
    if (this.editingPeriodo) {
      this.updatePeriodo(this.editingPeriodo.id);
      return;
    }

    if (!this.validarPeriodo(this.newPeriodo)) return;

    this.loading = true;
    this.error = '';

    this.http.post<PeriodoAcademico>(
      'http://localhost:3000/api-beca/periodo-academico/add',
      this.newPeriodo,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loading = false;
        alert('Período académico creado correctamente');
        this.onCancel();
        this.cargarPeriodos();
      },
      error: err => {
        this.error = 'Error al añadir período académico: ' + (err.error?.message || err.message);
        console.error(err);
        this.loading = false;
      }
    });
  }

  updatePeriodo(id: number) {
    if (!this.editingPeriodo) return;
    if (!this.validarPeriodo(this.editingPeriodo)) return;

    this.loading = true;
    this.error = '';

    this.http.put<PeriodoAcademico>(
      `http://localhost:3000/api-beca/periodo-academico/${id}`,
      this.editingPeriodo,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loading = false;
        alert('Período académico actualizado correctamente');
        this.editingPeriodo = null;
        this.onCancel();
        this.cargarPeriodos();
      },
      error: err => {
        this.error = 'Error al actualizar período académico: ' + (err.error?.message || err.message);
        console.error(err);
        this.loading = false;
      }
    });
  }

  editarPeriodo(periodo: PeriodoAcademico) {
    this.editingPeriodo = { ...periodo };
    this.newPeriodo = { ...periodo };
  }

  validarPeriodo(periodo: CreatePeriodoAcademicoDto): boolean {
    if (!periodo.nombre.trim()) { this.error = 'El nombre es requerido'; return false; }
    if (!periodo.anioAcademico.trim()) { this.error = 'El año académico es requerido'; return false; }
    if (!periodo.fechainicio) { this.error = 'La fecha de inicio es requerida'; return false; }
    if (!periodo.fechafin) { this.error = 'La fecha de fin es requerida'; return false; }

    const inicio = new Date(periodo.fechainicio);
    const fin = new Date(periodo.fechafin);
    if (fin < inicio) { this.error = 'La fecha de fin debe ser posterior a la fecha de inicio'; return false; }
    if (!periodo.estadoId || periodo.estadoId < 1) { this.error = 'El ID del estado es requerido'; return false; }

    return true;
  }

  onCancel() {
    this.newPeriodo = {
      nombre: '',
      anioAcademico: '',
      fechainicio: '',
      fechafin: '',
      estadoId: 1
    };
    this.editingPeriodo = null;
    this.error = '';
  }

  onSearch() {
    if (!this.searchTerm.trim()) { this.filteredPeriodos = [...this.periodos]; return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredPeriodos = this.periodos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      p.anioAcademico.toLowerCase().includes(term)
    );
  }

  deletePeriodo(id: number) {
    if (!confirm('¿Estás seguro de eliminar este período académico?')) return;
    this.loading = true;
    this.http.delete(`http://localhost:3000/api-beca/periodo-academico/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => { this.loading = false; this.cargarPeriodos(); alert('Eliminado correctamente'); },
        error: err => { this.loading = false; this.error = 'Error al eliminar período'; console.error(err); }
      });
  }
}

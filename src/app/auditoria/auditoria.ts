// Componente para mostrar auditorías del sistema
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar una auditoría
interface Auditoria {
    id: number;
    tablaAfectada: string;
    accion: string;
    registroId: number;
    usuarioId: number;
    fecha?: string;
    detalles?: string;
}

@Component({
    selector: 'app-auditoria',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './auditoria.html',
    styleUrls: ['./auditoria.scss']
})
export class AuditoriaComponent implements OnInit {
  // Array para almacenar las auditorías
  auditorias: Auditoria[] = [];
  // Array para almacenar auditorías filtradas
  filteredAuditorias: Auditoria[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarAuditorias();
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

  // Método para cargar todas las auditorías desde el backend
  cargarAuditorias() {
    this.loading = true;
    this.error = '';
    this.http.get<Auditoria[]>('http://localhost:3000/api-beca/Auditoria', {
        headers: this.getHeaders()
    }).subscribe({
        next: (data) => {
            this.loading = false;
            this.auditorias = data;
            this.filteredAuditorias = [...this.auditorias];
        },
        error: (err) => {
            this.error = 'Error al cargar auditorías';
            this.loading = false;
            console.error(err);
        }
    });
  }

  // Método para filtrar auditorías según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredAuditorias = [...this.auditorias];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredAuditorias = this.auditorias.filter(auditoria =>
        auditoria.tablaAfectada.toLowerCase().includes(term) ||
        auditoria.accion.toLowerCase().includes(term)
    );
  }
}
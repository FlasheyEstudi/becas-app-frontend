// Componente para gestionar áreas de conocimiento
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definición de la interfaz AreaConocimiento
interface AreaConocimiento {
  id: number;
  nombre: string;
}

// DTO para crear área de conocimiento
interface CreateAreaConocimientoDto {
  nombre: string;
}

@Component({
  selector: 'app-area-conocimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-conocimiento.html',
  styleUrls: ['./area-conocimiento.scss']
})
export class AreaConocimientoComponent implements OnInit {
  // Array para almacenar las áreas de conocimiento
  areas: AreaConocimiento[] = [];
  // Array para almacenar áreas filtradas
  filteredAreas: AreaConocimiento[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para el nuevo área de conocimiento
  newArea: CreateAreaConocimientoDto = {
    nombre: ''
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit() {
    this.cargarAreas();
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

  // Método para cargar todas las áreas de conocimiento desde el backend
  cargarAreas() {
    this.loading = true;
    this.error = '';
    this.http.get<AreaConocimiento[]>('http://localhost:3000/api-beca/AreaConocimiento', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.areas = data;
        this.filteredAreas = [...this.areas];
      },
      error: (err) => {
        this.error = 'Error al cargar áreas de conocimiento';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nueva área
  onSubmitNewArea() {
    // Validaciones
    if (!this.newArea.nombre?.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<AreaConocimiento>('http://localhost:3000/api-beca/AreaConocimiento/add', this.newArea, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newArea = {
          nombre: ''
        };
        // Recargar lista
        this.cargarAreas();
        alert('Área de conocimiento creada correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir área de conocimiento';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nueva área
  onCancel() {
    this.newArea = {
      nombre: ''
    };
    this.error = '';
  }

  // Método para filtrar áreas según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredAreas = [...this.areas];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredAreas = this.areas.filter(area =>
      area.nombre.toLowerCase().includes(term)
    );
  }

  // Método para eliminar un área de conocimiento
  deleteArea(id: number) {
    if (confirm('¿Estás seguro de eliminar esta área de conocimiento?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/AreaConocimiento/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarAreas();
          alert('Área de conocimiento eliminada correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar área de conocimiento';
          console.error(err);
        }
      });
    }
  }
}
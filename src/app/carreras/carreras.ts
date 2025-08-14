// Componente para gestionar carreras
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar una carrera
interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  duracion: number;
  areaConocimientoId: number;
  areaConocimientoNombre?: string;
}

// DTO para crear carrera
interface CreateCarreraDto {
  nombre: string;
  codigo: string;
  duracion: number;
  areaConocimientoId: number;
}

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carreras.html',
  styleUrls: ['./carreras.scss']
})
export class CarrerasComponent implements OnInit {
  // Array para almacenar las carreras
  carreras: Carrera[] = [];
  // Array para almacenar carreras filtradas
  filteredCarreras: Carrera[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para la nueva carrera
  newCarrera: CreateCarreraDto = {
    nombre: '',
    codigo: '',
    duracion: 0,
    areaConocimientoId: 0
  };
  // Término de búsqueda
  searchTerm: string = '';
  // Indicador de generación de código
  isGeneratingCode: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit() {
    this.cargarCarreras();
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

  // Método para cargar todas las carreras desde el backend
  cargarCarreras() {
    this.loading = true;
    this.error = '';
    this.http.get<Carrera[]>('http://localhost:3000/api-beca/carrera', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.carreras = data.map(c => ({
          ...c,
          duracion: Number(c.duracion) || 0
        }));
        this.filteredCarreras = [...this.carreras];
      },
      error: (err) => {
        this.error = 'Error al cargar carreras';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para generar automáticamente un código de carrera
  generateCode() {
    this.isGeneratingCode = true;
    if (!this.newCarrera.nombre?.trim()) {
      this.error = 'Primero ingresa el nombre de la carrera';
      this.isGeneratingCode = false;
      return;
    }
    const nombre = this.newCarrera.nombre.trim().toUpperCase();
    let letras = '';
    if (nombre.length >= 2) {
      letras = nombre.substring(0, 2);
    } else if (nombre.length === 1) {
      letras = nombre + 'X';
    } else {
      letras = 'CA';
    }
    const numeros = Math.floor(100 + Math.random() * 900);
    this.newCarrera.codigo = letras + numeros;
    this.isGeneratingCode = false;
    this.error = '';
  }

  // Método para manejar el envío del formulario de nueva carrera
  onSubmitNewCarrera() {
    // Validaciones
    if (!this.newCarrera.nombre?.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    if (!this.newCarrera.duracion || this.newCarrera.duracion < 1) {
      this.error = 'La duración debe ser válida (mínimo 1 año)';
      return;
    }
    if (!this.newCarrera.areaConocimientoId || this.newCarrera.areaConocimientoId < 1) {
      this.error = 'El ID del área de conocimiento es requerido';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<Carrera>('http://localhost:3000/api-beca/carrera/add', this.newCarrera, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newCarrera = {
          nombre: '',
          codigo: '',
          duracion: 0,
          areaConocimientoId: 0
        };
        // Recargar lista
        this.cargarCarreras();
        alert('Carrera creada correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir carrera';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nueva carrera
  onCancel() {
    this.newCarrera = {
      nombre: '',
      codigo: '',
      duracion: 0,
      areaConocimientoId: 0
    };
    this.error = '';
  }

  // Método para filtrar carreras según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredCarreras = [...this.carreras];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCarreras = this.carreras.filter(carrera =>
      (carrera.nombre && carrera.nombre.toLowerCase().includes(term)) ||
      (carrera.codigo && carrera.codigo.toLowerCase().includes(term)) ||
      (carrera.areaConocimientoNombre && carrera.areaConocimientoNombre.toLowerCase().includes(term))
    );
  }

  // Método para eliminar una carrera
  deleteCarrera(id: number) {
    if (confirm('¿Estás seguro de eliminar esta carrera?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/carrera/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarCarreras();
          alert('Carrera eliminada correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar carrera';
          console.error(err);
        }
      });
    }
  }

  // Método para verificar si un valor es numérico
  isNumber(value: any): boolean {
    return !isNaN(value);
  }
}
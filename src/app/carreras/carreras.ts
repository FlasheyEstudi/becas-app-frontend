import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  duracion: number;
  areaConocimientoId: number;
  areaConocimientoNombre?: string;
}

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
  carreras: Carrera[] = [];
  filteredCarreras: Carrera[] = [];
  error: string = '';
  loading: boolean = false;
  
  newCarrera: CreateCarreraDto = {
    nombre: '',
    codigo: '',
    duracion: 0,
    areaConocimientoId: 0
  };
  
  searchTerm: string = '';
  isGeneratingCode: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarCarreras();
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

  onSubmitNewCarrera() {
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
        this.newCarrera = {
          nombre: '',
          codigo: '',
          duracion: 0,
          areaConocimientoId: 0
        };
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

  onCancel() {
    this.newCarrera = {
      nombre: '',
      codigo: '',
      duracion: 0,
      areaConocimientoId: 0
    };
    this.error = '';
  }

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

  // Método para usar isNaN en el template
  isNumber(value: any): boolean {
    return !isNaN(value);
  }
}

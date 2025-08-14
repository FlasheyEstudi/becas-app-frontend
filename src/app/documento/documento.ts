// Componente para gestionar documentos
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar un documento
interface Documento {
  id: number;
  nombre: string;
  url: string;
  estudianteId: number;
}

// DTO para crear documento
interface CreateDocumentoDto {
  nombre: string;
  url: string;
  estudianteId: number;
}

@Component({
  selector: 'app-documento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documento.html',
  styleUrls: ['./documento.scss']
})
export class DocumentoComponent implements OnInit {
  // Array para almacenar los documentos
  documentos: Documento[] = [];
  // Array para almacenar documentos filtrados
  filteredDocumentos: Documento[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para el nuevo documento
  newDocumento: CreateDocumentoDto = {
    nombre: '',
    url: '',
    estudianteId: 0
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarDocumentos();
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

  // Método para cargar todos los documentos desde el backend
  cargarDocumentos() {
    this.loading = true;
    this.error = '';
    this.http.get<Documento[]>('http://localhost:3000/api-beca/Documento', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.loading = false;
        this.documentos = data;
        this.filteredDocumentos = [...this.documentos];
      },
      error: (err) => {
        this.error = 'Error al cargar documentos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para manejar el envío del formulario de nuevo documento
  onSubmitNewDocumento() {
    // Validaciones
    if (!this.newDocumento.nombre) {
      this.error = 'El nombre es requerido';
      return;
    }
    if (!this.newDocumento.url) {
      this.error = 'La URL es requerida';
      return;
    }
    if (!this.newDocumento.estudianteId || this.newDocumento.estudianteId <= 0) {
      this.error = 'El ID del estudiante es requerido y debe ser válido';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<Documento>('http://localhost:3000/api-beca/Documento/add', this.newDocumento, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newDocumento = {
          nombre: '',
          url: '',
          estudianteId: 0
        };
        // Recargar lista
        this.cargarDocumentos();
        alert('Documento creado correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir documento: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nuevo documento
  onCancel() {
    this.newDocumento = {
      nombre: '',
      url: '',
      estudianteId: 0
    };
    this.error = '';
  }

  // Método para filtrar documentos según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredDocumentos = [...this.documentos];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredDocumentos = this.documentos.filter(documento =>
      documento.nombre.toLowerCase().includes(term) ||
      documento.url.toLowerCase().includes(term)
    );
  }

  // Método para eliminar un documento
  deleteDocumento(id: number) {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/Documento/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarDocumentos();
          alert('Documento eliminado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar documento';
          console.error(err);
        }
      });
    }
  }
}
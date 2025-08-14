// Componente para gestionar notificaciones
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para representar una notificación
interface Notificacion {
    id: number;
    usuarioId: number;
    titulo: string;
    mensaje: string;
    tipo: string;
    leida: boolean;
    fecha?: string;
    link?: string;
}

// DTO para crear notificación
interface CreateNotificacionDto {
    usuarioId: number;
    titulo: string;
    mensaje: string;
    tipo: string;
    leida?: boolean;
    link?: string;
}

@Component({
    selector: 'app-notificacion',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './notificacion.html',
    styleUrls: ['./notificacion.scss']
})
export class NotificacionComponent implements OnInit {
  // Array para almacenar las notificaciones
  notificaciones: Notificacion[] = [];
  // Array para almacenar notificaciones filtradas
  filteredNotificaciones: Notificacion[] = [];
  // Mensaje de error
  error: string = '';
  // Indicador de carga
  loading: boolean = false;
  // Objeto para la nueva notificación
  newNotificacion: CreateNotificacionDto = {
    usuarioId: 0,
    titulo: '',
    mensaje: '',
    tipo: 'sistema',
    leida: false
  };
  // Término de búsqueda
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.cargarNotificaciones();
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

  // Método para cargar todas las notificaciones desde el backend
  cargarNotificaciones() {
    this.loading = true;
    this.error = '';
    this.http.get<Notificacion[]>('http://localhost:3000/api-beca/Notificacion', {
        headers: this.getHeaders()
    }).subscribe({
        next: (data) => {
            this.loading = false;
            this.notificaciones = data;
            this.filteredNotificaciones = [...this.notificaciones];
        },
        error: (err) => {
            this.error = 'Error al cargar notificaciones';
            this.loading = false;
            console.error(err);
        }
    });
  }

  // Método para manejar el envío del formulario de nueva notificación
  onSubmitNewNotificacion() {
    // Validaciones
    if (!this.newNotificacion.usuarioId || this.newNotificacion.usuarioId <= 0) {
      this.error = 'El ID del usuario es requerido y debe ser válido';
      return;
    }
    if (!this.newNotificacion.titulo) {
      this.error = 'El título es requerido';
      return;
    }
    if (!this.newNotificacion.mensaje) {
      this.error = 'El mensaje es requerido';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<Notificacion>('http://localhost:3000/api-beca/Notificacion/add', this.newNotificacion, {
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        // Resetear formulario
        this.newNotificacion = {
          usuarioId: 0,
          titulo: '',
          mensaje: '',
          tipo: 'sistema',
          leida: false
        };
        // Recargar lista
        this.cargarNotificaciones();
        alert('Notificación creada correctamente');
      },
      error: (err) => {
        this.error = 'Error al añadir notificación: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Método para cancelar la creación de nueva notificación
  onCancel() {
    this.newNotificacion = {
      usuarioId: 0,
      titulo: '',
      mensaje: '',
      tipo: 'sistema',
      leida: false
    };
    this.error = '';
  }

  // Método para filtrar notificaciones según término de búsqueda
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredNotificaciones = [...this.notificaciones];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredNotificaciones = this.notificaciones.filter(notificacion =>
        notificacion.titulo.toLowerCase().includes(term) ||
        notificacion.mensaje.toLowerCase().includes(term)
    );
  }

  // Método para eliminar una notificación
  deleteNotificacion(id: number) {
    if (confirm('¿Estás seguro de eliminar esta notificación?')) {
      this.loading = true;
      this.http.delete(`http://localhost:3000/api-beca/Notificacion/${id}`, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          this.loading = false;
          this.cargarNotificaciones();
          alert('Notificación eliminada correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al eliminar notificación';
          console.error(err);
        }
      });
    }
  }
}
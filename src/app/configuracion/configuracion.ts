import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// Interfaces para las entidades
interface Carrera {
  id: number;
  nombre: string;
  areaConocimientoId: number;
  areaConocimiento?: { nombre: string };
  estadoId: number;
  estado?: { nombre: string };
  fechaCreacion: string;
}

interface AreaConocimiento {
  id: number;
  nombre: string;
}

interface Requisito {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
}

interface PeriodoAcademico {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estadoId: number;
  estado?: { nombre: string };
}

interface Estado {
  id: number;
  nombre: string;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.scss']
})
export class ConfiguracionComponent implements OnInit {
  // Datos originales
  carreras: Carrera[] = [];
  areasConocimiento: AreaConocimiento[] = [];
  requisitos: Requisito[] = [];
  periodosAcademicos: PeriodoAcademico[] = [];
  estados: Estado[] = [];
  
  // Datos filtrados
  filteredCarreras: Carrera[] = [];
  filteredAreasConocimiento: AreaConocimiento[] = [];
  filteredRequisitos: Requisito[] = [];
  filteredPeriodosAcademicos: PeriodoAcademico[] = [];
  filteredEstados: Estado[] = [];
  
  // Tabs
  tabs: Tab[] = [
    { id: 'carreras', label: 'Carreras', icon: '🎓' },
    { id: 'areas', label: 'Áreas de Conocimiento', icon: '🧠' },
    { id: 'requisitos', label: 'Requisitos', icon: '📋' },
    { id: 'periodos', label: 'Períodos Académicos', icon: '📅' },
    { id: 'estados', label: 'Estados', icon: '🔄' }
  ];
  
  activeTab = 'carreras';
  
  // Filtros y búsqueda
  searchTerm: string = '';
  filtroEstado: string = '';
  
  // Formularios de nuevo registro
  newCarrera = { nombre: '', areaConocimientoId: undefined as number | undefined, estadoId: 1 };
  newAreaConocimiento = { nombre: '' };
  newRequisito = { nombre: '', descripcion: '', tipo: 'academico' };
  newPeriodoAcademico = { nombre: '', fechaInicio: '', fechaFin: '', estadoId: 1 };
  newEstado = { nombre: '' };
  
  // Estados de carga y mensajes
  loading: boolean = false;
  error: string = '';
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  
  // Modales
  showCarreraModal = false;
  showAreaModal = false;
  showRequisitoModal = false;
  showPeriodoModal = false;
  showEstadoModal = false;
  
  // Edición
  editingCarrera: Carrera | null = null;
  editingArea: AreaConocimiento | null = null;
  editingRequisito: Requisito | null = null;
  editingPeriodo: PeriodoAcademico | null = null;
  editingEstado: Estado | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.cargarDatosConfiguracion();
  }

  // ====== NAVEGACIÓN ENTRE TABS ======
  cambiarPestana(tab: string) { 
    this.activeTab = tab; 
    this.searchTerm = '';
    this.filtroEstado = '';
    this.actualizarListasFiltradas();
  }

  // ====== CARGA DE DATOS ======
  private cargarDatosConfiguracion(): void {
    this.loading = true;
    const headers = this.getHeaders();
    
    forkJoin({
      carreras: this.http.get<Carrera[]>('http://localhost:3000/api-beca/carrera', { headers }),
      areasConocimiento: this.http.get<AreaConocimiento[]>('http://localhost:3000/api-beca/AreaConocimiento', { headers }),
      requisitos: this.http.get<Requisito[]>('http://localhost:3000/api-beca/requisito', { headers }),
      periodosAcademicos: this.http.get<PeriodoAcademico[]>('http://localhost:3000/api-beca/periodo-academico', { headers }),
      estados: this.http.get<Estado[]>('http://localhost:3000/api-beca/estado', { headers })
    }).subscribe({
      next: ({ carreras, areasConocimiento, requisitos, periodosAcademicos, estados }) => {
        this.carreras = carreras || [];
        this.areasConocimiento = areasConocimiento || [];
        this.requisitos = requisitos || [];
        this.periodosAcademicos = periodosAcademicos || [];
        this.estados = estados || [];
        this.actualizarListasFiltradas();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error cargando datos de configuración: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  private actualizarListasFiltradas(): void {
    this.filteredCarreras = [...this.carreras];
    this.filteredAreasConocimiento = [...this.areasConocimiento];
    this.filteredRequisitos = [...this.requisitos];
    this.filteredPeriodosAcademicos = [...this.periodosAcademicos];
    this.filteredEstados = [...this.estados];
  }

  // ====== MODALES Y EDICIÓN ======
  abrirModalCarrera() {
    this.showCarreraModal = true;
    this.editingCarrera = null;
    this.newCarrera = { nombre: '', areaConocimientoId: undefined, estadoId: 1 };
  }

  abrirModalArea() {
    this.showAreaModal = true;
    this.editingArea = null;
    this.newAreaConocimiento = { nombre: '' };
  }

  abrirModalRequisito() {
    this.showRequisitoModal = true;
    this.editingRequisito = null;
    this.newRequisito = { nombre: '', descripcion: '', tipo: 'academico' };
  }

  abrirModalPeriodo() {
    this.showPeriodoModal = true;
    this.editingPeriodo = null;
    this.newPeriodoAcademico = { nombre: '', fechaInicio: '', fechaFin: '', estadoId: 1 };
  }

  abrirModalEstado() {
    this.showEstadoModal = true;
    this.editingEstado = null;
    this.newEstado = { nombre: '' };
  }

  cerrarModales() {
    this.showCarreraModal = false;
    this.showAreaModal = false;
    this.showRequisitoModal = false;
    this.showPeriodoModal = false;
    this.showEstadoModal = false;
  }

  // ====== OPERACIONES CRUD ======
  // Carreras
  guardarCarrera() {
    if (!this.newCarrera.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    
    if (!this.newCarrera.areaConocimientoId) {
      this.error = 'El área de conocimiento es requerida';
      return;
    }

    this.loading = true;
    const headers = this.getHeaders();
    
    if (this.editingCarrera) {
      // Actualizar carrera existente
      this.http.put<Carrera>(`http://localhost:3000/api-beca/carrera/${this.editingCarrera.id}`, this.newCarrera, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Carrera actualizada correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al actualizar carrera';
            this.loading = false;
          }
        });
    } else {
      // Crear nueva carrera
      this.http.post<Carrera>('http://localhost:3000/api-beca/carrera/add', this.newCarrera, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Carrera creada correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al crear carrera';
            this.loading = false;
          }
        });
    }
  }

  editarCarrera(carrera: Carrera) {
    this.editingCarrera = carrera;
    this.newCarrera = {
      nombre: carrera.nombre,
      areaConocimientoId: carrera.areaConocimientoId,
      estadoId: carrera.estadoId
    };
    this.abrirModalCarrera();
  }

  eliminarCarrera(id: number) {
    if (confirm('¿Estás seguro de eliminar esta carrera?')) {
      this.loading = true;
      const headers = this.getHeaders();
      this.http.delete(`http://localhost:3000/api-beca/carrera/${id}`, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Carrera eliminada correctamente';
            this.showSuccessMessage = true;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al eliminar carrera';
            this.loading = false;
          }
        });
    }
  }

  // Áreas de Conocimiento
  guardarArea() {
    if (!this.newAreaConocimiento.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    this.loading = true;
    const headers = this.getHeaders();
    
    if (this.editingArea) {
      // Actualizar área existente
      this.http.put<AreaConocimiento>(`http://localhost:3000/api-beca/AreaConocimiento/${this.editingArea.id}`, this.newAreaConocimiento, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Área de conocimiento actualizada correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al actualizar área de conocimiento';
            this.loading = false;
          }
        });
    } else {
      // Crear nueva área
      this.http.post<AreaConocimiento>('http://localhost:3000/api-beca/AreaConocimiento/add', this.newAreaConocimiento, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Área de conocimiento creada correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al crear área de conocimiento';
            this.loading = false;
          }
        });
    }
  }

  editarArea(area: AreaConocimiento) {
    this.editingArea = area;
    this.newAreaConocimiento = { nombre: area.nombre };
    this.abrirModalArea();
  }

  eliminarArea(id: number) {
    if (confirm('¿Estás seguro de eliminar esta área de conocimiento?')) {
      this.loading = true;
      const headers = this.getHeaders();
      this.http.delete(`http://localhost:3000/api-beca/AreaConocimiento/${id}`, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Área de conocimiento eliminada correctamente';
            this.showSuccessMessage = true;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al eliminar área de conocimiento';
            this.loading = false;
          }
        });
    }
  }

  // Requisitos
  guardarRequisito() {
    if (!this.newRequisito.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    this.loading = true;
    const headers = this.getHeaders();
    
    if (this.editingRequisito) {
      // Actualizar requisito existente
      this.http.put<Requisito>(`http://localhost:3000/api-beca/requisito/${this.editingRequisito.id}`, this.newRequisito, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Requisito actualizado correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al actualizar requisito';
            this.loading = false;
          }
        });
    } else {
      // Crear nuevo requisito
      this.http.post<Requisito>('http://localhost:3000/api-beca/requisito/add', this.newRequisito, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Requisito creado correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al crear requisito';
            this.loading = false;
          }
        });
    }
  }

  editarRequisito(requisito: Requisito) {
    this.editingRequisito = requisito;
    this.newRequisito = { 
      nombre: requisito.nombre, 
      descripcion: requisito.descripcion, 
      tipo: requisito.tipo 
    };
    this.abrirModalRequisito();
  }

  eliminarRequisito(id: number) {
    if (confirm('¿Estás seguro de eliminar este requisito?')) {
      this.loading = true;
      const headers = this.getHeaders();
      this.http.delete(`http://localhost:3000/api-beca/requisito/${id}`, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Requisito eliminado correctamente';
            this.showSuccessMessage = true;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al eliminar requisito';
            this.loading = false;
          }
        });
    }
  }

  // Períodos Académicos
  guardarPeriodo() {
    if (!this.newPeriodoAcademico.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    if (!this.newPeriodoAcademico.fechaInicio) {
      this.error = 'La fecha de inicio es requerida';
      return;
    }

    if (!this.newPeriodoAcademico.fechaFin) {
      this.error = 'La fecha de fin es requerida';
      return;
    }

    this.loading = true;
    const headers = this.getHeaders();
    
    if (this.editingPeriodo) {
      // Actualizar período existente
      this.http.put<PeriodoAcademico>(`http://localhost:3000/api-beca/periodo-academico/${this.editingPeriodo.id}`, this.newPeriodoAcademico, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Período académico actualizado correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al actualizar período académico';
            this.loading = false;
          }
        });
    } else {
      // Crear nuevo período
      this.http.post<PeriodoAcademico>('http://localhost:3000/api-beca/periodo-academico/add', this.newPeriodoAcademico, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Período académico creado correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al crear período académico';
            this.loading = false;
          }
        });
    }
  }

  editarPeriodo(periodo: PeriodoAcademico) {
    this.editingPeriodo = periodo;
    this.newPeriodoAcademico = { 
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      estadoId: periodo.estadoId
    };
    this.abrirModalPeriodo();
  }

  eliminarPeriodo(id: number) {
    if (confirm('¿Estás seguro de eliminar este período académico?')) {
      this.loading = true;
      const headers = this.getHeaders();
      this.http.delete(`http://localhost:3000/api-beca/periodo-academico/${id}`, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Período académico eliminado correctamente';
            this.showSuccessMessage = true;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al eliminar período académico';
            this.loading = false;
          }
        });
    }
  }

  // Estados
  guardarEstado() {
    if (!this.newEstado.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    this.loading = true;
    const headers = this.getHeaders();
    
    if (this.editingEstado) {
      // Actualizar estado existente
      this.http.put<Estado>(`http://localhost:3000/api-beca/estado/${this.editingEstado.id}`, this.newEstado, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Estado actualizado correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al actualizar estado';
            this.loading = false;
          }
        });
    } else {
      // Crear nuevo estado
      this.http.post<Estado>('http://localhost:3000/api-beca/estado/add', this.newEstado, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Estado creado correctamente';
            this.showSuccessMessage = true;
            this.cerrarModales();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al crear estado';
            this.loading = false;
          }
        });
    }
  }

  editarEstado(estado: Estado) {
    this.editingEstado = estado;
    this.newEstado = { nombre: estado.nombre };
    this.abrirModalEstado();
  }

  eliminarEstado(id: number) {
    if (confirm('¿Estás seguro de eliminar este estado?')) {
      this.loading = true;
      const headers = this.getHeaders();
      this.http.delete(`http://localhost:3000/api-beca/estado/${id}`, { headers })
        .subscribe({
          next: () => {
            this.cargarDatosConfiguracion();
            this.successMessage = 'Estado eliminado correctamente';
            this.showSuccessMessage = true;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error al eliminar estado';
            this.loading = false;
          }
        });
    }
  }

  // Mensajes
  cerrarMensajeExito() { 
    this.showSuccessMessage = false; 
    this.successMessage = '';
  }

  // Filtrado
  filtrarCarreras() {
    this.filteredCarreras = this.carreras.filter(carrera => 
      carrera.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (carrera.areaConocimiento?.nombre || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  filtrarAreasConocimiento() {
    this.filteredAreasConocimiento = this.areasConocimiento.filter(area => 
      area.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  filtrarRequisitos() {
    this.filteredRequisitos = this.requisitos.filter(requisito => 
      requisito.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      requisito.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  filtrarPeriodosAcademicos() {
    this.filteredPeriodosAcademicos = this.periodosAcademicos.filter(periodo => 
      periodo.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  filtrarEstados() {
    this.filteredEstados = this.estados.filter(estado => 
      estado.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
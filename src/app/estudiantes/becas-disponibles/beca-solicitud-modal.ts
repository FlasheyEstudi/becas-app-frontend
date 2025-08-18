import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para el modelo del formulario de solicitud
interface SolicitudFormModel {
  estudianteId: number;
  tipoBecaId: number;
  estadoId: number;
  fechaSolicitud: string;
  periodoAcademicoId: number;
  observaciones?: string | null;
  fechaResultado?: string | null;
}

@Component({
  selector: 'app-beca-solicitud-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beca-solicitud-modal.html',
  styleUrls: ['./beca-solicitud-modal.scss']
})
export class BecaSolicitudModalComponent implements OnInit {
  @Input() beca: any = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() solicitarBeca = new EventEmitter<any>();

  solicitudFormModel: SolicitudFormModel = {
    estudianteId: 0,
    tipoBecaId: 0,
    estadoId: 1, // Fijado como "Pendiente"
    fechaSolicitud: new Date().toISOString().split('T')[0],
    periodoAcademicoId: 0,
    observaciones: null,
    fechaResultado: null
  };

  // Datos del estudiante
  estudianteId: number | null = null;
  
  // Datos de configuración
  periodosAcademicos: any[] = [
    { id: 1, nombre: '2023-1' },
    { id: 2, nombre: '2023-2' },
    { id: 3, nombre: '2024-1' },
    { id: 4, nombre: '2024-2' }
  ];

  ngOnInit(): void {
    // Prellenar estudianteId desde el token
    const token = localStorage.getItem('token');
    if (token && this.beca) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.estudianteId = payload.sub || payload.id;
        // Corrección: Asegurar que estudianteId sea number
        this.solicitudFormModel.estudianteId = this.estudianteId || 0;
        this.solicitudFormModel.tipoBecaId = this.beca.id;
        console.log('Datos del estudiante cargados:', this.estudianteId);
      } catch (err) {
        console.error('Error al decodificar token:', err);
      }
    }
  }

  closeModalHandler() {
    this.closeModal.emit();
  }

  onSubmit() {
    // Validación básica
    if (!this.solicitudFormModel.estudianteId || this.solicitudFormModel.estudianteId <= 0) {
      alert('ID de estudiante inválido');
      return;
    }
    
    if (!this.solicitudFormModel.tipoBecaId || this.solicitudFormModel.tipoBecaId <= 0) {
      alert('Debe seleccionar un tipo de beca');
      return;
    }
    
    if (!this.solicitudFormModel.periodoAcademicoId || this.solicitudFormModel.periodoAcademicoId <= 0) {
      alert('Debe seleccionar un período académico');
      return;
    }

    const payload = {
      ...this.solicitudFormModel,
      observaciones: this.solicitudFormModel.observaciones || null,
      fechaResultado: this.solicitudFormModel.fechaResultado || null
    };
    
    console.log('Enviando solicitud desde modal:', payload);
    
    this.solicitarBeca.emit({
      beca: this.beca,
      datos: payload
    });
  }
}